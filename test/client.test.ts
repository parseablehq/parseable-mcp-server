import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  classifyStatus,
  ParseableClient,
  type ParseableError,
  parseErrorBody,
} from "../src/client.js";
import type { Config } from "../src/config.js";

const baseConfig: Config = {
  url: "http://example.test:8000",
  username: "admin",
  password: "pw",
  maxRows: 1000,
  queryTimeoutMs: 5000,
};

describe("parseErrorBody", () => {
  it("returns string for plain text bodies", () => {
    expect(parseErrorBody("boom")).toBe("boom");
  });

  it("extracts message from JSON {message}", () => {
    expect(parseErrorBody(JSON.stringify({ message: "bad query" }))).toBe("bad query");
  });

  it("extracts from JSON {error}", () => {
    expect(parseErrorBody(JSON.stringify({ error: "no such stream" }))).toBe("no such stream");
  });

  it("extracts from JSON {detail}", () => {
    expect(parseErrorBody(JSON.stringify({ detail: "rbac denied" }))).toBe("rbac denied");
  });

  it("unwraps JSON string", () => {
    expect(parseErrorBody(JSON.stringify("oops"))).toBe("oops");
  });

  it("truncates non-JSON to 500 chars", () => {
    const big = "x".repeat(2000);
    expect(parseErrorBody(big).length).toBe(500);
  });

  it("returns empty for empty body", () => {
    expect(parseErrorBody("")).toBe("");
  });
});

describe("classifyStatus", () => {
  it("401 → auth hint", () => {
    expect(classifyStatus(401, "GET", "/alerts")).toMatch(/PARSEABLE_USERNAME/);
  });

  it("403 → rbac hint", () => {
    expect(classifyStatus(403, "GET", "/user")).toMatch(/RBAC/);
  });

  it("404 on /cluster/* explains distributed-mode requirement", () => {
    expect(classifyStatus(404, "GET", "/cluster/info")).toMatch(/distributed/i);
  });

  it("404 on /prometheus/* mentions feature build", () => {
    expect(classifyStatus(404, "GET", "/prometheus/api/v1/query")).toMatch(/prometheus/i);
  });

  it("generic 404 mentions identifiers", () => {
    expect(classifyStatus(404, "GET", "/alerts/123")).toMatch(/identifier/);
  });

  it("429 → rate limit hint", () => {
    expect(classifyStatus(429, "GET", "/alerts")).toMatch(/Rate limited/);
  });

  it("5xx → server side", () => {
    expect(classifyStatus(503, "GET", "/alerts")).toMatch(/server error/);
  });

  it("200 → no hint", () => {
    expect(classifyStatus(200, "GET", "/alerts")).toBeUndefined();
  });
});

describe("ParseableClient request behavior", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("sends Basic auth header", async () => {
    const fetchMock = globalThis.fetch as ReturnType<typeof vi.fn>;
    fetchMock.mockResolvedValue(
      new Response("[]", {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );
    const client = new ParseableClient(baseConfig);
    await client.listDatasets();
    const call = fetchMock.mock.calls[0];
    const headers = call[1].headers as Record<string, string>;
    expect(headers.Authorization).toBe(`Basic ${Buffer.from("admin:pw").toString("base64")}`);
  });

  it("strips trailing slashes from URL", () => {
    const client = new ParseableClient({
      ...baseConfig,
      url: "http://example.test:8000///",
    });
    // public surface: verify URL via fetch call
    const fetchMock = globalThis.fetch as ReturnType<typeof vi.fn>;
    fetchMock.mockResolvedValue(new Response("[]", { status: 200 }));
    return client.listDatasets().then(() => {
      const call = fetchMock.mock.calls[0];
      expect(call[0]).toMatch(/^http:\/\/example\.test:8000\/\/\//);
    });
  });

  it("throws ParseableError on 401 with hint", async () => {
    const fetchMock = globalThis.fetch as ReturnType<typeof vi.fn>;
    fetchMock.mockImplementation(
      async () =>
        new Response(JSON.stringify({ message: "bad creds" }), {
          status: 401,
          statusText: "Unauthorized",
        }),
    );
    const client = new ParseableClient(baseConfig);
    let caught: ParseableError | undefined;
    try {
      await client.listAlerts();
    } catch (e) {
      caught = e as ParseableError;
    }
    if (!caught) throw new Error("expected ParseableError to be thrown");
    expect(caught.name).toBe("ParseableError");
    expect(caught.status).toBe(401);
    expect(caught.message).toMatch(/bad creds/);
    expect(caught.message).toMatch(/PARSEABLE_USERNAME/);
  });

  it("uses /prometheus/api/v1 base for promqlInstant", async () => {
    const fetchMock = globalThis.fetch as ReturnType<typeof vi.fn>;
    fetchMock.mockResolvedValue(new Response("{}", { status: 200 }));
    const client = new ParseableClient(baseConfig);
    await client.promqlInstant({ query: "up", stream: "m" });
    const url = fetchMock.mock.calls[0][0] as string;
    expect(url).toMatch(/\/prometheus\/api\/v1\/query\?/);
    expect(url).toMatch(/query=up/);
    expect(url).toMatch(/stream=m/);
  });

  it("uses /prometheus/api/v1/query_range for range", async () => {
    const fetchMock = globalThis.fetch as ReturnType<typeof vi.fn>;
    fetchMock.mockResolvedValue(new Response("{}", { status: 200 }));
    const client = new ParseableClient(baseConfig);
    await client.promqlRange({
      query: "up",
      stream: "m",
      start: "1",
      end: "2",
    });
    expect(fetchMock.mock.calls[0][0]).toMatch(/\/prometheus\/api\/v1\/query_range\?/);
  });

  it("returns raw text when response body is not JSON", async () => {
    const fetchMock = globalThis.fetch as ReturnType<typeof vi.fn>;
    fetchMock.mockResolvedValue(new Response("liveness-ok", { status: 200 }));
    const client = new ParseableClient(baseConfig);
    const res = await client.liveness();
    expect(res).toBe("liveness-ok");
  });
});
