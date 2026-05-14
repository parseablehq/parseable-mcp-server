import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ParseableClient } from "../src/client.js";
import type { Config } from "../src/config.js";

const config: Config = {
  url: "http://example.test",
  username: "admin",
  password: "pw",
  maxRows: 100,
  queryTimeoutMs: 5000,
};

interface Case {
  name: string;
  call: (c: ParseableClient) => Promise<unknown>;
  method: string;
  path: string | RegExp;
  body?: object;
}

const cases: Case[] = [
  { name: "listDatasets", call: (c) => c.listDatasets(), method: "GET", path: "/api/v1/logstream" },
  {
    name: "getDatasetSchema",
    call: (c) => c.getDatasetSchema("ds"),
    method: "GET",
    path: "/api/v1/logstream/ds/schema",
  },
  {
    name: "getDatasetInfo",
    call: (c) => c.getDatasetInfo("ds"),
    method: "GET",
    path: "/api/v1/logstream/ds/info",
  },
  {
    name: "getDatasetStats",
    call: (c) => c.getDatasetStats("ds"),
    method: "GET",
    path: "/api/v1/logstream/ds/stats",
  },
  {
    name: "query",
    call: (c) => c.query({ query: "SELECT 1", startTime: "1h", endTime: "now" }),
    method: "POST",
    path: "/api/v1/query",
    body: { query: "SELECT 1", startTime: "1h", endTime: "now" },
  },
  { name: "listAlerts", call: (c) => c.listAlerts(), method: "GET", path: "/api/v1/alerts" },
  {
    name: "listAlertTags",
    call: (c) => c.listAlertTags(),
    method: "GET",
    path: "/api/v1/alerts/list_tags",
  },
  { name: "getAlert", call: (c) => c.getAlert("a1"), method: "GET", path: "/api/v1/alerts/a1" },
  {
    name: "createAlert",
    call: (c) => c.createAlert({ title: "t" }),
    method: "POST",
    path: "/api/v1/alerts",
    body: { title: "t" },
  },
  {
    name: "enableAlert",
    call: (c) => c.enableAlert("a1"),
    method: "PATCH",
    path: "/api/v1/alerts/a1/enable",
  },
  {
    name: "disableAlert",
    call: (c) => c.disableAlert("a1"),
    method: "PATCH",
    path: "/api/v1/alerts/a1/disable",
  },
  {
    name: "evaluateAlert",
    call: (c) => c.evaluateAlert("a1"),
    method: "PUT",
    path: "/api/v1/alerts/a1/evaluate_alert",
  },
  { name: "listTargets", call: (c) => c.listTargets(), method: "GET", path: "/api/v1/targets" },
  { name: "getTarget", call: (c) => c.getTarget("t1"), method: "GET", path: "/api/v1/targets/t1" },
  {
    name: "createTarget",
    call: (c) => c.createTarget({ name: "n", type: "slack" }),
    method: "POST",
    path: "/api/v1/targets",
    body: { name: "n", type: "slack" },
  },
  { name: "about", call: (c) => c.about(), method: "GET", path: "/api/v1/about" },
  { name: "liveness", call: (c) => c.liveness(), method: "GET", path: "/api/v1/liveness" },
  { name: "readiness", call: (c) => c.readiness(), method: "GET", path: "/api/v1/readiness" },
  { name: "listUsers", call: (c) => c.listUsers(), method: "GET", path: "/api/v1/user" },
  {
    name: "getUserRoles",
    call: (c) => c.getUserRoles("alice"),
    method: "GET",
    path: "/api/v1/user/alice/role",
  },
  { name: "listRoles", call: (c) => c.listRoles(), method: "GET", path: "/api/v1/roles" },
  { name: "getRole", call: (c) => c.getRole("admin"), method: "GET", path: "/api/v1/role/admin" },
  {
    name: "getDefaultRole",
    call: (c) => c.getDefaultRole(),
    method: "GET",
    path: "/api/v1/role/default",
  },
  {
    name: "getClusterInfo",
    call: (c) => c.getClusterInfo(),
    method: "GET",
    path: "/api/v1/cluster/info",
  },
  {
    name: "getClusterMetrics",
    call: (c) => c.getClusterMetrics(),
    method: "GET",
    path: "/api/v1/cluster/metrics",
  },
  {
    name: "getRetention",
    call: (c) => c.getRetention("ds"),
    method: "GET",
    path: "/api/v1/logstream/ds/retention",
  },
];

describe("ParseableClient methods", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    globalThis.fetch = vi.fn().mockImplementation(async () => new Response("{}", { status: 200 }));
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it.each(cases)("$name → $method $path", async (c) => {
    const client = new ParseableClient(config);
    await c.call(client);
    const fetchMock = globalThis.fetch as ReturnType<typeof vi.fn>;
    const [url, init] = fetchMock.mock.calls[0];
    expect(init.method).toBe(c.method);
    if (typeof c.path === "string") {
      expect(url).toContain(c.path);
    } else {
      expect(url).toMatch(c.path);
    }
    if (c.body !== undefined) {
      expect(JSON.parse(init.body as string)).toEqual(c.body);
    } else {
      expect(init.body).toBeUndefined();
    }
  });
});

describe("PromQL clients (different base path)", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    globalThis.fetch = vi.fn().mockImplementation(async () => new Response("{}", { status: 200 }));
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("promqlInstant uses /prometheus/api/v1/query", async () => {
    const client = new ParseableClient(config);
    await client.promqlInstant({ query: "up", stream: "m", time: "1" });
    const fetchMock = globalThis.fetch as ReturnType<typeof vi.fn>;
    const [url, init] = fetchMock.mock.calls[0];
    expect(init.method).toBe("GET");
    expect(url).toContain("/prometheus/api/v1/query?");
    expect(url).toContain("query=up");
    expect(url).toContain("stream=m");
    expect(url).toContain("time=1");
  });

  it("promqlRange uses /prometheus/api/v1/query_range", async () => {
    const client = new ParseableClient(config);
    await client.promqlRange({
      query: "rate(x[5m])",
      stream: "m",
      start: "1",
      end: "2",
      step: "60s",
    });
    const fetchMock = globalThis.fetch as ReturnType<typeof vi.fn>;
    const [url] = fetchMock.mock.calls[0];
    expect(url).toContain("/prometheus/api/v1/query_range?");
    expect(url).toContain("start=1");
    expect(url).toContain("end=2");
    expect(url).toContain("step=60s");
  });

  it("promql params skip undefined", async () => {
    const client = new ParseableClient(config);
    await client.promqlInstant({ query: "up", stream: "m" });
    const url = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(url).not.toContain("undefined");
    expect(url).not.toContain("time=");
  });
});
