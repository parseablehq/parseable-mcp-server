import type { ToolDef } from "./types.js";

export const getClusterMetrics: ToolDef = {
  name: "get_cluster_metrics",
  title: "Get cluster metrics",
  description:
    "Get aggregated metrics across all nodes in this Parseable cluster (ingest rate, query latency, storage utilization, errors). Distributed mode only.",
  inputSchema: {},
  handler: async (_args, { client }) => {
    return await client.getClusterMetrics();
  },
};
