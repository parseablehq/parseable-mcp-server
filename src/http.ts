import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { type Context, Hono } from "hono";
import { AuthError, assertNotPrivateUrl, parseAuthHeaders } from "./auth.js";
import { buildMcpServer } from "./bootstrap.js";
import { ParseableClient } from "./client.js";
import { getClerkConfig, mintClerkSessionToken } from "./oauth/clerk.js";
import { verifyAccessToken } from "./oauth/jwt.js";
import { oauth } from "./oauth/routes.js";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { readFile } from "fs/promises";
import { existsSync, readFileSync } from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const UI_DIR = join(__dirname, "ui");

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

// Cache the injected index.html — built once at first request, reused after.
let _indexHtmlCache: string | null = null;

function buildIndexHtml(): string {
  const indexPath = join(UI_DIR, "index.html");
  if (!existsSync(indexPath)) return "";
  const { publishableKey } = getClerkConfig();
  const publicBaseUrl = (process.env.MCP_PUBLIC_BASE_URL ?? `http://localhost:${process.env.PORT ?? DEFAULT_PORT}`).replace(/\/+$/, "");
  // Escape </script> to prevent XSS if key ever contains it
  const config = JSON.stringify({ publishableKey, publicBaseUrl }).replace(/<\/script>/gi, "<\\/script>");
  return readFileSync(indexPath, "utf-8").replace("__PARSEABLE_CONFIG_PLACEHOLDER__", config);
}

function serveIndex(c: Context) {
  if (!_indexHtmlCache) {
    _indexHtmlCache = buildIndexHtml();
  }
  if (!_indexHtmlCache) {
    return c.text("UI not built. Run: npm run build:ui", 503);
  }
  return c.html(_indexHtmlCache);
}

// Catch Clerk handshake redirects on any path
app.use("/*", async (c, next) => {
  if (c.req.method === "GET" && c.req.query("__clerk_handshake")) {
    return serveIndex(c);
  }
  return next();
});

// UI page routes → serve React SPA
app.get("/login", serveIndex);
app.get("/sso-callback", serveIndex);
app.get("/post-auth", serveIndex);
app.get("/pick-workspace", serveIndex);

// Static assets for the React build (JS/CSS/etc)
app.get("/assets/*", async (c) => {
  const filePath = join(UI_DIR, c.req.path);
  if (!existsSync(filePath)) return c.notFound();
  const ext = filePath.split(".").pop() ?? "";
  const mime: Record<string, string> = {
    js: "application/javascript",
    css: "text/css",
    svg: "image/svg+xml",
    png: "image/png",
    ico: "image/x-icon",
    woff2: "font/woff2",
    woff: "font/woff",
  };
  const buf = await readFile(filePath);
  return new Response(buf, { headers: { "Content-Type": mime[ext] ?? "application/octet-stream" } });
});

app.route("/", oauth);

app.get("/", serveIndex);

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

app.post("/", async (c) => {
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
