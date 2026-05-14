import { z } from "zod";
import type { ToolDef } from "./types.js";

const schema = {
  dataset: z.string().min(1).describe("Dataset (log stream) name. Use list_datasets to discover."),
};

export const getRetention: ToolDef<typeof schema> = {
  name: "get_retention",
  title: "Get dataset retention policy",
  description:
    "Get the retention policy for a dataset — how long data is kept before being deleted, and any tiering rules. Read-only; modification stays in the Parseable UI.",
  inputSchema: schema,
  handler: async (args, { client }) => {
    return await client.getRetention(String(args.dataset));
  },
};
