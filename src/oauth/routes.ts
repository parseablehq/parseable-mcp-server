import { Hono } from "hono";
import { renderLoginPage, renderPostAuthPage, renderSsoCallbackPage } from "../ui/login.js";
import { renderNoWorkspace, renderWorkspacePicker } from "../ui/picker.js";
import { getClerkConfig, verifyClerkSessionJwt } from "./clerk.js";
import {
  signAccessToken,
  signAuthCode,
  signFlowToken,
  verifyAuthCode,
  verifyFlowToken,
} from "./jwt.js";
import { getOrganization, OrchestratorError } from "./orchestrator.js";

export const oauth = new Hono();

function getPublicBase(): string {
  return (process.env.MCP_PUBLIC_BASE_URL ?? "http://localhost:8787").replace(/\/+$/, "");
}

function readClerkSessionCookie(cookieHeader: string): string | undefined {
  return cookieHeader
    .split(";")
    .map((p) => p.trim())
    .map((p) => {
      const i = p.indexOf("=");
      return i < 0 ? ["", ""] : [p.slice(0, i), p.slice(i + 1)];
    })
    .find(([k]) => k === "__session")?.[1];
}

oauth.get("/.well-known/oauth-authorization-server", (c) => {
  const base = getPublicBase();
  return c.json({
    issuer: base,
    authorization_endpoint: `${base}/oauth/authorize`,
    token_endpoint: `${base}/oauth/token`,
    registration_endpoint: `${base}/oauth/register`,
    response_types_supported: ["code"],
    grant_types_supported: ["authorization_code"],
    code_challenge_methods_supported: ["S256", "plain"],
    token_endpoint_auth_methods_supported: ["none"],
    scopes_supported: ["mcp"],
  });
});

oauth.post("/oauth/register", async (c) => {
  // Dynamic Client Registration (RFC 7591) — stub: every client gets a generated id.
  // We rely on PKCE + redirect_uri whitelist (caller's own URI) for actual security.
  const body = (await c.req.json().catch(() => ({}))) as Record<string, unknown>;
  const redirectUris = Array.isArray(body.redirect_uris) ? body.redirect_uris : [];
  const clientId = `mcp-client-${crypto.randomUUID()}`;
  return c.json(
    {
      client_id: clientId,
      client_id_issued_at: Math.floor(Date.now() / 1000),
      redirect_uris: redirectUris,
      grant_types: ["authorization_code"],
      response_types: ["code"],
      token_endpoint_auth_method: "none",
    },
    201,
  );
});

oauth.get("/oauth/authorize", async (c) => {
  const responseType = c.req.query("response_type");
  const clientId = c.req.query("client_id") ?? "";
  const redirectUri = c.req.query("redirect_uri");
  const state = c.req.query("state") ?? "";
  const codeChallenge = c.req.query("code_challenge");
  const codeChallengeMethod = c.req.query("code_challenge_method");

  if (responseType !== "code") {
    return c.json({ error: "unsupported_response_type" }, 400);
  }
  if (!redirectUri) {
    return c.json({ error: "invalid_request", error_description: "redirect_uri required" }, 400);
  }

  const flowToken = await signFlowToken({
    redirect_uri: redirectUri,
    state,
    client_id: clientId,
    code_challenge: codeChallenge,
    code_challenge_method: codeChallengeMethod,
  });

  const loginUrl = `${getPublicBase()}/login?flow_token=${encodeURIComponent(flowToken)}`;
  return c.redirect(loginUrl, 302);
});

oauth.get("/login", (c) => {
  const flowToken = c.req.query("flow_token");
  if (!flowToken) {
    return c.json({ error: "invalid_request", error_description: "flow_token required" }, 400);
  }
  const { publishableKey } = getClerkConfig();
  const html = renderLoginPage({
    publishableKey,
    flowToken,
    publicBaseUrl: getPublicBase(),
  });
  return c.html(html);
});

