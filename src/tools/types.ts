import type { ZodRawShape } from "zod";
import type { ParseableClient } from "../client.js";
import type { Config } from "../config.js";

export interface ToolContext {
  client: ParseableClient;
  config: Config;
}

export interface ToolDef<Args extends ZodRawShape = ZodRawShape> {
  name: string;
  title: string;
  description: string;
  inputSchema: Args;
  handler: (args: Record<string, unknown>, ctx: ToolContext) => Promise<unknown>;
}

export function jsonResult(data: unknown) {
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(data, null, 2),
      },
    ],
  };
}

export function errorResult(message: string) {
  return {
    isError: true,
    content: [{ type: "text" as const, text: message }],
  };
}
