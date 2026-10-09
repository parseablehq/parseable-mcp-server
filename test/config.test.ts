import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { loadConfig } from "../src/config.js";

const KEYS = ["PARSEABLE_URL", "PARSEABLE_API_KEY", "PARSEABLE_QUERY_TIMEOUT_MS"];

const saved: Record<string, string | undefined> = {};

beforeEach(() => {
  for (const k of KEYS) saved[k] = process.env[k];
});

afterEach(() => {
  for (const k of KEYS) {
    if (saved[k] === undefined) delete process.env[k];
    else process.env[k] = saved[k];
  }
});

describe("loadConfig", () => {
  it("requires PARSEABLE_URL", () => {
    delete process.env.PARSEABLE_URL;
    process.env.PARSEABLE_API_KEY = "key";
    expect(() => loadConfig()).toThrow(/PARSEABLE_URL/);
  });

  it("requires PARSEABLE_API_KEY", () => {
    process.env.PARSEABLE_URL = "http://x";
    delete process.env.PARSEABLE_API_KEY;
    expect(() => loadConfig()).toThrow(/PARSEABLE_API_KEY/);
  });

  it("strips trailing slashes from url", () => {
    process.env.PARSEABLE_URL = "http://x//";
    process.env.PARSEABLE_API_KEY = "key";
    expect(loadConfig().url).toBe("http://x");
  });

  it("applies default timeout", () => {
    process.env.PARSEABLE_URL = "http://x";
    process.env.PARSEABLE_API_KEY = "key";
    delete process.env.PARSEABLE_QUERY_TIMEOUT_MS;
    const c = loadConfig();
    expect(c.queryTimeoutMs).toBe(30000);
  });
});
