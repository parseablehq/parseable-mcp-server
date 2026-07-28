import { existsSync, readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { type Context, Hono } from "hono";
import { AuthError, assertNotPrivateUrl, parseRequestAuth } from "./auth.js";
import { buildMcpServer } from "./bootstrap.js";
import { ParseableClient } from "./client.js";
import { evictCloudRouting, resolveCloudRouting } from "./cloud.js";
import type { Config } from "./config.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const UI_DIR = join(__dirname, "ui");

const DEFAULT_PORT = 8787;
const DEFAULT_MAX_ROWS = 1000;
const DEFAULT_QUERY_TIMEOUT_MS = 30_000;
const HELP_TEXT = `Parseable MCP server

HTTP MCP endpoint:
  POST /mcp

Required headers for static Parseable credentials:
  X-API-Key
  X-Parseable-Mode: cloud (cloud only; omitted means self-hosted)
  X-Parseable-URL (required when mode is omitted/self-hosted)
`;

export const app = new Hono();

app.onError((err, c) => {
  console.error("[mcp] unhandled error", err);
  const message = err instanceof Error ? err.message : String(err);
  return c.json({ error: "server_error", error_description: message }, 500);
});

app.use("/*", async (c, next) => {
  const t0 = Date.now();
  await next();
  const query = c.req.url.includes("?") ? `?${c.req.url.split("?")[1]}` : "";
  console.error(
    `[mcp] ${c.req.method} ${c.req.path}${query} -> ${c.res.status} (${Date.now() - t0}ms)`,
  );
});

app.get("/health", (c) => c.text("ok"));
app.get("/readyz", (c) => c.text("ok"));

// Cache the injected index.html - built once at first request, reused after.
let _indexHtmlCache: string | null = null;

function buildIndexHtml(): string {
  const indexPath = join(UI_DIR, "index.html");
  if (!existsSync(indexPath)) return "";
  return readFileSync(indexPath, "utf-8");
}

function serveRoot(c: Context) {
  if (!_indexHtmlCache) {
    _indexHtmlCache = buildIndexHtml();
  }
  if (!_indexHtmlCache) {
    return c.text(HELP_TEXT);
  }
  return c.html(_indexHtmlCache);
}

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
  return new Response(buf, {
    headers: { "Content-Type": mime[ext] ?? "application/octet-stream" },
  });
});

app.get("/", serveRoot);

async function buildApiKeyClient(reqHeaders: Headers): Promise<{
  client: ParseableClient;
  config: Config;
}> {
  const auth = parseRequestAuth(reqHeaders);
  const maxRows = Number(reqHeaders.get("X-Parseable-Max-Rows") ?? DEFAULT_MAX_ROWS);
  const queryTimeoutMs = Number(
    reqHeaders.get("X-Parseable-Query-Timeout-Ms") ?? DEFAULT_QUERY_TIMEOUT_MS,
  );

  if (auth.mode === "cloud") {
    const routing = await resolveCloudRouting(auth.apiKey);
    const config: Config = {
      url: routing.url,
      tenantId: routing.tenantId,
      mode: "cloud",
      apiKey: auth.apiKey,
      maxRows,
      queryTimeoutMs,
    };
    return {
      client: new ParseableClient(config, {
        onUnauthorized: () => evictCloudRouting(auth.apiKey),
      }),
      config,
    };
  }

  assertNotPrivateUrl(auth.url);
  const config: Config = {
    url: auth.url,
    apiKey: auth.apiKey,
    mode: "self-hosted",
    maxRows,
    queryTimeoutMs,
  };
  return { client: new ParseableClient(config), config };
}

async function handleMcpPost(c: Context) {
  try {
    const built = await buildApiKeyClient(c.req.raw.headers);

    const mcp = buildMcpServer({ client: built.client, config: built.config });

    const transport = new WebStandardStreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    });
    await mcp.connect(transport);
    return await transport.handleRequest(c.req.raw);
  } catch (err) {
    if (err instanceof AuthError) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: err.status,
        headers: { "Content-Type": "application/json" },
      });
    }
    const message = err instanceof Error ? err.message : String(err);
    return c.json({ error: message }, 500);
  }
}

app.post("/mcp", handleMcpPost);

export async function startHttpServer(): Promise<void> {
  const port = Number(process.env.PORT ?? DEFAULT_PORT);
  const { serve } = await import("@hono/node-server");
  const server = serve({ fetch: app.fetch, port }, (info) => {
    console.error(`parseable-mcp-server HTTP listening on :${info.port}`);
  });

  const shutdown = () => {
    console.error("[mcp] shutting down gracefully");
    server.close(() => {
      console.error("[mcp] server closed");
      process.exit(0);
    });
    // Force exit if connections don't drain within 10s
    setTimeout(() => process.exit(1), 10_000).unref();
  };

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}
