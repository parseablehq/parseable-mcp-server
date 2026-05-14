import { z } from "zod";
import type { ToolDef } from "./types.js";

function toEpoch(v: unknown): string | undefined {
  if (v === undefined || v === null || v === "") return undefined;
  const s = String(v).trim();
  if (/^\d+(\.\d+)?$/.test(s)) return s;
  const ms = Date.parse(s);
  if (Number.isNaN(ms)) {
    throw new Error(
      `Invalid timestamp: ${s}. Use unix epoch seconds or RFC3339 (e.g. 2026-05-13T10:00:00Z).`,
    );
  }
  return String(Math.floor(ms / 1000));
}

const schema = {
  query: z
    .string()
    .min(1)
    .describe(
      "PromQL expression, e.g. rate(http_requests_total[5m]) or sum by (status) (http_requests_total).",
    ),
  stream: z
    .string()
    .min(1)
    .describe("Metrics dataset (log stream) name in Parseable, e.g. otel_metrics."),
  start: z
    .string()
    .optional()
    .describe(
      "Range query start. Unix epoch seconds (e.g. 1747123200) or RFC3339 (auto-converted to epoch). If start+end provided → range query. Omit for instant query.",
    ),
  end: z
    .string()
    .optional()
    .describe("Range query end. Unix epoch seconds or RFC3339 (auto-converted)."),
  step: z
    .string()
    .optional()
    .describe(
      "Range query resolution, e.g. 60s, 5m, 1h. Defaults to Parseable default if omitted on range query.",
    ),
  time: z
    .string()
    .optional()
    .describe(
      "Instant query evaluation timestamp. Unix epoch seconds or RFC3339 (auto-converted). Defaults to now.",
    ),
  timeout: z.string().optional().describe("Query timeout seconds (default 120)."),
  limit: z.string().optional().describe("Max data points to return."),
  timestamp_format: z
    .enum(["rfc3339", "unix"])
    .optional()
    .describe("Output timestamp format. Default unix epoch."),
};

export const queryPromql: ToolDef<typeof schema> = {
  name: "query_promql",
  title: "Run PromQL query",
  description:
    "Execute a PromQL query against a Parseable metrics dataset. Pass start+end+step for a range query (time series), or omit them for an instant query (single point). Requires a metrics dataset name in `stream`.",
  inputSchema: schema,
  handler: async (args, { client }) => {
    const query = String(args.query);
    const stream = String(args.stream);
    const start = toEpoch(args.start);
    const end = toEpoch(args.end);
    const step = args.step ? String(args.step) : undefined;
    const time = toEpoch(args.time);
    const timeout = args.timeout ? String(args.timeout) : undefined;
    const limit = args.limit ? String(args.limit) : undefined;
    const timestamp_format = args.timestamp_format ? String(args.timestamp_format) : undefined;

    if (start && end) {
      return await client.promqlRange({
        query,
        stream,
        start,
        end,
        step,
        timeout,
        limit,
        timestamp_format,
      });
    }

    return await client.promqlInstant({
      query,
      stream,
      time,
      timeout,
      limit,
      timestamp_format,
    });
  },
};
