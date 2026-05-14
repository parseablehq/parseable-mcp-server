import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir, platform } from "node:os";
import { dirname, join } from "node:path";
import inquirer from "inquirer";

export interface ClientTarget {
  id: string;
  name: string;
  configPath: string;
  configKey: "mcpServers" | "servers";
}

export interface InitArgs {
  url?: string;
  username?: string;
  password?: string;
  client?: string;
}

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
    },
    {
      id: "claude-desktop",
      name: "Claude for Desktop",
      configPath: claudeDesktopPath,
      configKey: "mcpServers",
    },
    {
      id: "cursor",
      name: "Cursor",
      configPath: join(home, ".cursor", "mcp.json"),
      configKey: "mcpServers",
    },
    {
      id: "vscode",
      name: "VS Code",
      configPath: vscodeBaseDir("Code"),
      configKey: "servers",
    },
    {
      id: "vscode-insiders",
      name: "VS Code Insiders",
      configPath: vscodeBaseDir("Code - Insiders"),
      configKey: "servers",
    },
  ];
}

export function parseInitArgs(argv: string[]): InitArgs {
  const args: InitArgs = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--url" && argv[i + 1]) args.url = argv[++i];
    else if (a === "--username" && argv[i + 1]) args.username = argv[++i];
    else if (a === "--password" && argv[i + 1]) args.password = argv[++i];
    else if (a === "--client" && argv[i + 1]) args.client = argv[++i];
  }
  return args;
}

export function mergeConfig(
  existing: Record<string, unknown>,
  configKey: "mcpServers" | "servers",
  creds: { url: string; username: string; password: string },
): Record<string, unknown> {
  const entry = {
    command: "npx",
    args: ["-y", "@parseable/parseable-mcp-server"],
    env: {
      PARSEABLE_URL: creds.url,
      PARSEABLE_USERNAME: creds.username,
      PARSEABLE_PASSWORD: creds.password,
    },
  };

  const servers = (existing[configKey] as Record<string, unknown>) ?? {};
  servers.parseable = entry;
  return { ...existing, [configKey]: servers };
}

function writeClientConfig(
  target: ClientTarget,
  creds: { url: string; username: string; password: string },
): void {
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

  const merged = mergeConfig(existing, target.configKey, creds);
  writeFileSync(target.configPath, `${JSON.stringify(merged, null, 2)}\n`, "utf8");
}

export async function runInit(argv: string[] = process.argv.slice(3)): Promise<void> {
  const args = parseInitArgs(argv);
  const all = getClientTargets();

  console.log("Parseable MCP server — interactive setup\n");

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

  // 2. Credentials
  const answers = await inquirer.prompt<{
    url: string;
    username: string;
    password: string;
  }>(
    [
      !args.url && {
        type: "input",
        name: "url",
        message: "Parseable URL:",
        validate: (v: string) => v.trim().length > 0 || "URL is required",
      },
      !args.username && {
        type: "input",
        name: "username",
        message: "Username:",
        default: "admin",
      },
      !args.password && {
        type: "password",
        name: "password",
        message: "Password:",
        mask: "*",
        validate: (v: string) => v.length > 0 || "Password is required",
      },
    ].filter(Boolean) as Parameters<typeof inquirer.prompt>[0],
  );

  const creds = {
    url: args.url ?? answers.url,
    username: args.username ?? answers.username,
    password: args.password ?? answers.password,
  };

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