// Safety alias: Clerk staging instance has "Sign-in URL" = /signin (matches Prism's
// SPA route). If Clerk-js ever auto-navigates to /signin here, bounce back to /login
// using flow_token stashed in sessionStorage by the prior /login render.
oauth.get("/signin", (c) => {
  return c.html(`<!doctype html><html><head><meta charset="UTF-8"><title>Redirecting…</title></head><body>
<script>
  try {
    var t = sessionStorage.getItem("parseable_mcp_flow_token");
    if (t) { window.location.replace("/login?flow_token=" + encodeURIComponent(t)); }
    else { document.body.innerHTML = "<pre style='color:#f87171;padding:1rem;font-family:system-ui'>Missing flow_token. Restart the OAuth flow from your MCP client.</pre>"; }
  } catch (e) {
    document.body.innerHTML = "<pre style='color:#f87171;padding:1rem;font-family:system-ui'>" + e.message + "</pre>";
  }
</script>
</body></html>`);
});

oauth.get("/sso-callback", (c) => {
  const { publishableKey } = getClerkConfig();
  return c.html(renderSsoCallbackPage({ publishableKey, publicBaseUrl: getPublicBase() }));
});

oauth.get("/post-auth", (c) => {
  return c.html(renderPostAuthPage({ publicBaseUrl: getPublicBase() }));
});

oauth.get("/oauth/callback", async (c) => {
  const flowToken = c.req.query("flow_token");
  if (!flowToken) {
    return c.json({ error: "invalid_request", error_description: "flow_token required" }, 400);
  }

  try {
    await verifyFlowToken(flowToken);
  } catch {
    return c.json(
      { error: "invalid_grant", error_description: "flow_token invalid or expired" },
      400,
    );
  }

  const sessionJwt = readClerkSessionCookie(c.req.header("cookie") ?? "");
  if (!sessionJwt) {
    return c.json(
      { error: "access_denied", error_description: "No Clerk session cookie found." },
      401,
    );
  }

  let clerk: Awaited<ReturnType<typeof verifyClerkSessionJwt>>;
  try {
    clerk = await verifyClerkSessionJwt(sessionJwt);
  } catch (err) {
    return c.json(
      {
        error: "access_denied",
        error_description: `Clerk session verification failed: ${(err as Error).message}`,
      },
      401,
    );
  }

  let org: Awaited<ReturnType<typeof getOrganization>>;
  try {
    org = await getOrganization(clerk.userId, sessionJwt);
  } catch (err) {
    if (err instanceof OrchestratorError) {
      return c.json(
        { error: "server_error", error_description: `Orchestrator: ${err.message}` },
        500,
      );
    }
    throw err;
  }

  const workspaces = org.workspaces ?? [];
  const username = org.username ?? clerk.userId;

  if (workspaces.length === 0) {
    return c.html(renderNoWorkspace({ username }));
  }

  if (workspaces.length === 1) {
    const w = workspaces[0];
    const result = await mintAuthCodeRedirect(flowToken, {
      clerkUserId: clerk.userId,
      clerkSessionId: clerk.sessionId,
      workspaceId: w.workspace_id,
      prismUrl: w.prism_url,
    });
    return c.redirect(result.redirectUrl, 302);
  }

  return c.html(renderWorkspacePicker({ flowToken, workspaces, username }));
});

