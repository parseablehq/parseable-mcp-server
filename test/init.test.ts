import { describe, expect, it } from "vitest";
import { getClientTargets, mergeConfig, parseInitArgs } from "../src/init.js";

describe("parseInitArgs", () => {
  it("parses --url --username --password --client", () => {
    const a = parseInitArgs([
      "--url",
      "http://x",
      "--username",
      "admin",
      "--password",
      "pw",
      "--client",
      "cursor",
    ]);
    expect(a).toEqual({
      url: "http://x",
      username: "admin",
      password: "pw",
      client: "cursor",
    });
  });

  it("returns empty when no flags", () => {
    expect(parseInitArgs([])).toEqual({});
  });

  it("ignores unknown flags", () => {
    expect(parseInitArgs(["--bogus", "v", "--url", "u"])).toEqual({ url: "u" });
  });

  it("ignores flag without value", () => {
    expect(parseInitArgs(["--url"])).toEqual({});
  });
});

describe("getClientTargets", () => {
  it("returns Claude Desktop + Cursor on macOS", () => {
    const t = getClientTargets("/home/user", "darwin");
    expect(t).toHaveLength(2);
    expect(t[0].id).toBe("claude-desktop");
    expect(t[0].configPath).toContain("Library/Application Support/Claude");
    expect(t[1].id).toBe("cursor");
    expect(t[1].configPath).toBe("/home/user/.cursor/mcp.json");
  });

  it("uses APPDATA path shape on Windows", () => {
    const t = getClientTargets("C:\\Users\\u", "win32");
    expect(t[0].configPath).toMatch(/Claude/);
  });

  it("uses ~/.config on Linux", () => {
    const t = getClientTargets("/home/u", "linux");
    expect(t[0].configPath).toBe("/home/u/.config/Claude/claude_desktop_config.json");
  });
});

describe("mergeConfig", () => {
  it("adds parseable entry to empty config", () => {
    const merged = mergeConfig(
      {},
      {
        url: "http://x",
        username: "a",
        password: "b",
      },
    );
    expect(merged).toEqual({
      mcpServers: {
        parseable: {
          command: "npx",
          args: ["-y", "@parseable/parseable-mcp-server"],
          env: {
            PARSEABLE_URL: "http://x",
            PARSEABLE_USERNAME: "a",
            PARSEABLE_PASSWORD: "b",
          },
        },
      },
    });
  });

  it("preserves other top-level keys", () => {
    const merged = mergeConfig(
      {
        mcpServers: {},
        preferences: { theme: "dark" },
      },
      { url: "http://x", username: "a", password: "b" },
    );
    expect(merged.preferences).toEqual({ theme: "dark" });
    expect((merged.mcpServers as Record<string, unknown>).parseable).toBeDefined();
  });

  it("preserves other mcpServers entries", () => {
    const merged = mergeConfig(
      {
        mcpServers: {
          github: { command: "node", args: ["x.js"] },
        },
      },
      { url: "http://x", username: "a", password: "b" },
    );
    const servers = merged.mcpServers as Record<string, unknown>;
    expect(servers.github).toEqual({ command: "node", args: ["x.js"] });
    expect(servers.parseable).toBeDefined();
  });

  it("overwrites an existing parseable entry", () => {
    const merged = mergeConfig(
      {
        mcpServers: {
          parseable: { command: "node", args: ["old.js"] },
        },
      },
      { url: "http://new", username: "a", password: "b" },
    );
    const servers = merged.mcpServers as Record<string, unknown>;
    const parseable = servers.parseable as { env: Record<string, string> };
    expect(parseable.env.PARSEABLE_URL).toBe("http://new");
  });
});
