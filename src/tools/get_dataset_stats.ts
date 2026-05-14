import { z } from "zod";
import type { ToolDef } from "./types.js";

const schema = {
  dataset: z.string().min(1).describe("Dataset (log stream) name."),
};

export const getDatasetStats: ToolDef<typeof schema> = {
  name: "get_dataset_stats",
  title: "Get dataset stats",
  description:
    "Get event count, ingested bytes, and storage (compressed) bytes for a dataset. Useful for cost and volume audits.",
  inputSchema: schema,
  handler: async (args, { client }) => {
    const dataset = args.dataset as string;
    return await client.getDatasetStats(dataset);
  },
};
