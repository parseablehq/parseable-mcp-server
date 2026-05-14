import { z } from "zod";
import type { ToolDef } from "./types.js";

const schema = {
  name: z.string().min(1).describe("Role name. Use list_roles to discover."),
};

export const getRole: ToolDef<typeof schema> = {
  name: "get_role",
  title: "Get role",
  description:
    "Get the full privilege definition for a role: which actions (Ingest, Query, GetStream, PutAlert, etc.) the role grants, and which datasets each privilege applies to. Use to answer 'does role X let me write to dataset Y?' style questions.",
  inputSchema: schema,
  handler: async (args, { client }) => {
    return await client.getRole(String(args.name));
  },
};
