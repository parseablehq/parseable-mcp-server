import { createHash } from "node:crypto";
import { LRUCache } from "lru-cache";
import type { ParseableClient } from "./client.js";

export interface RemoteTool {
  name: string;
  title?: string;
  description?: string;
  inputSchema: {
    type: "object";
    properties?: Record<string, object>;
    required?: string[];
    [key: string]: unknown;
  };
  outputSchema?: {
    type: "object";
    properties?: Record<string, object>;
    required?: string[];
    [key: string]: unknown;
  };
  annotations?: {
    title?: string;
    readOnlyHint?: boolean;
    destructiveHint?: boolean;
    idempotentHint?: boolean;
    openWorldHint?: boolean;
  };
  icons?: Array<{
    src: string;
    mimeType?: string;
    sizes?: string[];
    theme?: "light" | "dark";
  }>;
  execution?: { taskSupport?: "optional" | "required" | "forbidden" };
  _meta?: Record<string, unknown>;
}

interface CacheEntry {
  tools: RemoteTool[];
  etag?: string;
  freshUntil: number;
}

const DEFAULT_TTL_MS = 5 * 60 * 1000;
const STALE_ENTRY_TTL_MS = 24 * 60 * 60 * 1000;
const registryCache = new LRUCache<string, CacheEntry>({
  max: 10_000,
  ttl: STALE_ENTRY_TTL_MS,
});
const inFlight = new Map<string, Promise<RemoteTool[]>>();

function cacheKey(client: ParseableClient): string {
  const identity = `${client.baseUrl}\0${client.tenantId ?? ""}\0${client.apiKey}`;
  return createHash("sha256").update(identity).digest("hex");
}

function validateTool(value: unknown): RemoteTool {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Parseable tool registry contains a non-object tool.");
  }
  const tool = value as Record<string, unknown>;
  if (typeof tool.name !== "string" || tool.name.length === 0) {
    throw new Error("Parseable tool registry contains a tool without a name.");
  }
  if (
    !tool.inputSchema ||
    typeof tool.inputSchema !== "object" ||
    Array.isArray(tool.inputSchema) ||
    (tool.inputSchema as Record<string, unknown>).type !== "object"
  ) {
    throw new Error(`Parseable tool ${tool.name} has an invalid inputSchema.`);
  }
  return tool as unknown as RemoteTool;
}

function validateRegistry(value: unknown): RemoteTool[] {
  if (!value || typeof value !== "object" || !Array.isArray((value as { tools?: unknown }).tools)) {
    throw new Error("Parseable tool registry response must contain a tools array.");
  }
  const tools = (value as { tools: unknown[] }).tools.map(validateTool);
  const names = new Set<string>();
  for (const tool of tools) {
    if (names.has(tool.name)) {
      throw new Error(`Parseable tool registry contains duplicate tool ${tool.name}.`);
    }
    names.add(tool.name);
  }
  return tools;
}

export async function getRemoteTools(client: ParseableClient): Promise<RemoteTool[]> {
  const key = cacheKey(client);
  const cached = registryCache.get(key);
  if (cached && cached.freshUntil > Date.now()) return cached.tools;

  const pending = inFlight.get(key);
  if (pending) return pending;

  const lookup = client
    .fetchToolRegistry(cached?.etag)
    .then((response) => {
      if (response.notModified) {
        if (!cached) throw new Error("Parseable returned 304 without a cached tool registry.");
        const refreshed = {
          ...cached,
          freshUntil: Date.now() + response.maxAgeMs,
        };
        registryCache.set(key, refreshed);
        return refreshed.tools;
      }
      const tools = validateRegistry(response.body);
      registryCache.set(key, {
        tools,
        etag: response.etag,
        freshUntil: Date.now() + response.maxAgeMs,
      });
      return tools;
    })
    .catch((error) => {
      if (error && typeof error === "object" && "status" in error && error.status === 401) {
        registryCache.delete(key);
      }
      throw error;
    })
    .finally(() => inFlight.delete(key));

  inFlight.set(key, lookup);
  return lookup;
}

export function parseCacheMaxAge(value: string | null): number {
  const match = value?.match(/(?:^|,)\s*max-age=(\d+)/i);
  return match ? Number(match[1]) * 1000 : DEFAULT_TTL_MS;
}

export function clearToolRegistryCache(): void {
  registryCache.clear();
  inFlight.clear();
}
