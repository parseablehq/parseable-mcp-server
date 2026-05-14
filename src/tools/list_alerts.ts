import type { ToolDef } from "./types.js";

export const listAlerts: ToolDef = {
  name: "list_alerts",
  title: "List alerts",
  description:
    "List all alerts on this Parseable server with their IDs, names, state (enabled/disabled), severity, and last evaluation. Use first to discover what alerts exist before drilling in with get_alert.",
  inputSchema: {},
  handler: async (_args, { client }) => {
    return await client.listAlerts();
  },
};
