import type { ToolDef } from "./types.js";

export const getClusterStatus: ToolDef = {
  name: "get_cluster_status",
  title: "Get cluster status",
  description:
    "List all nodes in this Parseable cluster (Prism, Querier, Ingestor, Indexer) with their domains, status, and metadata. Only works on distributed Parseable deployments — standalone instances will return an error.",
  inputSchema: {},
  handler: async (_args, { client }) => {
    return await client.getClusterInfo();
  },
};
