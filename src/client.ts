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
    const j = JSON.parse(body);
    if (typeof j === "string") return j;
    if (j && typeof j === "object") {
      const o = j as Record<string, unknown>;
      const msg = o.message ?? o.error ?? o.detail ?? o.reason;
      if (typeof msg === "string" && msg.length > 0) return msg;
    }
  } catch {
    // not JSON, fall through
  }
  return body.slice(0, 500);
}

export function classifyStatus(status: number, _method: string, path: string): string | undefined {
  if (status === 401) {
    return "Authentication failed. Check PARSEABLE_USERNAME / PARSEABLE_PASSWORD.";
  }
  if (status === 403) {
    return "Authorized but not permitted. The user lacks the required RBAC action for this endpoint.";
  }
  if (status === 404) {
    if (path.startsWith("/cluster/")) {
      return "Cluster endpoints only exist on distributed Parseable deployments (query/coordinator mode). Standalone instances do not have /cluster/* routes.";
    }
    if (path.startsWith("/prometheus/")) {
      return "PromQL endpoints may require a Parseable build with the prometheus feature enabled. Verify your server version.";
    }
    return "Resource not found. Check the dataset name, alert ID, or other identifier in the path.";
  }
  if (status === 408 || status === 504) {
    return "Server timed out. Try a shorter time window or smaller query.";
  }
  if (status === 429) {
    return "Rate limited. Parseable defaults to 100 req/min/IP — back off and retry.";
  }
  if (status >= 500) {
    return "Parseable returned a server error. Check Parseable logs; this is likely not a config issue on the MCP side.";
  }
  return undefined;
}

export class ParseableClient {
  private authHeader: string;

