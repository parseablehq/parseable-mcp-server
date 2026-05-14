import type { ToolDef } from "./types.js";

export const listDatasets: ToolDef = {
  name: "list_datasets",
  title: "List datasets",
  description:
    "List all log datasets (streams) on this Parseable server. Returns an array of dataset metadata. Use this first to discover what data is available.",
  inputSchema: {},
  handler: async (_args, { client }) => {
    return await client.listDatasets();
  },
};
