import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { buildMcpServer } from "./bootstrap.js";
import { ParseableClient } from "./client.js";
import { loadConfig } from "./config.js";
import { getRemoteTools } from "./remote-tools.js";

export async function startStdio(): Promise<void> {
  const config = loadConfig();
  const client = new ParseableClient(config);
  const discoveredTools = await getRemoteTools(client);
  const server = buildMcpServer(client);
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(
    `parseable-mcp-server connected. ${discoveredTools.length} tools discovered. Target: ${config.url}`,
  );
}
