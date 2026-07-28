import "dotenv/config";

export interface Config {
  url: string;
  apiKey: string;
  tenantId?: string;
  mode?: "cloud" | "self-hosted";
  defaultDataset?: string;
  maxRows: number;
  queryTimeoutMs: number;
}

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

export function loadConfig(): Config {
  return {
    url: required("PARSEABLE_URL").replace(/\/+$/, ""),
    apiKey: required("PARSEABLE_API_KEY"),
    defaultDataset: process.env.PARSEABLE_DEFAULT_DATASET || undefined,
    maxRows: Number(process.env.PARSEABLE_MAX_ROWS ?? 1000),
    queryTimeoutMs: Number(process.env.PARSEABLE_QUERY_TIMEOUT_MS ?? 30000),
  };
}
