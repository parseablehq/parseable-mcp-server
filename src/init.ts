import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir, platform } from "node:os";
import { dirname, join } from "node:path";
import inquirer from "inquirer";

export interface ClientTarget {
  id: string;
  name: string;
  configPath: string;
  configKey: "mcpServers" | "servers";
  platform: string;
}

export interface InitArgs {
  mode?: ParseableMode;
  url?: string;
  apiKey?: string;
  client?: string;
}

export type ParseableMode = "cloud" | "self-hosted";

export type InitCredentials =
  | { mode: "cloud"; apiKey: string }
  | { mode: "self-hosted"; url: string; apiKey: string };

const CLOUD_MCP_URL = "https://mcp.parseable.com/mcp";

export function getClientTargets(
  home: string = homedir(),
  plat: string = platform(),
): ClientTarget[] {
  const claudeDesktopPath =
    plat === "darwin"
      ? join(home, "Library", "Application Support", "Claude", "claude_desktop_config.json")
      : plat === "win32"
        ? join(process.env.APPDATA ?? home, "Claude", "claude_desktop_config.json")
        : join(home, ".config", "Claude", "claude_desktop_config.json");

  const vscodeBaseDir = (variant: "Code" | "Code - Insiders") =>
    plat === "darwin"
      ? join(home, "Library", "Application Support", variant, "User", "mcp.json")
      : plat === "win32"
        ? join(process.env.APPDATA ?? home, variant, "User", "mcp.json")
        : join(home, ".config", variant, "User", "mcp.json");

  return [
    {
      id: "claude-code",
      name: "Claude Code",
      configPath: join(home, ".claude.json"),
      configKey: "mcpServers",
      platform: plat,
    },
    {
      id: "claude-desktop",
      name: "Claude for Desktop",
      configPath: claudeDesktopPath,
      configKey: "mcpServers",
      platform: plat,
    },
    {
      id: "cursor",
      name: "Cursor",
      configPath: join(home, ".cursor", "mcp.json"),
      configKey: "mcpServers",
      platform: plat,
    },
    {
      id: "vscode",
      name: "VS Code",
      configPath: vscodeBaseDir("Code"),
      configKey: "servers",
      platform: plat,
    },
    {
      id: "vscode-insiders",
      name: "VS Code Insiders",
      configPath: vscodeBaseDir("Code - Insiders"),
      configKey: "servers",
      platform: plat,
    },
  ];
}

export function parseInitArgs(argv: string[]): InitArgs {
  const args: InitArgs = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--mode") {
      const mode = argv[++i];
      if (mode !== "cloud" && mode !== "self-hosted") {
        throw new Error('--mode must be either "cloud" or "self-hosted"');
      }
      args.mode = mode;
    } else if (a === "--url" && argv[i + 1]) args.url = argv[++i];
    else if (a === "--api-key" && argv[i + 1]) args.apiKey = argv[++i];
    else if (a === "--client" && argv[i + 1]) args.client = argv[++i];
  }
  return args;
}

export function mergeConfig(
  existing: Record<string, unknown>,
  configKey: "mcpServers" | "servers",
  creds: InitCredentials,
  clientId?: string,
  plat: string = platform(),
): Record<string, unknown> {
  const stdioEntry = (args: string[], env: Record<string, string>) =>
    plat === "win32"
      ? { command: "cmd", args: ["/c", "npx", ...args], env }
      : { command: "npx", args, env };

  const entry =
    creds.mode === "cloud"
      ? clientId === "claude-desktop"
        ? stdioEntry(
            [
              "-y",
              "mcp-remote@latest",
              CLOUD_MCP_URL,
              "--header",
              "X-Parseable-Mode:cloud",
              "--header",
              `X-API-Key:\${PARSEABLE_API_KEY}`,
            ],
            {
              PARSEABLE_API_KEY: creds.apiKey,
            },
          )
        : {
            type: "http",
            url: CLOUD_MCP_URL,
            headers: {
              "X-Parseable-Mode": "cloud",
              "X-API-Key": creds.apiKey,
            },
          }
      : stdioEntry(["-y", "@parseable/parseable-mcp-server"], {
          PARSEABLE_URL: creds.url,
          PARSEABLE_API_KEY: creds.apiKey,
        });

  const servers = (existing[configKey] as Record<string, unknown>) ?? {};
  servers.Parseable = entry;
  return { ...existing, [configKey]: servers };
}

