import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { buildMcpServer } from "./bootstrap.js";
import { ParseableClient } from "./client.js";
import { loadConfig } from "./config.js";
import { getRemoteTools } from "./remote-tools.js";
import { filterToolsForProfile } from "./tool-profile.js";

export async function startStdio(): Promise<void> {
  const config = loadConfig();
  const client = new ParseableClient(config);
  const discoveredTools = filterToolsForProfile(config.toolProfile, await getRemoteTools(client));
  const server = buildMcpServer(client, config.toolProfile);
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(
    `parseable-mcp-server connected. ${discoveredTools.length} ${config.toolProfile} profile tools exposed. Target: ${config.url}`,
  );
}
