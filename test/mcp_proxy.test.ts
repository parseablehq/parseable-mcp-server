import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { afterEach, describe, expect, it, vi } from "vitest";
import { buildMcpServer } from "../src/bootstrap.js";
import type { ParseableClient } from "../src/client.js";
import { clearToolRegistryCache } from "../src/remote-tools.js";

afterEach(() => {
  clearToolRegistryCache();
  vi.restoreAllMocks();
});

describe("MCP remote tool proxy", () => {
  it("discovers Parseable tools and invokes one end-to-end", async () => {
    const tool = {
      name: "list_datasets",
      title: "List datasets",
      description: "List available datasets.",
      inputSchema: { type: "object" as const, properties: {}, additionalProperties: false },
    };
    const callResult = {
      content: [{ type: "text" as const, text: '[{"name":"logs"}]' }],
      structuredContent: { result: [{ name: "logs" }] },
      isError: false,
    };
    const parseable = {
      baseUrl: "https://parseable.example.com",
      tenantId: undefined,
      apiKey: "key",
      fetchToolRegistry: vi.fn().mockResolvedValue({
        notModified: false,
        body: { tools: [tool] },
        maxAgeMs: 300_000,
      }),
      callTool: vi.fn().mockResolvedValue(callResult),
    } as unknown as ParseableClient;

    const server = buildMcpServer(parseable);
    const client = new Client({ name: "test-client", version: "1.0.0" });
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);

    expect((await client.listTools()).tools).toEqual([tool]);
    expect(await client.callTool({ name: "list_datasets", arguments: {} })).toEqual(callResult);
    expect(parseable.callTool).toHaveBeenCalledWith("list_datasets", {});

    await client.close();
    await server.close();
  });

  it("exposes only core tools and blocks calls outside the core profile", async () => {
    const tools = ["list_datasets", "get_dataset_schema", "query_sql", "create_alert"].map(
      (name) => ({
        name,
        inputSchema: { type: "object" as const, properties: {} },
      }),
    );
    const parseable = {
      baseUrl: "https://parseable.example.com",
      tenantId: undefined,
      apiKey: "key",
      fetchToolRegistry: vi.fn().mockResolvedValue({
        notModified: false,
        body: { tools },
        maxAgeMs: 300_000,
      }),
      callTool: vi.fn(),
    } as unknown as ParseableClient;

    const server = buildMcpServer(parseable, "core");
    const client = new Client({ name: "test-client", version: "1.0.0" });
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);

    expect((await client.listTools()).tools.map((tool) => tool.name)).toEqual([
      "list_datasets",
      "get_dataset_schema",
      "query_sql",
    ]);
    expect(await client.callTool({ name: "create_alert", arguments: {} })).toMatchObject({
      isError: true,
      content: [{ text: expect.stringMatching(/not available in the core tool profile/) }],
    });
    expect(parseable.callTool).not.toHaveBeenCalled();

    await client.close();
    await server.close();
  });

  it("converts invalid upstream results into MCP tool errors", async () => {
    const parseable = {
      baseUrl: "https://parseable.example.com",
      tenantId: undefined,
      apiKey: "key",
      fetchToolRegistry: vi.fn(),
      callTool: vi.fn().mockResolvedValue({ wrong: true }),
    } as unknown as ParseableClient;
    const server = buildMcpServer(parseable);
    const client = new Client({ name: "test-client", version: "1.0.0" });
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);

    expect((await client.callTool({ name: "bad", arguments: {} })).isError).toBe(true);

    await client.close();
    await server.close();
  });
});
