import { z } from "zod";
import type { ToolDef } from "./types.js";

const schema = {
  query: z
    .string()
    .min(1)
    .describe(
      "SQL SELECT to explain (do not include leading EXPLAIN — added automatically). Same dialect as query_sql.",
    ),
  startTime: z
    .string()
    .min(1)
    .describe("Start of time window. RFC3339 or relative (e.g. 1h, 24h)."),
  endTime: z.string().min(1).describe('End of time window. RFC3339 or "now".'),
};

const FORBIDDEN = /\b(INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|TRUNCATE|GRANT|REVOKE|COPY|MERGE)\b/i;

export const explainQuery: ToolDef<typeof schema> = {
  name: "explain_query",
  title: "Explain SQL query plan",
  description:
    "Run EXPLAIN on a SQL query to see the DataFusion execution plan without executing it. Useful for debugging slow queries, verifying predicate pushdown, and checking partition pruning. Same SELECT-only restriction as query_sql.",
  inputSchema: schema,
  handler: async (args, { client }) => {
    const userSql = String(args.query).trim().replace(/;$/, "");
    if (FORBIDDEN.test(userSql)) {
      throw new Error("Only SELECT queries can be explained. DDL/DML keywords detected.");
    }
    if (/^\s*EXPLAIN\b/i.test(userSql)) {
      throw new Error("Do not prefix the query with EXPLAIN — this tool adds it automatically.");
    }

    const query = `EXPLAIN ${userSql}`;
    return await client.query({
      query,
      startTime: String(args.startTime),
      endTime: String(args.endTime),
    });
  },
};
