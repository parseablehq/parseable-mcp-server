import type { ToolDef } from "./types.js";

export const listAlertTags: ToolDef = {
  name: "list_alert_tags",
  title: "List alert tags",
  description:
    "List all tags currently in use across alerts. Useful for filtering and grouping alerts by service/team/severity.",
  inputSchema: {},
  handler: async (_args, { client }) => {
    return await client.listAlertTags();
  },
};
