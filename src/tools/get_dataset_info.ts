import { z } from "zod";
import type { ToolDef } from "./types.js";

const schema = {
  dataset: z.string().min(1).describe("Dataset (log stream) name."),
};

export const getDatasetInfo: ToolDef<typeof schema> = {
  name: "get_dataset_info",
  title: "Get dataset info",
  description:
    "Get metadata for a dataset: created_at, first/last event time, owner, retention, hot-tier config, time partition.",
  inputSchema: schema,
  handler: async (args, { client }) => {
    const dataset = args.dataset as string;
    return await client.getDatasetInfo(dataset);
  },
};
