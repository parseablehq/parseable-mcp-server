import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ParseableClient, ParseableError, parseErrorBody } from "../src/client.js";
import type { Config } from "../src/config.js";

const config: Config = {
  url: "https://parseable.example.com/",
  apiKey: "secret",
  tenantId: "tenant-1",
  queryTimeoutMs: 5000,
};

describe("ParseableClient tool APIs", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("fetches registry with auth, tenant, and ETag", async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue(
      Response.json(
        { tools: [] },
        {
          headers: {
            etag: '"catalog-1"',
            "cache-control": "private, max-age=300, must-revalidate",
          },
        },
      ),
    );
    const result = await new ParseableClient(config).fetchToolRegistry('"old"');

    expect(globalThis.fetch).toHaveBeenCalledWith(
      "https://parseable.example.com/api/prism/v1/llm/tools/list",
      expect.objectContaining({
        headers: expect.objectContaining({
          "X-API-Key": "secret",
          "x-p-tenant": "tenant-1",
          "If-None-Match": '"old"',
        }),
      }),
    );
    expect(result).toMatchObject({ notModified: false, etag: '"catalog-1"', maxAgeMs: 300_000 });
  });

  it("handles registry 304", async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue(
      new Response(null, { status: 304, headers: { "cache-control": "max-age=60" } }),
    );
    await expect(new ParseableClient(config).fetchToolRegistry('"same"')).resolves.toEqual({
      notModified: true,
      maxAgeMs: 60_000,
    });
  });

  it("posts tool call and forwards MCP result", async () => {
    const upstream = {
      content: [{ type: "text", text: "[]" }],
      structuredContent: { result: [] },
      isError: false,
    };
    vi.mocked(globalThis.fetch).mockResolvedValue(Response.json(upstream));

    const result = await new ParseableClient(config).callTool("list_datasets", {});
    expect(result).toEqual(upstream);
    const [, init] = vi.mocked(globalThis.fetch).mock.calls[0];
    expect(init?.method).toBe("POST");
    expect(JSON.parse(init?.body as string)).toEqual({
      name: "list_datasets",
      arguments: {},
    });
  });

  it("forwards structured 4xx tool rejection", async () => {
    const rejection = {
      content: [{ type: "text", text: "unknown tool" }],
      structuredContent: { error: { message: "unknown tool" } },
      isError: true,
    };
    vi.mocked(globalThis.fetch).mockResolvedValue(Response.json(rejection, { status: 404 }));
    await expect(new ParseableClient(config).callTool("missing", {})).resolves.toEqual(rejection);
  });

  it("evicts upstream auth state on 401", async () => {
    const onUnauthorized = vi.fn();
    vi.mocked(globalThis.fetch).mockResolvedValue(
      Response.json(
        { content: [{ type: "text", text: "expired" }], isError: true },
        { status: 401 },
      ),
    );
    await new ParseableClient(config, { onUnauthorized }).callTool("list_datasets", {});
    expect(onUnauthorized).toHaveBeenCalledOnce();
  });

  it("rejects invalid registry JSON", async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue(new Response("<html>bad</html>"));
    await expect(new ParseableClient(config).fetchToolRegistry()).rejects.toBeInstanceOf(
      ParseableError,
    );
  });
});

describe("parseErrorBody", () => {
  it("extracts JSON errors and truncates text", () => {
    expect(parseErrorBody('{"message":"bad"}')).toBe("bad");
    expect(parseErrorBody("x".repeat(1000))).toHaveLength(500);
  });
});
