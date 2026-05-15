#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { ParseableClient, ParseableError } from "./client.js";
import { loadConfig } from "./config.js";
import { PARSEABLE_ICON_DATA_URI } from "./icon.js";
import { tools } from "./tools/index.js";
import { errorResult, jsonResult } from "./tools/types.js";

async function main() {
  if (process.argv[2] === "init") {
    const { runInit } = await import("./init.js");
    await runInit();
    return;
  }

  const config = loadConfig();
  const client = new ParseableClient(config);
  const ctx = { client, config };

  const server = new McpServer({
    name: "parseable-mcp-server",
    title: "Parseable",
    version: "0.2.4",
    description:
      "Talk to Parseable from your AI client. Query logs (SQL + PromQL), manage alerts, audit RBAC.",
    websiteUrl: "https://www.parseable.com",
    icons: [
      {
        src: PARSEABLE_ICON_DATA_URI,
        mimeType: "image/svg+xml",
        sizes: ["any"],
      },
    ],
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
