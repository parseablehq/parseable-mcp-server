import { z } from "zod";
import type { ToolDef } from "./types.js";

const schema = {
  query: z
    .string()
    .min(1)
    .describe(
      'SQL SELECT query. Reference the dataset as a quoted table name, e.g. SELECT * FROM "my_dataset". DataFusion SQL dialect. SELECT only — DDL/DML rejected.',
    ),
  startTime: z
    .string()
    .min(1)
    .describe(
      "Start of time window. RFC3339 (e.g. 2026-05-13T10:00:00Z) or relative (e.g. 1h, 24h, 7d).",
    ),
  endTime: z
    .string()
    .min(1)
    .describe('End of time window. RFC3339 or relative (e.g. now). Use "now" for current time.'),
};

const FORBIDDEN = /\b(INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|TRUNCATE|GRANT|REVOKE|COPY|MERGE)\b/i;
const LIMIT_RE = /\blimit\s+\d+/i;

export const querySql: ToolDef<typeof schema> = {
  name: "query_sql",
  title: "Run SQL query",
  description:
    "Execute a SQL SELECT against a Parseable dataset over a time window. Use this for any analytical question on logs/events. Run get_dataset_schema first to know columns. Time window is mandatory.",
  inputSchema: schema,
  handler: async (args, { client, config }) => {
    let query = String(args.query).trim();
    const startTime = String(args.startTime);
    const endTime = String(args.endTime);

    if (FORBIDDEN.test(query)) {
      throw new Error("Only SELECT queries are allowed. DDL/DML keywords detected.");
    }

    const hadLimit = LIMIT_RE.test(query);
    if (!hadLimit) {
      query = `${query.replace(/;$/, "")} LIMIT ${config.maxRows}`;
    }

    const result = (await client.query({
      query,
      startTime,
      endTime,
    })) as unknown;

    const rows = Array.isArray(result) ? result : [];
    const truncated = !hadLimit && rows.length >= config.maxRows;

    return {
      rows,
      row_count: rows.length,
      truncated,
      effective_query: query,
      time_window: { startTime, endTime },
    };
  },
};
