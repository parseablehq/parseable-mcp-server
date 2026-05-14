import { describe, expect, it, vi } from "vitest";
import type { Config } from "../src/config.js";
import { explainQuery } from "../src/tools/explain_query.js";
import { queryPromql } from "../src/tools/query_promql.js";
import { querySql } from "../src/tools/query_sql.js";
import type { ToolContext } from "../src/tools/types.js";

const config: Config = {
  url: "http://example.test",
  username: "admin",
  password: "pw",
  maxRows: 100,
  queryTimeoutMs: 5000,
};

function makeCtx(stubs: Partial<Record<string, ReturnType<typeof vi.fn>>>): ToolContext {
  const client = {
    query: vi.fn().mockResolvedValue([]),
    promqlInstant: vi.fn().mockResolvedValue({}),
    promqlRange: vi.fn().mockResolvedValue({}),
    ...stubs,
  };
  return { client: client as unknown as ToolContext["client"], config };
}

describe("query_sql", () => {
  it("rejects DDL", async () => {
    const ctx = makeCtx({});
    await expect(
      querySql.handler({ query: "DROP TABLE x", startTime: "1h", endTime: "now" }, ctx),
    ).rejects.toThrow(/SELECT.*allowed/i);
  });

  it("rejects each forbidden keyword", async () => {
    const ctx = makeCtx({});
    const kw = [
      "INSERT INTO x VALUES (1)",
      "UPDATE x SET y=1",
      "DELETE FROM x",
      "ALTER TABLE x",
      "CREATE TABLE x",
      "TRUNCATE x",
      "GRANT ALL",
      "REVOKE ALL",
      "MERGE INTO x",
    ];
    for (const q of kw) {
      await expect(
        querySql.handler({ query: q, startTime: "1h", endTime: "now" }, ctx),
      ).rejects.toThrow(/SELECT.*allowed/i);
    }
  });

  it("auto-injects LIMIT when missing", async () => {
    const ctx = makeCtx({});
    await querySql.handler({ query: 'SELECT * FROM "x"', startTime: "1h", endTime: "now" }, ctx);
    const call = (ctx.client.query as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(call.query).toMatch(/LIMIT 100$/);
  });

  it("preserves user LIMIT", async () => {
    const ctx = makeCtx({});
    await querySql.handler(
      {
        query: 'SELECT * FROM "x" LIMIT 5',
        startTime: "1h",
        endTime: "now",
      },
      ctx,
    );
    const call = (ctx.client.query as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(call.query).toMatch(/LIMIT 5$/);
    expect(call.query).not.toMatch(/LIMIT \d+ LIMIT/);
  });

  it("returns truncation flag when row cap hit", async () => {
    const rows = Array.from({ length: 100 }, (_, i) => ({ i }));
    const ctx = makeCtx({
      query: vi.fn().mockResolvedValue(rows),
    });
    const res = (await querySql.handler(
      { query: 'SELECT * FROM "x"', startTime: "1h", endTime: "now" },
      ctx,
    )) as { truncated: boolean };
    expect(res.truncated).toBe(true);
  });
});

describe("query_promql", () => {
  it("routes to instant when start/end omitted", async () => {
    const ctx = makeCtx({});
    await queryPromql.handler({ query: "up", stream: "m" }, ctx);
    expect(ctx.client.promqlInstant).toHaveBeenCalled();
    expect(ctx.client.promqlRange).not.toHaveBeenCalled();
  });

  it("routes to range when start+end provided", async () => {
    const ctx = makeCtx({});
    await queryPromql.handler({ query: "up", stream: "m", start: "1", end: "2" }, ctx);
    expect(ctx.client.promqlRange).toHaveBeenCalled();
    expect(ctx.client.promqlInstant).not.toHaveBeenCalled();
  });

  it("coerces RFC3339 to epoch seconds", async () => {
    const ctx = makeCtx({});
    await queryPromql.handler(
      {
        query: "up",
        stream: "m",
        start: "2026-05-13T10:00:00Z",
        end: "2026-05-13T11:00:00Z",
      },
      ctx,
    );
    const call = (ctx.client.promqlRange as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(call.start).toBe(String(Math.floor(Date.parse("2026-05-13T10:00:00Z") / 1000)));
    expect(call.end).toBe(String(Math.floor(Date.parse("2026-05-13T11:00:00Z") / 1000)));
  });

  it("passes through epoch values unchanged", async () => {
    const ctx = makeCtx({});
    await queryPromql.handler(
      { query: "up", stream: "m", start: "1747123200", end: "1747126800" },
      ctx,
    );
    const call = (ctx.client.promqlRange as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(call.start).toBe("1747123200");
    expect(call.end).toBe("1747126800");
  });

  it("throws on invalid timestamp", async () => {
    const ctx = makeCtx({});
    await expect(
      queryPromql.handler({ query: "up", stream: "m", start: "not-a-date", end: "1" }, ctx),
    ).rejects.toThrow(/Invalid timestamp/);
  });
});

describe("explain_query", () => {
  it("prefixes EXPLAIN", async () => {
    const ctx = makeCtx({});
    await explainQuery.handler(
      { query: 'SELECT * FROM "x"', startTime: "1h", endTime: "now" },
      ctx,
    );
    const call = (ctx.client.query as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(call.query).toMatch(/^EXPLAIN SELECT/);
  });

  it("rejects double EXPLAIN", async () => {
    const ctx = makeCtx({});
    await expect(
      explainQuery.handler({ query: "EXPLAIN SELECT 1", startTime: "1h", endTime: "now" }, ctx),
    ).rejects.toThrow(/Do not prefix/);
  });

  it("rejects DDL", async () => {
    const ctx = makeCtx({});
    await expect(
      explainQuery.handler({ query: "DROP TABLE x", startTime: "1h", endTime: "now" }, ctx),
    ).rejects.toThrow(/SELECT/);
  });
});
