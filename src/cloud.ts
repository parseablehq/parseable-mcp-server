import { createHash } from "node:crypto";
import { LRUCache } from "lru-cache";
import { AuthError } from "./auth.js";

const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000;
const DEFAULT_MAX_ENTRIES = 10_000;
const DEFAULT_TIMEOUT_MS = 10_000;

export interface CloudRouting {
  url: string;
  tenantId: string;
  workspaceId: string;
  workspaceName: string;
  state: string;
  multiTenant: boolean;
}

let routingCache: LRUCache<string, CloudRouting> | undefined;
const inFlight = new Map<string, Promise<CloudRouting>>();

function positiveInt(value: string | undefined, fallback: number): number {
  if (value === undefined) return fallback;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function cache(): LRUCache<string, CloudRouting> {
  if (!routingCache) {
    routingCache = new LRUCache({
      max: positiveInt(process.env.PARSEABLE_CLOUD_CACHE_MAX_ENTRIES, DEFAULT_MAX_ENTRIES),
      ttl: positiveInt(process.env.PARSEABLE_CLOUD_CACHE_TTL_SECONDS, DEFAULT_TTL_MS / 1000) * 1000,
    });
  }
  return routingCache;
}

export function cloudCacheKey(apiKey: string): string {
  return createHash("sha256").update(apiKey).digest("hex");
}

function requiredCloudConfig(): { baseUrl: string; authToken: string; timeoutMs: number } {
  const baseUrl = process.env.PARSEABLE_ORCHESTRATOR_URL?.replace(/\/+$/, "");
  const authToken = process.env.PARSEABLE_CLOUD_AUTH_TOKEN;
  if (!baseUrl || !authToken) {
    throw new AuthError(503, "Parseable Cloud authentication is not configured.");
  }
  let parsed: URL;
  try {
    parsed = new URL(baseUrl);
  } catch {
    throw new AuthError(503, "PARSEABLE_ORCHESTRATOR_URL is invalid.");
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new AuthError(503, "PARSEABLE_ORCHESTRATOR_URL must use http:// or https://.");
  }
  return {
    baseUrl,
    authToken,
    timeoutMs: positiveInt(process.env.PARSEABLE_CLOUD_VALIDATE_TIMEOUT_MS, DEFAULT_TIMEOUT_MS),
  };
}

function requiredString(value: unknown, field: string): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new AuthError(502, `Parseable Cloud validation response is missing ${field}.`);
  }
  return field === "url" ? value.replace(/\/+$/, "") : value;
}

async function fetchCloudRouting(apiKey: string): Promise<CloudRouting> {
  const { baseUrl, authToken, timeoutMs } = requiredCloudConfig();
  let response: Response;
  try {
    response = await fetch(`${baseUrl}/api/v1/cli/apikey/validate`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
        "X-API-Key": apiKey,
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch {
    throw new AuthError(502, "Unable to validate API key with Parseable Cloud.");
  }

  if (response.status === 401) {
    throw new AuthError(401, "Invalid Parseable Cloud API key.");
  }
  if (!response.ok) {
    throw new AuthError(502, `Parseable Cloud validation failed with status ${response.status}.`);
  }

  let body: Record<string, unknown>;
  try {
    body = (await response.json()) as Record<string, unknown>;
  } catch {
    throw new AuthError(502, "Parseable Cloud validation returned invalid JSON.");
  }

  const url = requiredString(body.url, "url");
  try {
    const parsedUrl = new URL(url);
    if (!["http:", "https:"].includes(parsedUrl.protocol)) throw new Error("invalid protocol");
  } catch {
    throw new AuthError(502, "Parseable Cloud validation returned an invalid routing URL.");
  }

  return {
    url,
    tenantId: requiredString(body.tenant_id, "tenant_id"),
    workspaceId: typeof body.workspace_id === "string" ? body.workspace_id : "",
    workspaceName: typeof body.workspace_name === "string" ? body.workspace_name : "",
    state: typeof body.state === "string" ? body.state : "",
    multiTenant: body.multi_tenant === true,
  };
}

export async function resolveCloudRouting(apiKey: string): Promise<CloudRouting> {
  const key = cloudCacheKey(apiKey);
  const cached = cache().get(key);
  if (cached) return cached;

  const pending = inFlight.get(key);
  if (pending) return pending;

  const lookup = fetchCloudRouting(apiKey)
    .then((routing) => {
      cache().set(key, routing);
      return routing;
    })
    .finally(() => inFlight.delete(key));
  inFlight.set(key, lookup);
  return lookup;
}

export function evictCloudRouting(apiKey: string): void {
  routingCache?.delete(cloudCacheKey(apiKey));
}

export function clearCloudRoutingCache(): void {
  routingCache?.clear();
  routingCache = undefined;
  inFlight.clear();
}
