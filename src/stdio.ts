import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { buildMcpServer } from "./bootstrap.js";
import { ParseableClient } from "./client.js";
import { loadConfig } from "./config.js";
import { tools } from "./tools/index.js";

export async function startStdio(): Promise<void> {
  const config = loadConfig();
  const client = new ParseableClient(config);
  const server = buildMcpServer({ client, config });
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(
    `parseable-mcp-server connected. ${tools.length} tools registered. Target: ${config.url}`,
  );
}
