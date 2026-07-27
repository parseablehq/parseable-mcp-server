import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { app } from "../src/http.js";

const goodHeaders = {
  "x-parseable-url": "https://parseable.example.com",
  "x-api-key": "secret",
};

function mcpReq(body: unknown, headers: Record<string, string> = goodHeaders): Request {
  return new Request("http://localhost/mcp", {
    method: "POST",
    headers: {
      ...headers,
      "content-type": "application/json",
      accept: "application/json, text/event-stream",
    },
    body: JSON.stringify(body),
  });
}

const initBody = {
  jsonrpc: "2.0",
  id: 1,
  method: "initialize",
  params: {
    protocolVersion: "2024-11-05",
    capabilities: {},
    clientInfo: { name: "test-client", version: "0.0.0" },
  },
};

describe("HTTP routes", () => {
  it("GET /health returns ok", async () => {
    const res = await app.request("/health");
    expect(res.status).toBe(200);
    expect(await res.text()).toBe("ok");
  });

  it("GET / returns plaintext help", async () => {
    const res = await app.request("/");
    expect(res.status).toBe(200);
    const body = await res.text();
    expect(body).toMatch(/Parseable MCP server/);
    expect(body).toMatch(/X-Parseable-URL/);
  });

  it("POST /mcp without auth returns 401", async () => {
    const res = await app.fetch(
      new Request("http://localhost/mcp", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(initBody),
      }),
    );
    expect(res.status).toBe(401);
    const body = (await res.json()) as { error: string };
    expect(body.error).toMatch(/X-Parseable-URL/);
  });

  it("does not accept bearer tokens instead of Parseable credentials", async () => {
    const res = await app.fetch(
      new Request("http://localhost/mcp", {
        method: "POST",
        headers: {
          authorization: "Bearer legacy-oauth-token",
          "content-type": "application/json",
        },
        body: JSON.stringify(initBody),
      }),
    );
    expect(res.status).toBe(401);
    const body = (await res.json()) as { error: string };
    expect(body.error).toMatch(/X-Parseable-URL/);
    expect(body.error).toMatch(/X-API-Key/);
  });

  it("does not expose OAuth discovery", async () => {
    const res = await app.request("/.well-known/oauth-authorization-server");
    expect(res.status).toBe(404);
  });

  it("POST /mcp with private IP returns 400 (SSRF)", async () => {
    const res = await app.fetch(
      mcpReq(initBody, {
        ...goodHeaders,
        "x-parseable-url": "http://127.0.0.1:8000",
      }),
    );
    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: string };
    expect(body.error).toMatch(/private/);
  });

  it("POST /mcp with bad URL returns 400", async () => {
    const res = await app.fetch(
      mcpReq(initBody, {
        ...goodHeaders,
        "x-parseable-url": "not-a-url",
      }),
    );
    expect(res.status).toBe(400);
  });

  it("POST /mcp with non-http(s) protocol returns 400", async () => {
    const res = await app.fetch(
      mcpReq(initBody, {
        ...goodHeaders,
        "x-parseable-url": "ftp://parseable.example.com",
      }),
    );
    expect(res.status).toBe(400);
  });
});

describe("HTTP /mcp with mocked upstream", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    globalThis.fetch = vi.fn().mockImplementation(async () => new Response("[]", { status: 200 }));
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("initialize → returns serverInfo with Parseable title", async () => {
    const res = await app.fetch(mcpReq(initBody));
    expect(res.status).toBe(200);
    const text = await res.text();
    // SSE-encoded response - parse the data line
    const dataLine = text.split("\n").find((l) => l.startsWith("data:"));
    expect(dataLine).toBeDefined();
    const payload = JSON.parse((dataLine as string).slice(5).trim());
    expect(payload.result.serverInfo.title).toBe("Parseable");
    expect(payload.result.serverInfo.name).toBe("parseable-mcp-server");
  });
});