  constructor(private config: Config) {
    const token = Buffer.from(`${config.username}:${config.password}`).toString("base64");
    this.authHeader = `Basic ${token}`;
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
    opts: { basePath?: string; query?: Record<string, string> } = {},
  ): Promise<T> {
    const base = opts.basePath ?? "/api/v1";
    const qs = opts.query ? `?${new URLSearchParams(opts.query).toString()}` : "";
    const url = `${this.config.url}${base}${path}${qs}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.config.queryTimeoutMs);

    try {
      const res = await fetch(url, {
        method,
        headers: {
          Authorization: this.authHeader,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: body !== undefined ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      const text = await res.text();
      if (!res.ok) {
        const parsed = parseErrorBody(text);
        const hint = classifyStatus(res.status, method, path);
        const head = `Parseable ${method} ${path} → ${res.status} ${res.statusText}`;
        const detail = parsed ? `\n${parsed}` : "";
        const hintLine = hint ? `\nHint: ${hint}` : "";
        throw new ParseableError(res.status, text, `${head}${detail}${hintLine}`, hint);
      }
      if (!text) return undefined as T;
      try {
        return JSON.parse(text) as T;
      } catch {
        return text as unknown as T;
      }
    } catch (err) {
      if (err instanceof ParseableError) throw err;
      if ((err as Error).name === "AbortError") {
        throw new Error(
          `Parseable request timed out after ${this.config.queryTimeoutMs}ms: ${method} ${path}. Try a shorter time window or raise PARSEABLE_QUERY_TIMEOUT_MS.`,
        );
      }
      const e = err as NodeJS.ErrnoException & { cause?: { code?: string } };
      const code = e.code ?? e.cause?.code;
      if (code === "ECONNREFUSED") {
        throw new Error(
          `Connection refused to ${this.config.url}. Is Parseable running and reachable from this machine?`,
        );
      }
      if (code === "ENOTFOUND") {
        throw new Error(`DNS lookup failed for ${this.config.url}. Check PARSEABLE_URL.`);
      }
      if (code === "CERT_HAS_EXPIRED" || code === "UNABLE_TO_VERIFY_LEAF_SIGNATURE") {
        throw new Error(
          `TLS certificate problem talking to ${this.config.url}: ${code}. Use a trusted cert or http:// for local testing.`,
        );
      }
      throw err;
    } finally {
      clearTimeout(timeout);
    }
  }

  listDatasets() {
    return this.request<unknown>("GET", "/logstream");
  }

  getDatasetSchema(name: string) {
    return this.request<unknown>("GET", `/logstream/${encodeURIComponent(name)}/schema`);
  }

  getDatasetInfo(name: string) {
    return this.request<unknown>("GET", `/logstream/${encodeURIComponent(name)}/info`);
  }

  getDatasetStats(name: string) {
    return this.request<unknown>("GET", `/logstream/${encodeURIComponent(name)}/stats`);
  }

  query(payload: { query: string; startTime: string; endTime: string; sendNull?: boolean }) {
    return this.request<unknown>("POST", "/query", payload);
  }

  promqlInstant(params: {
    query: string;
    stream: string;
    time?: string;
    timeout?: string;
    limit?: string;
    timestamp_format?: string;
  }) {
    return this.request<unknown>("GET", "/query", undefined, {
      basePath: "/prometheus/api/v1",
      query: this.stringMap(params),
    });
  }

  promqlRange(params: {
    query: string;
    stream: string;
    start: string;
    end: string;
    step?: string;
    timeout?: string;
    limit?: string;
    timestamp_format?: string;
  }) {
    return this.request<unknown>("GET", "/query_range", undefined, {
      basePath: "/prometheus/api/v1",
      query: this.stringMap(params),
    });
  }

  listAlerts() {
    return this.request<unknown>("GET", "/alerts");
  }

  listAlertTags() {
    return this.request<unknown>("GET", "/alerts/list_tags");
  }

  getAlert(id: string) {
    return this.request<unknown>("GET", `/alerts/${encodeURIComponent(id)}`);
  }

  createAlert(spec: unknown) {
    return this.request<unknown>("POST", "/alerts", spec);
  }

  enableAlert(id: string) {
    return this.request<unknown>("PATCH", `/alerts/${encodeURIComponent(id)}/enable`);
  }

  disableAlert(id: string) {
    return this.request<unknown>("PATCH", `/alerts/${encodeURIComponent(id)}/disable`);
  }

  evaluateAlert(id: string) {
    return this.request<unknown>("PUT", `/alerts/${encodeURIComponent(id)}/evaluate_alert`);
  }

  listTargets() {
    return this.request<unknown>("GET", "/targets");
  }

  getTarget(id: string) {
    return this.request<unknown>("GET", `/targets/${encodeURIComponent(id)}`);
  }

  createTarget(spec: unknown) {
    return this.request<unknown>("POST", "/targets", spec);
  }

  about() {
    return this.request<unknown>("GET", "/about");
  }

  liveness() {
    return this.request<unknown>("GET", "/liveness");
  }

  readiness() {
    return this.request<unknown>("GET", "/readiness");
  }

  listUsers() {
    return this.request<unknown>("GET", "/user");
  }

  getUserRoles(userid: string) {
    return this.request<unknown>("GET", `/user/${encodeURIComponent(userid)}/role`);
  }

  listRoles() {
    return this.request<unknown>("GET", "/roles");
  }

  getRole(name: string) {
    return this.request<unknown>("GET", `/role/${encodeURIComponent(name)}`);
  }

  getDefaultRole() {
    return this.request<unknown>("GET", "/role/default");
  }

  getClusterInfo() {
    return this.request<unknown>("GET", "/cluster/info");
  }

  getClusterMetrics() {
    return this.request<unknown>("GET", "/cluster/metrics");
  }

  getRetention(dataset: string) {
    return this.request<unknown>("GET", `/logstream/${encodeURIComponent(dataset)}/retention`);
  }

  private stringMap(o: Record<string, unknown>): Record<string, string> {
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(o)) {
      if (v !== undefined && v !== null) out[k] = String(v);
    }
    return out;
  }
}
