import type { ToolDef } from "./types.js";

export const listRoles: ToolDef = {
  name: "list_roles",
  title: "List roles",
  description:
    "List all roles defined on this Parseable server. Returns role names. Use get_role on each to inspect privileges. Read-only — this server does not provide role creation/modification.",
  inputSchema: {},
  handler: async (_args, { client }) => {
    return await client.listRoles();
  },
};
