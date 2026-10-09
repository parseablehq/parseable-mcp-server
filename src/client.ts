import type { Config } from "./config.js";

export class ParseableError extends Error {
  constructor(
    public status: number,
    public body: string,
    message: string,
    public hint?: string,
  ) {
    super(message);
    this.name = "ParseableError";
  }
}

export function parseErrorBody(body: string): string {
  if (!body) return "";
  try {
    const parsed = JSON.parse(body);
    if (typeof parsed === "string") return parsed;
    if (parsed && typeof parsed === "object") {
      const value = parsed as Record<string, unknown>;
      const message = value.message ?? value.error ?? value.detail ?? value.reason;
      if (typeof message === "string" && message.length > 0) return message;
    }
  } catch {
    // Plain-text error body.
  }
  return body.slice(0, 500);
}

export function classifyStatus(status: number, _method: string, path: string): string | undefined {
  if (status === 401) return "Authentication failed. Check PARSEABLE_API_KEY.";
  if (status === 403) {
    return "Authorized but not permitted. The user lacks the required RBAC action for this endpoint.";
  }
  if (status === 404) {
    if (path.startsWith("/cluster/")) {
      return "Cluster endpoints only exist on distributed Parseable deployments (query/coordinator mode).";
    }
    return "Resource not found. Check the tool name or referenced resource.";
  }
  if (status === 408 || status === 504) return "Server timed out. Try again.";
  if (status === 429) return "Rate limited. Back off and retry.";
  if (status >= 500) return "Parseable returned a server error. Check Parseable logs.";
  return undefined;
}

export class ParseableClient {
  public readonly apiKey: string;
  public readonly baseUrl: string;
  public readonly tenantId?: string;
  private readonly queryTimeoutMs: number;
  private readonly onUnauthorized?: () => void;

  constructor(opts: Config, hooks: { onUnauthorized?: () => void } = {}) {
    this.baseUrl = opts.url.replace(/\/+$/, "");
    this.queryTimeoutMs = opts.queryTimeoutMs;
    this.apiKey = opts.apiKey;
    this.tenantId = opts.tenantId;
    this.onUnauthorized = hooks.onUnauthorized;
  }

  private headers(): Record<string, string> {
    return {
      "X-API-Key": this.apiKey,
      ...(this.tenantId ? { "x-p-tenant": this.tenantId } : {}),
      "Content-Type": "application/json",
      Accept: "application/json",
    };
  }

  private async fetch(path: string, init: RequestInit): Promise<Response> {
    try {
      return await fetch(`${this.baseUrl}/api/prism/v1${path}`, {
        ...init,
        signal: AbortSignal.timeout(this.queryTimeoutMs),
      });
    } catch (error) {
      const cause = error as Error & { code?: string; cause?: { code?: string } };
      if (cause.name === "TimeoutError" || cause.name === "AbortError") {
        throw new Error(`Parseable request timed out after ${this.queryTimeoutMs}ms.`);
      }
      const code = cause.code ?? cause.cause?.code;
      if (code === "ECONNREFUSED") {
        throw new Error(`Connection refused to ${this.baseUrl}. Is Parseable reachable?`);
      }
      if (code === "ENOTFOUND") {
        throw new Error(`DNS lookup failed for ${this.baseUrl}. Check PARSEABLE_URL.`);
      }
      throw error;
    }
  }

  async fetchToolRegistry(
    etag?: string,
  ): Promise<
    | { notModified: true; maxAgeMs: number }
    | { notModified: false; body: unknown; etag?: string; maxAgeMs: number }
  > {
    const { parseCacheMaxAge } = await import("./remote-tools.js");
    const response = await this.fetch("/llm/tools/list", {
      headers: { ...this.headers(), ...(etag ? { "If-None-Match": etag } : {}) },
    });
    const maxAgeMs = parseCacheMaxAge(response.headers.get("cache-control"));
    if (response.status === 304) return { notModified: true, maxAgeMs };

    const text = await response.text();
    if (!response.ok) {
      if (response.status === 401) this.onUnauthorized?.();
      throw this.responseError(response, "GET", "/llm/tools/list", text);
    }
    let body: unknown;
    try {
      body = JSON.parse(text);
    } catch {
      throw new ParseableError(502, text, "Parseable tool registry returned invalid JSON.");
    }
    return {
      notModified: false,
      body,
      etag: response.headers.get("etag") ?? undefined,
      maxAgeMs,
    };
  }

  async callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
    const response = await this.fetch("/llm/tools/call", {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify({ name, arguments: args }),
    });
    const text = await response.text();
    if (response.status === 401) this.onUnauthorized?.();
    try {
      return JSON.parse(text);
    } catch {
      throw this.responseError(response, "POST", "/llm/tools/call", text);
    }
  }

  private responseError(response: Response, method: string, path: string, body: string) {
    const parsed = parseErrorBody(body);
    const hint = classifyStatus(response.status, method, path);
    return new ParseableError(
      response.status,
      body,
      `Parseable ${method} ${path} → ${response.status} ${response.statusText}${parsed ? `\n${parsed}` : ""}${hint ? `\nHint: ${hint}` : ""}`,
      hint,
    );
  }
}
