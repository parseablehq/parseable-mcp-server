import { z } from "zod";
import type { ToolDef } from "./types.js";

const schema = {
  dataset: z.string().min(1).describe("Dataset (log stream) name."),
  limit: z
    .number()
    .int()
    .min(1)
    .max(100)
    .default(10)
    .describe("Number of recent events to return (1-100, default 10)."),
  minutes: z
    .number()
    .int()
    .min(1)
    .max(1440)
    .default(60)
    .describe("How many minutes back to look (1-1440, default 60)."),
};

export const sampleEvents: ToolDef<typeof schema> = {
  name: "sample_events",
  title: "Sample recent events",
  description:
    "Return the most recent N events from a dataset. Useful for understanding the shape of data before writing SQL.",
  inputSchema: schema,
  handler: async (args, { client, config }) => {
    const dataset = args.dataset as string;
    const limit = Math.min(Number(args.limit ?? 10), Math.min(100, config.maxRows));
    const minutes = Number(args.minutes ?? 60);

    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - minutes * 60_000);

    const safeName = dataset.replace(/"/g, '""');
    const query = `SELECT * FROM "${safeName}" ORDER BY p_timestamp DESC LIMIT ${limit}`;

    return await client.query({
      query,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
    });
  },
};
