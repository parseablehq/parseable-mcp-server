import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearCloudRoutingCache,
  cloudCacheKey,
  evictCloudRouting,
  resolveCloudRouting,
} from "../src/cloud.js";

const response = {
  workspace_id: "workspace-1",
  workspace_name: "Production",
  tenant_id: "tenant-1",
  url: "https://query.example.com/",
  ingest_url: "https://ingest.example.com/",
  state: "ready",
  multi_tenant: true,
};

describe("cloud API-key resolver", () => {
  const originalFetch = globalThis.fetch;
  const originalEnv = { ...process.env };

  beforeEach(() => {
    clearCloudRoutingCache();
    process.env.PARSEABLE_ORCHESTRATOR_URL = "https://cloud.example.com/";
    process.env.PARSEABLE_CLOUD_AUTH_TOKEN = "service-token";
    process.env.PARSEABLE_CLOUD_CACHE_TTL_SECONDS = "86400";
    globalThis.fetch = vi.fn().mockImplementation(async () => Response.json(response));
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    process.env = { ...originalEnv };
    clearCloudRoutingCache();
    vi.restoreAllMocks();
  });

  it("calls validation endpoint with service bearer and user API key", async () => {
    const routing = await resolveCloudRouting("user-key");
    expect(routing).toMatchObject({
      url: "https://query.example.com",
      tenantId: "tenant-1",
    });
    const [url, init] = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(url).toBe("https://cloud.example.com/api/v1/cli/apikey/validate");
    expect(init.headers.Authorization).toBe("Bearer service-token");
    expect(init.headers["X-API-Key"]).toBe("user-key");
  });

  it("serves repeated lookups from LRU cache", async () => {
    await resolveCloudRouting("user-key");
    await resolveCloudRouting("user-key");
    expect(globalThis.fetch).toHaveBeenCalledOnce();
  });

  it("deduplicates concurrent cache misses", async () => {
    const pending = Promise.resolve(Response.json(response));
    globalThis.fetch = vi.fn().mockReturnValue(pending);
    await Promise.all([
      resolveCloudRouting("same-key"),
      resolveCloudRouting("same-key"),
      resolveCloudRouting("same-key"),
    ]);
    expect(globalThis.fetch).toHaveBeenCalledOnce();
  });

  it("evicts one API key without affecting another", async () => {
    await resolveCloudRouting("key-a");
    await resolveCloudRouting("key-b");
    evictCloudRouting("key-a");
    await resolveCloudRouting("key-a");
    await resolveCloudRouting("key-b");
    expect(globalThis.fetch).toHaveBeenCalledTimes(3);
  });

  it("uses a SHA-256 cache key instead of raw API key", () => {
    const key = cloudCacheKey("super-secret");
    expect(key).toHaveLength(64);
    expect(key).not.toContain("super-secret");
  });

  it("maps invalid API key to 401 and does not cache it", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(new Response("", { status: 401 }));
    await expect(resolveCloudRouting("bad-key")).rejects.toMatchObject({ status: 401 });
    await expect(resolveCloudRouting("bad-key")).rejects.toMatchObject({ status: 401 });
    expect(globalThis.fetch).toHaveBeenCalledTimes(2);
  });

  it("maps upstream failure and malformed routing to 502", async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce(new Response("", { status: 500 }));
    await expect(resolveCloudRouting("key-a")).rejects.toMatchObject({ status: 502 });

    globalThis.fetch = vi.fn().mockResolvedValueOnce(Response.json({ ...response, tenant_id: "" }));
    await expect(resolveCloudRouting("key-b")).rejects.toMatchObject({ status: 502 });
  });

  it("fails with 503 when cloud server configuration is absent", async () => {
    delete process.env.PARSEABLE_CLOUD_AUTH_TOKEN;
    await expect(resolveCloudRouting("user-key")).rejects.toMatchObject({ status: 503 });
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });
});
