#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { ParseableClient, ParseableError } from "./client.js";
import { loadConfig } from "./config.js";
import { tools } from "./tools/index.js";
import { errorResult, jsonResult } from "./tools/types.js";

async function main() {
  const config = loadConfig();
  const client = new ParseableClient(config);
  const ctx = { client, config };

  const server = new McpServer({
    name: "parseable-mcp-server",
    version: "0.1.0",
  });

  for (const tool of tools) {
    const handler = async (args: Record<string, unknown>) => {
      try {
        const data = await tool.handler(args, ctx);
        return jsonResult(data);
      } catch (err) {
        if (err instanceof ParseableError) {
          return errorResult(`${err.message}\n\nResponse body:\n${err.body}`);
        }
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    };

    // Cast avoids deep generic instantiation across the dynamic tool list.
    (
      server.registerTool as unknown as (
        n: string,
        c: Record<string, unknown>,
        cb: typeof handler,
      ) => unknown
    )(
      tool.name,
      {
        title: tool.title,
        description: tool.description,
        inputSchema: tool.inputSchema,
      },
      handler,
    );
  }

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(
    `parseable-mcp-server connected. ${tools.length} tools registered. Target: ${config.url}`,
  );
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
