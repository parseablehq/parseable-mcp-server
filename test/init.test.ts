import { describe, expect, it } from "vitest";
import { getClientTargets, mergeConfig, parseInitArgs } from "../src/init.js";

describe("parseInitArgs", () => {
  it("parses --mode --url --api-key --client", () => {
    const a = parseInitArgs([
      "--mode",
      "self-hosted",
      "--url",
      "http://x",
      "--api-key",
      "key",
      "--client",
      "cursor",
    ]);
    expect(a).toEqual({
      mode: "self-hosted",
      url: "http://x",
      apiKey: "key",
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
  const creds = { mode: "self-hosted" as const, url: "http://x", apiKey: "key" };

  it("adds Parseable entry under mcpServers", () => {
    const merged = mergeConfig({}, "mcpServers", creds);
    expect(merged).toEqual({
      mcpServers: {
        Parseable: {
          command: "npx",
          args: ["-y", "@parseable/parseable-mcp-server"],
          env: {
            PARSEABLE_URL: "http://x",
            PARSEABLE_API_KEY: "key",
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

  it("adds hosted HTTP entry for cloud mode without a Parseable URL", () => {
    const merged = mergeConfig({}, "mcpServers", { mode: "cloud", apiKey: "cloud-key" });
    expect(merged).toEqual({
      mcpServers: {
        Parseable: {
          type: "http",
          url: "https://mcp.parseable.com/mcp",
          headers: {
            "X-Parseable-Mode": "cloud",
            "X-API-Key": "cloud-key",
          },
        },
      },
    });
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
      { mode: "self-hosted", url: "http://new", apiKey: "key" },
    );
    const servers = merged.mcpServers as Record<string, unknown>;
    const parseable = servers.Parseable as { env: Record<string, string> };
    expect(parseable.env.PARSEABLE_URL).toBe("http://new");
  });
});
