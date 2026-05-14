import { z } from "zod";
import type { ToolDef } from "./types.js";

const schema = {
  userid: z.string().min(1).describe("User ID (username). Use list_users to discover."),
};

export const getUserRoles: ToolDef<typeof schema> = {
  name: "get_user_roles",
  title: "Get user roles",
  description:
    "Get the roles assigned to a specific user. Returns a map of role name → role definition. Combine with list_roles + get_role to determine effective permissions for a user (which datasets they can read, write, manage alerts on, etc.).",
  inputSchema: schema,
  handler: async (args, { client }) => {
    return await client.getUserRoles(String(args.userid));
  },
};
