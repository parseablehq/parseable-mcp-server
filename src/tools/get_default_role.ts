import type { ToolDef } from "./types.js";

export const getDefaultRole: ToolDef = {
  name: "get_default_role",
  title: "Get default role",
  description:
    "Get the default role assigned to new users on this Parseable server. Returns the role name, or null if no default is set.",
  inputSchema: {},
  handler: async (_args, { client }) => {
    return await client.getDefaultRole();
  },
};
