import type { ToolDef } from "./types.js";

export const listAlertTargets: ToolDef = {
  name: "list_alert_targets",
  title: "List alert targets",
  description:
    "List all alert notification targets (Slack webhooks, generic webhooks, Alertmanager endpoints) configured on this Parseable server. Returns array of `{id, name, type, ...}`. Use BEFORE create_alert so the user can pick valid target IDs for the alert's `targets` array.",
  inputSchema: {},
  handler: async (_args, { client }) => {
    return await client.listTargets();
  },
};
