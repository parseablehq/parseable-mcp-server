import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { Hono } from "hono";
import { AuthError, assertNotPrivateUrl, parseAuthHeaders } from "./auth.js";
import { buildMcpServer } from "./bootstrap.js";
import { ParseableClient } from "./client.js";
import { mintClerkSessionToken } from "./oauth/clerk.js";
import { verifyAccessToken } from "./oauth/jwt.js";
import { oauth } from "./oauth/routes.js";

const DEFAULT_PORT = 8787;
const DEFAULT_MAX_ROWS = 1000;
const DEFAULT_QUERY_TIMEOUT_MS = 30_000;

export const app = new Hono();

app.onError((err, c) => {
  console.error("[mcp] unhandled error", err);
  const message = err instanceof Error ? err.message : String(err);
  return c.json({ error: "server_error", error_description: message }, 500);
});

app.use("/*", async (c, next) => {
  const t0 = Date.now();
  await next();
  console.error(
    `[mcp] ${c.req.method} ${c.req.path}${c.req.url.includes("?") ? "?" + c.req.url.split("?")[1] : ""} -> ${c.res.status} (${Date.now() - t0}ms)`,
  );
});

app.get("/health", (c) => c.text("ok"));

// Catch Clerk handshake redirects that may land on unexpected paths
// (Clerk's app config sometimes overrides the redirectUrl we passed to
// authenticateWithRedirect with a dashboard-configured default that has
// no relation to our routes). Detect __clerk_handshake query param and
// serve the SSO callback page from any path so Clerk JS can process the
// handshake + bounce to /post-auth.
app.use("/*", async (c, next) => {
  if (c.req.method === "GET" && c.req.query("__clerk_handshake")) {
    const { renderSsoCallbackPage } = await import("./ui/login.js");
    const { getClerkConfig } = await import("./oauth/clerk.js");
    const { publishableKey } = getClerkConfig();
    const publicBaseUrl = (
      process.env.MCP_PUBLIC_BASE_URL ?? "http://localhost:8787"
    ).replace(/\/+$/, "");
    return c.html(renderSsoCallbackPage({ publishableKey, publicBaseUrl }));
  }
  return next();
});

app.route("/", oauth);

app.get("/", (c) =>
  c.text(
    "Parseable MCP server (HTTP).\n\nAdd as a Claude custom connector — OAuth flow signs you in via Clerk and routes to your Parseable workspace.\n\nFor curl / MCP Inspector testing without OAuth:\nPOST /mcp with headers X-Parseable-URL, X-Parseable-Username, X-Parseable-Password.\n\nhttps://github.com/parseablehq/parseable-mcp-server",
  ),
);

async function buildClerkClient(bearer: string): Promise<{
  client: ParseableClient;
  config: {
    url: string;
    username: string;
    password: string;
    maxRows: number;
    queryTimeoutMs: number;
  };
}> {
  const claims = await verifyAccessToken(bearer);
  const clerkToken = await mintClerkSessionToken(claims.sid);
  const client = new ParseableClient({
    url: claims.url,
    workspaceId: claims.wid,
    clerkSessionToken: clerkToken,
    maxRows: DEFAULT_MAX_ROWS,
    queryTimeoutMs: DEFAULT_QUERY_TIMEOUT_MS,
  });
  return {
    client,
    config: {
      url: claims.url,
      username: claims.sub,
      password: "<clerk-session>",
      maxRows: DEFAULT_MAX_ROWS,
      queryTimeoutMs: DEFAULT_QUERY_TIMEOUT_MS,
    },
  };
}

function buildBasicClient(reqHeaders: Headers): {
  client: ParseableClient;
  config: {
    url: string;
    username: string;
    password: string;
    maxRows: number;
    queryTimeoutMs: number;
  };
} {
  const creds = parseAuthHeaders(reqHeaders);
  assertNotPrivateUrl(creds.url);
  const maxRows = Number(
    reqHeaders.get("X-Parseable-Max-Rows") ?? DEFAULT_MAX_ROWS,
  );
  const queryTimeoutMs = Number(
    reqHeaders.get("X-Parseable-Query-Timeout-Ms") ?? DEFAULT_QUERY_TIMEOUT_MS,
  );
  const config = {
    url: creds.url,
    username: creds.username,
    password: creds.password,
    maxRows,
    queryTimeoutMs,
  };
  return { client: new ParseableClient(config), config };
}

app.post("/mcp", async (c) => {
  try {
    const bearer = c.req
      .header("authorization")
      ?.replace(/^Bearer\s+/i, "")
      .trim();
    const built = bearer
      ? await buildClerkClient(bearer)
      : buildBasicClient(c.req.raw.headers);

    const mcp = buildMcpServer({ client: built.client, config: built.config });

    const transport = new WebStandardStreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    });
    await mcp.connect(transport);
    return await transport.handleRequest(c.req.raw);
  } catch (err) {
    if (err instanceof AuthError) {
      return c.json({ error: err.message }, err.status as 400 | 401);
    }
    const message = err instanceof Error ? err.message : String(err);
    return c.json({ error: message }, 500);
  }
});

export async function startHttpServer(): Promise<void> {
  const port = Number(process.env.PORT ?? DEFAULT_PORT);
  const { serve } = await import("@hono/node-server");
  serve({ fetch: app.fetch, port }, (info) => {
    console.error(`parseable-mcp-server HTTP listening on :${info.port}`);
  });
}
