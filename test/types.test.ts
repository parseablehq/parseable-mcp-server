import { describe, expect, it } from "vitest";
import { errorResult, jsonResult } from "../src/tools/types.js";

describe("jsonResult", () => {
  it("wraps data as MCP text content with pretty JSON", () => {
    const r = jsonResult({ a: 1 });
    expect(r.content[0].type).toBe("text");
    expect(r.content[0].text).toContain('"a": 1');
  });

  it("handles arrays", () => {
    const r = jsonResult([1, 2, 3]);
    expect(r.content[0].text).toContain("1");
    expect(r.content[0].text).toContain("3");
  });

  it("handles primitives", () => {
    expect(jsonResult("hi").content[0].text).toBe('"hi"');
    expect(jsonResult(42).content[0].text).toBe("42");
  });
});

describe("errorResult", () => {
  it("marks isError and wraps message", () => {
    const r = errorResult("boom");
    expect(r.isError).toBe(true);
    expect(r.content[0].text).toBe("boom");
    expect(r.content[0].type).toBe("text");
  });
});
