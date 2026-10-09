import { afterEach, describe, expect, it, vi } from "vitest";
import type { ParseableClient } from "../src/client.js";
import { clearToolRegistryCache, getRemoteTools, parseCacheMaxAge } from "../src/remote-tools.js";

function mockClient(fetchToolRegistry: ReturnType<typeof vi.fn>, apiKey = "key") {
  return {
    baseUrl: "https://parseable.example.com",
    tenantId: "tenant",
    apiKey,
    fetchToolRegistry,
  } as unknown as ParseableClient;
}

const registry = {
  tools: [
    {
      name: "list_datasets",
      title: "List datasets",
      description: "List datasets.",
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
    },
  ],
};

afterEach(() => {
  clearToolRegistryCache();
  vi.restoreAllMocks();
});

describe("remote tool registry", () => {
  it("validates and caches registry per credential scope", async () => {
    const fetchRegistry = vi.fn().mockResolvedValue({
      notModified: false,
      body: registry,
      etag: '"v1"',
      maxAgeMs: 300_000,
    });
    const client = mockClient(fetchRegistry);

    expect(await getRemoteTools(client)).toEqual(registry.tools);
    expect(await getRemoteTools(client)).toEqual(registry.tools);
    expect(fetchRegistry).toHaveBeenCalledOnce();
  });

  it("deduplicates concurrent registry requests", async () => {
    const fetchRegistry = vi.fn().mockResolvedValue({
      notModified: false,
      body: registry,
      maxAgeMs: 300_000,
    });
    const client = mockClient(fetchRegistry);
    await Promise.all([getRemoteTools(client), getRemoteTools(client), getRemoteTools(client)]);
    expect(fetchRegistry).toHaveBeenCalledOnce();
  });

  it("revalidates stale registries with ETag", async () => {
    const fetchRegistry = vi
      .fn()
      .mockResolvedValueOnce({
        notModified: false,
        body: registry,
        etag: '"v1"',
        maxAgeMs: 0,
      })
      .mockResolvedValueOnce({ notModified: true, maxAgeMs: 300_000 });
    const client = mockClient(fetchRegistry);

    await getRemoteTools(client);
    expect(await getRemoteTools(client)).toEqual(registry.tools);
    expect(fetchRegistry).toHaveBeenNthCalledWith(2, '"v1"');
  });

  it("rejects duplicate names and invalid schemas", async () => {
    const duplicate = { tools: [registry.tools[0], registry.tools[0]] };
    await expect(
      getRemoteTools(
        mockClient(
          vi.fn().mockResolvedValue({
            notModified: false,
            body: duplicate,
            maxAgeMs: 300_000,
          }),
        ),
      ),
    ).rejects.toThrow(/duplicate/);

    clearToolRegistryCache();
    await expect(
      getRemoteTools(
        mockClient(
          vi.fn().mockResolvedValue({
            notModified: false,
            body: { tools: [{ name: "bad", inputSchema: { type: "string" } }] },
            maxAgeMs: 300_000,
          }),
        ),
      ),
    ).rejects.toThrow(/inputSchema/);
  });

  it("parses max-age with safe fallback", () => {
    expect(parseCacheMaxAge("private, max-age=42, must-revalidate")).toBe(42_000);
    expect(parseCacheMaxAge(null)).toBe(300_000);
  });
});