oauth.post("/oauth/select-workspace", async (c) => {
  const body = await c.req.parseBody();
  const flowToken = body.flow_token as string | undefined;
  const workspaceId = body.workspace_id as string | undefined;

  if (!flowToken || !workspaceId) {
    return c.json(
      { error: "invalid_request", error_description: "flow_token and workspace_id required" },
      400,
    );
  }

  const sessionJwt = readClerkSessionCookie(c.req.header("cookie") ?? "");
  if (!sessionJwt) {
    return c.json({ error: "access_denied", error_description: "No Clerk session" }, 401);
  }

  const clerk = await verifyClerkSessionJwt(sessionJwt);
  const org = await getOrganization(clerk.userId, sessionJwt);
  const workspace = org.workspaces?.find((w) => w.workspace_id === workspaceId);

  if (!workspace) {
    return c.json(
      { error: "invalid_request", error_description: "workspace not found for user" },
      400,
    );
  }
  if (workspace.state !== "running") {
    return c.json(
      {
        error: "invalid_request",
        error_description: `Workspace state is "${workspace.state}", not running.`,
      },
      400,
    );
  }

  const result = await mintAuthCodeRedirect(flowToken, {
    clerkUserId: clerk.userId,
    clerkSessionId: clerk.sessionId,
    workspaceId: workspace.workspace_id,
    prismUrl: workspace.prism_url,
  });
  return c.redirect(result.redirectUrl, 302);
});

oauth.post("/oauth/token", async (c) => {
  const body = await c.req.parseBody();
  const grantType = body.grant_type as string | undefined;
  const code = body.code as string | undefined;
  const redirectUri = body.redirect_uri as string | undefined;
  const codeVerifier = body.code_verifier as string | undefined;

  if (grantType !== "authorization_code") {
    return c.json({ error: "unsupported_grant_type" }, 400);
  }
  if (!code) {
    return c.json({ error: "invalid_request", error_description: "code required" }, 400);
  }

  let claims: Awaited<ReturnType<typeof verifyAuthCode>>;
  try {
    claims = await verifyAuthCode(code);
  } catch {
    return c.json({ error: "invalid_grant", error_description: "code invalid or expired" }, 400);
  }

  if (redirectUri && claims.redirect_uri !== redirectUri) {
    return c.json({ error: "invalid_grant", error_description: "redirect_uri mismatch" }, 400);
  }

  if (claims.code_challenge) {
    if (!codeVerifier) {
      return c.json({ error: "invalid_request", error_description: "code_verifier required" }, 400);
    }
    const verifierOk = await verifyPkce(
      codeVerifier,
      claims.code_challenge,
      claims.code_challenge_method,
    );
    if (!verifierOk) {
      return c.json({ error: "invalid_grant", error_description: "PKCE verification failed" }, 400);
    }
  }

  const accessToken = await signAccessToken({
    sub: claims.sub,
    sid: claims.sid,
    wid: claims.wid,
    url: claims.url,
    scope: claims.scope,
  });

  return c.json({
    access_token: accessToken,
    token_type: "Bearer",
    expires_in: 3600,
    scope: claims.scope ?? "mcp",
  });
});

async function verifyPkce(verifier: string, challenge: string, method?: string): Promise<boolean> {
  if (!method || method === "plain") return verifier === challenge;
  if (method === "S256") {
    const buf = new TextEncoder().encode(verifier);
    const hash = await crypto.subtle.digest("SHA-256", buf);
    const base64Url = Buffer.from(hash)
      .toString("base64")
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");
    return base64Url === challenge;
  }
  return false;
}

async function mintAuthCodeRedirect(
  flowToken: string,
  selection: {
    clerkUserId: string;
    clerkSessionId: string;
    workspaceId: string;
    prismUrl: string;
  },
): Promise<{ redirectUrl: string }> {
  const flow = await verifyFlowToken(flowToken);
  const code = await signAuthCode({
    sub: selection.clerkUserId,
    sid: selection.clerkSessionId,
    wid: selection.workspaceId,
    url: selection.prismUrl,
    redirect_uri: flow.redirect_uri,
    code_challenge: flow.code_challenge,
    code_challenge_method: flow.code_challenge_method,
  });
  const u = new URL(flow.redirect_uri);
  u.searchParams.set("code", code);
  if (flow.state) u.searchParams.set("state", flow.state);
  return { redirectUrl: u.toString() };
}
