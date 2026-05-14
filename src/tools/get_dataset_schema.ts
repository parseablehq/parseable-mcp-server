import { z } from "zod";
import type { ToolDef } from "./types.js";

const schema = {
  dataset: z.string().min(1).describe("Dataset (log stream) name. Use list_datasets to discover."),
};

export const getDatasetSchema: ToolDef<typeof schema> = {
  name: "get_dataset_schema",
  title: "Get dataset schema",
  description:
    "Get the Arrow schema (columns + types) for a dataset. Run this before writing SQL so you know available columns.",
  inputSchema: schema,
  handler: async (args, { client }) => {
    const dataset = args.dataset as string;
    return await client.getDatasetSchema(dataset);
  },
};
