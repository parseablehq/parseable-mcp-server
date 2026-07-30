import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ParseableError } from "./client.js";
import { PARSEABLE_ICON_DATA_URI } from "./icon.js";
import { tools } from "./tools/index.js";
import type { ToolContext } from "./tools/types.js";
import { errorResult, jsonResult } from "./tools/types.js";

const SERVER_VERSION = "0.2.11";

export function buildMcpServer(ctx: ToolContext): McpServer {
  const server = new McpServer({
    name: "parseable-mcp-server",
    title: "Parseable",
    version: SERVER_VERSION,
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

  return server;
}

export { SERVER_VERSION };
