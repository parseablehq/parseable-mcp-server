import "dotenv/config";

export interface Config {
  url: string;
  username: string;
  password: string;
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
    username: required("PARSEABLE_USERNAME"),
    password: required("PARSEABLE_PASSWORD"),
    defaultDataset: process.env.PARSEABLE_DEFAULT_DATASET || undefined,
    maxRows: Number(process.env.PARSEABLE_MAX_ROWS ?? 1000),
    queryTimeoutMs: Number(process.env.PARSEABLE_QUERY_TIMEOUT_MS ?? 30000),
  };
}
