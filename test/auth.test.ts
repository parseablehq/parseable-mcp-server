import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { AuthError, assertNotPrivateUrl, parseAuthHeaders, parseRequestAuth } from "../src/auth.js";

const goodHeaders = {
  "x-parseable-url": "https://parseable.example.com",
  "x-api-key": "secret",
};

describe("parseAuthHeaders", () => {
  it("accepts a valid Headers instance", () => {
    const h = new Headers();
    h.set("X-Parseable-URL", "https://parseable.example.com");
    h.set("X-API-Key", "secret");
    expect(parseAuthHeaders(h)).toEqual({
      url: "https://parseable.example.com",
      apiKey: "secret",
    });
  });

  it("accepts a record with lowercase keys", () => {
    expect(parseAuthHeaders(goodHeaders)).toEqual({
      url: "https://parseable.example.com",
      apiKey: "secret",
    });
  });

  it("strips trailing slashes from URL", () => {
    const result = parseAuthHeaders({
      ...goodHeaders,
      "x-parseable-url": "https://parseable.example.com///",
    });
    expect(result.url).toBe("https://parseable.example.com");
  });

  it("throws 401 when X-Parseable-URL missing", () => {
    try {
      parseAuthHeaders({ ...goodHeaders, "x-parseable-url": undefined });
      throw new Error("should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(AuthError);
      expect((err as AuthError).status).toBe(401);
      expect((err as AuthError).message).toMatch(/X-Parseable-URL/);
    }
  });

  it("throws 401 when X-API-Key missing", () => {
    try {
      parseAuthHeaders({ ...goodHeaders, "x-api-key": undefined });
      throw new Error("should have thrown");
    } catch (err) {
      expect((err as AuthError).status).toBe(401);
      expect((err as AuthError).message).toMatch(/X-API-Key/);
    }
  });

  it("reports all missing headers in one error", () => {
    try {
      parseAuthHeaders({});
      throw new Error("should have thrown");
    } catch (err) {
      const msg = (err as AuthError).message;
      expect(msg).toMatch(/X-Parseable-URL/);
      expect(msg).toMatch(/X-API-Key/);
    }
  });

  it("throws 400 on malformed URL", () => {
    try {
      parseAuthHeaders({ ...goodHeaders, "x-parseable-url": "not a url" });
      throw new Error("should have thrown");
    } catch (err) {
      expect((err as AuthError).status).toBe(400);
      expect((err as AuthError).message).toMatch(/not a valid URL/);
    }
  });

  it("throws 400 on non-http(s) protocol", () => {
    try {
      parseAuthHeaders({ ...goodHeaders, "x-parseable-url": "ftp://example.com" });
      throw new Error("should have thrown");
    } catch (err) {
      expect((err as AuthError).status).toBe(400);
      expect((err as AuthError).message).toMatch(/http:\/\/ or https:\/\//);
    }
  });
});

describe("parseRequestAuth", () => {
  it("preserves self-hosted behavior when mode is omitted", () => {
    expect(parseRequestAuth(goodHeaders)).toEqual({
      mode: "self-hosted",
      url: "https://parseable.example.com",
      apiKey: "secret",
    });
  });

  it("accepts cloud mode with only API key", () => {
    expect(parseRequestAuth({ "x-parseable-mode": "cloud", "x-api-key": "secret" })).toEqual({
      mode: "cloud",
      apiKey: "secret",
    });
  });

  it("rejects URL in cloud mode", () => {
    expect(() => parseRequestAuth({ ...goodHeaders, "x-parseable-mode": "cloud" })).toThrow(
      /must not be supplied/,
    );
  });

  it("requires URL when self-hosted mode is explicit", () => {
    expect(() =>
      parseRequestAuth({ "x-parseable-mode": "self-hosted", "x-api-key": "secret" }),
    ).toThrow(/X-Parseable-URL/);
  });

  it("rejects unknown mode", () => {
    expect(() => parseRequestAuth({ ...goodHeaders, "x-parseable-mode": "enterprise" })).toThrow(
      /cloud or self-hosted/,
    );
  });

  it("validates an explicit mode before checking credentials", () => {
    try {
      parseRequestAuth({ "x-parseable-mode": "enterprise" });
      throw new Error("should have thrown");
    } catch (err) {
      expect((err as AuthError).status).toBe(400);
      expect((err as AuthError).message).toMatch(/cloud or self-hosted/);
    }
  });
});

describe("assertNotPrivateUrl", () => {
  const saved = process.env.PARSEABLE_MCP_ALLOW_PRIVATE;

  beforeEach(() => {
    delete process.env.PARSEABLE_MCP_ALLOW_PRIVATE;
  });

  afterEach(() => {
    if (saved === undefined) delete process.env.PARSEABLE_MCP_ALLOW_PRIVATE;
    else process.env.PARSEABLE_MCP_ALLOW_PRIVATE = saved;
  });

  it("rejects localhost", () => {
    expect(() => assertNotPrivateUrl("http://localhost:8000")).toThrow(AuthError);
  });

  it("rejects 127.0.0.1", () => {
    expect(() => assertNotPrivateUrl("http://127.0.0.1:8000")).toThrow(AuthError);
  });

  it("rejects 10.0.0.5", () => {
    expect(() => assertNotPrivateUrl("https://10.0.0.5")).toThrow(AuthError);
  });

  it("rejects 172.16.5.5", () => {
    expect(() => assertNotPrivateUrl("https://172.16.5.5")).toThrow(AuthError);
  });

  it("rejects 192.168.1.1", () => {
    expect(() => assertNotPrivateUrl("https://192.168.1.1")).toThrow(AuthError);
  });

  it("rejects 169.254.x (link-local)", () => {
    expect(() => assertNotPrivateUrl("https://169.254.1.1")).toThrow(AuthError);
  });

  it("rejects IPv6 loopback ::1", () => {
    expect(() => assertNotPrivateUrl("http://[::1]:8000")).toThrow(AuthError);
  });

  it("rejects .local hostname", () => {
    expect(() => assertNotPrivateUrl("https://my-server.local")).toThrow(AuthError);
  });

  it("allows public hostname", () => {
    expect(() => assertNotPrivateUrl("https://parseable.example.com")).not.toThrow();
  });

  it("allows public IPv4", () => {
    expect(() => assertNotPrivateUrl("https://1.2.3.4")).not.toThrow();
  });

  it("allows private URL when PARSEABLE_MCP_ALLOW_PRIVATE=true", () => {
    process.env.PARSEABLE_MCP_ALLOW_PRIVATE = "true";
    expect(() => assertNotPrivateUrl("http://localhost:8000")).not.toThrow();
    expect(() => assertNotPrivateUrl("https://192.168.1.1")).not.toThrow();
  });
});