export function writeClientConfig(target: ClientTarget, creds: InitCredentials): void {
  let existing: Record<string, unknown> = {};
  if (existsSync(target.configPath)) {
    try {
      copyFileSync(target.configPath, `${target.configPath}.bak`);
      const raw = readFileSync(target.configPath, "utf8");
      if (raw.trim()) {
        existing = JSON.parse(raw);
      }
    } catch {
      console.warn(
        `Warning: existing config at ${target.configPath} is not valid JSON. Backed up and replacing.`,
      );
    }
  } else {
    mkdirSync(dirname(target.configPath), { recursive: true });
  }

  const merged = mergeConfig(existing, target.configKey, creds, target.id, target.platform);
  writeFileSync(target.configPath, `${JSON.stringify(merged, null, 2)}\n`, "utf8");
}

export async function runInit(argv: string[] = process.argv.slice(3)): Promise<void> {
  const args = parseInitArgs(argv);
  const all = getClientTargets();

  console.log("Parseable MCP server - interactive setup\n");

  // 1. Application
  let selectedTarget: ClientTarget;
  if (args.client) {
    const match = all.find((t) => t.id === args.client);
    if (!match) {
      console.error(
        `Unknown client "${args.client}". Use one of: ${all.map((t) => t.id).join(", ")}`,
      );
      process.exit(1);
    }
    selectedTarget = match;
  } else {
    const { application } = await inquirer.prompt<{ application: string }>([
      {
        type: "select",
        name: "application",
        message: "Select Application:",
        choices: all.map((t) => ({ name: t.name, value: t.id })),
      },
    ]);
    const match = all.find((t) => t.id === application);
    if (!match) {
      console.error("No application selected. Aborting.");
      process.exit(1);
    }
    selectedTarget = match;
  }

  // 2. Mode and credentials
  let mode = args.mode;
  if (!mode) {
    const modeAnswer = await inquirer.prompt<{ mode: ParseableMode }>([
      {
        type: "select",
        name: "mode",
        message: "Select deployment mode:",
        choices: [
          { name: "Parseable Cloud", value: "cloud" },
          { name: "Self-hosted", value: "self-hosted" },
        ],
      },
    ]);
    mode = modeAnswer.mode;
  }

  const answers = await inquirer.prompt<{
    url: string;
    apiKey: string;
  }>(
    [
      mode === "self-hosted" &&
        !args.url && {
          type: "input",
          name: "url",
          message: "Parseable URL:",
          validate: (v: string) => v.trim().length > 0 || "URL is required",
        },
      !args.apiKey && {
        type: "password",
        name: "apiKey",
        message: "API key:",
        mask: "*",
        validate: (v: string) => v.length > 0 || "API key is required",
      },
    ].filter(Boolean) as Parameters<typeof inquirer.prompt>[0],
  );

  const apiKey = args.apiKey ?? answers.apiKey;
  const creds: InitCredentials =
    mode === "cloud" ? { mode, apiKey } : { mode, url: args.url ?? answers.url, apiKey };

  // 3. Write
  try {
    writeClientConfig(selectedTarget, creds);
    console.log(
      `\n✓ Configuration saved to ${selectedTarget.configPath} for ${selectedTarget.name}`,
    );
    console.log(`Restart ${selectedTarget.name} to load 27 Parseable tools.`);
  } catch (err) {
    console.error(`✗ Failed to write config: ${(err as Error).message}`);
    process.exit(1);
  }
}
