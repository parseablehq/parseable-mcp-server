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
  it("returns 5 clients on macOS", () => {
    const t = getClientTargets("/home/user", "darwin");
    expect(t.map((c) => c.id)).toEqual([
      "claude-code",
      "claude-desktop",
      "cursor",
      "vscode",
      "vscode-insiders",
    ]);
  });

  it("uses Library/Application Support paths on macOS", () => {
    const t = getClientTargets("/home/user", "darwin");
    expect(t.find((c) => c.id === "claude-desktop")?.configPath).toContain(
      "Library/Application Support/Claude",
    );
    expect(t.find((c) => c.id === "vscode")?.configPath).toContain(
      "Library/Application Support/Code/User",
    );
    expect(t.find((c) => c.id === "vscode-insiders")?.configPath).toContain(
      "Library/Application Support/Code - Insiders/User",
    );
  });

  it("uses ~/.config on Linux", () => {
    const t = getClientTargets("/home/u", "linux");
    expect(t.find((c) => c.id === "claude-desktop")?.configPath).toBe(
      "/home/u/.config/Claude/claude_desktop_config.json",
    );
    expect(t.find((c) => c.id === "vscode")?.configPath).toBe("/home/u/.config/Code/User/mcp.json");
  });

  it("uses APPDATA shape on Windows", () => {
    const t = getClientTargets("C:\\Users\\u", "win32");
    expect(t.find((c) => c.id === "vscode")?.configPath).toMatch(/Code/);
  });

  it("Claude Code lives at ~/.claude.json", () => {
    const t = getClientTargets("/home/u", "darwin");
    expect(t.find((c) => c.id === "claude-code")?.configPath).toBe("/home/u/.claude.json");
  });

  it("VS Code variants use 'servers' key, others use 'mcpServers'", () => {
    const t = getClientTargets("/home/u", "darwin");
    expect(t.find((c) => c.id === "claude-desktop")?.configKey).toBe("mcpServers");
    expect(t.find((c) => c.id === "cursor")?.configKey).toBe("mcpServers");
    expect(t.find((c) => c.id === "claude-code")?.configKey).toBe("mcpServers");
    expect(t.find((c) => c.id === "vscode")?.configKey).toBe("servers");
    expect(t.find((c) => c.id === "vscode-insiders")?.configKey).toBe("servers");
  });
});

describe("mergeConfig", () => {
  const creds = { url: "http://x", username: "a", password: "b" };

  it("adds Parseable entry under mcpServers", () => {
    const merged = mergeConfig({}, "mcpServers", creds);
    expect(merged).toEqual({
      mcpServers: {
        Parseable: {
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

  it("adds Parseable entry under servers for VS Code", () => {
    const merged = mergeConfig({}, "servers", creds);
    expect(merged.servers).toBeDefined();
    expect(merged.mcpServers).toBeUndefined();
  });

  it("preserves other top-level keys", () => {
    const merged = mergeConfig(
      { mcpServers: {}, preferences: { theme: "dark" } },
      "mcpServers",
      creds,
    );
    expect(merged.preferences).toEqual({ theme: "dark" });
  });

  it("preserves other mcpServers entries", () => {
    const merged = mergeConfig(
      { mcpServers: { github: { command: "node", args: ["x.js"] } } },
      "mcpServers",
      creds,
    );
    const servers = merged.mcpServers as Record<string, unknown>;
    expect(servers.github).toEqual({ command: "node", args: ["x.js"] });
    expect(servers.Parseable).toBeDefined();
  });

  it("overwrites an existing Parseable entry", () => {
    const merged = mergeConfig(
      { mcpServers: { Parseable: { command: "node", args: ["old.js"] } } },
      "mcpServers",
      { url: "http://new", username: "a", password: "b" },
    );
    const servers = merged.mcpServers as Record<string, unknown>;
    const parseable = servers.Parseable as { env: Record<string, string> };
    expect(parseable.env.PARSEABLE_URL).toBe("http://new");
  });
});
