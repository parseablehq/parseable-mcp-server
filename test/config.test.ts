import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { loadConfig } from "../src/config.js";

const KEYS = [
  "PARSEABLE_URL",
  "PARSEABLE_USERNAME",
  "PARSEABLE_PASSWORD",
  "PARSEABLE_DEFAULT_DATASET",
  "PARSEABLE_MAX_ROWS",
  "PARSEABLE_QUERY_TIMEOUT_MS",
];

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
    process.env.PARSEABLE_USERNAME = "a";
    process.env.PARSEABLE_PASSWORD = "b";
    expect(() => loadConfig()).toThrow(/PARSEABLE_URL/);
  });

  it("requires PARSEABLE_USERNAME", () => {
    process.env.PARSEABLE_URL = "http://x";
    delete process.env.PARSEABLE_USERNAME;
    process.env.PARSEABLE_PASSWORD = "b";
    expect(() => loadConfig()).toThrow(/PARSEABLE_USERNAME/);
  });

  it("requires PARSEABLE_PASSWORD", () => {
    process.env.PARSEABLE_URL = "http://x";
    process.env.PARSEABLE_USERNAME = "a";
    delete process.env.PARSEABLE_PASSWORD;
    expect(() => loadConfig()).toThrow(/PARSEABLE_PASSWORD/);
  });

  it("strips trailing slashes from url", () => {
    process.env.PARSEABLE_URL = "http://x//";
    process.env.PARSEABLE_USERNAME = "a";
    process.env.PARSEABLE_PASSWORD = "b";
    expect(loadConfig().url).toBe("http://x");
  });

  it("applies default maxRows + timeout", () => {
    process.env.PARSEABLE_URL = "http://x";
    process.env.PARSEABLE_USERNAME = "a";
    process.env.PARSEABLE_PASSWORD = "b";
    delete process.env.PARSEABLE_MAX_ROWS;
    delete process.env.PARSEABLE_QUERY_TIMEOUT_MS;
    const c = loadConfig();
    expect(c.maxRows).toBe(1000);
    expect(c.queryTimeoutMs).toBe(30000);
  });

  it("honors PARSEABLE_MAX_ROWS override", () => {
    process.env.PARSEABLE_URL = "http://x";
    process.env.PARSEABLE_USERNAME = "a";
    process.env.PARSEABLE_PASSWORD = "b";
    process.env.PARSEABLE_MAX_ROWS = "50";
    expect(loadConfig().maxRows).toBe(50);
  });

  it("passes through PARSEABLE_DEFAULT_DATASET", () => {
    process.env.PARSEABLE_URL = "http://x";
    process.env.PARSEABLE_USERNAME = "a";
    process.env.PARSEABLE_PASSWORD = "b";
    process.env.PARSEABLE_DEFAULT_DATASET = "my_logs";
    expect(loadConfig().defaultDataset).toBe("my_logs");
  });

  it("treats empty default dataset as undefined", () => {
    process.env.PARSEABLE_URL = "http://x";
    process.env.PARSEABLE_USERNAME = "a";
    process.env.PARSEABLE_PASSWORD = "b";
    process.env.PARSEABLE_DEFAULT_DATASET = "";
    expect(loadConfig().defaultDataset).toBeUndefined();
  });
});
