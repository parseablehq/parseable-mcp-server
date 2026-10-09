import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  type CallToolResult,
  CallToolResultSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import type { ParseableClient } from "./client.js";
import { PARSEABLE_ICON_DATA_URI } from "./icon.js";
import { getRemoteTools } from "./remote-tools.js";

const SERVER_VERSION = "0.2.16";

function toolError(message: string): CallToolResult {
  return { isError: true, content: [{ type: "text", text: message }] };
}

export function buildMcpServer(client: ParseableClient): Server {
  const server = new Server(
    {
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
    },
    { capabilities: { tools: { listChanged: false } } },
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: await getRemoteTools(client),
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    try {
      const result = await client.callTool(request.params.name, request.params.arguments ?? {});
      if (
        !result ||
        typeof result !== "object" ||
        !("content" in result) ||
        !Array.isArray(result.content)
      ) {
        throw new Error("Parseable tool invocation returned an invalid CallToolResult.");
      }
      return CallToolResultSchema.parse(result);
    } catch (error) {
      return toolError(error instanceof Error ? error.message : String(error));
    }
  });

  return server;
}

export { SERVER_VERSION };
