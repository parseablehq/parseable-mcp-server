import type { ToolDef } from "./types.js";

export const listUsers: ToolDef = {
  name: "list_users",
  title: "List users",
  description:
    "List all registered users on this Parseable server. Returns user IDs and basic metadata. Caller must have ListUser permission. Read-only — this server does not provide user creation/deletion.",
  inputSchema: {},
  handler: async (_args, { client }) => {
    return await client.listUsers();
  },
};
