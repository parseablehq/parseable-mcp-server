import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { homedir, platform } from "node:os";
import { dirname, join } from "node:path";
import { createInterface, type Interface } from "node:readline/promises";

export interface ClientTarget {
  id: string;
  name: string;
  configPath: string;
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
  const targets: ClientTarget[] = [];

  let claudePath: string;
  if (plat === "darwin") {
    claudePath = join(
      home,
      "Library",
      "Application Support",
      "Claude",
      "claude_desktop_config.json",
    );
  } else if (plat === "win32") {
    claudePath = join(process.env.APPDATA ?? home, "Claude", "claude_desktop_config.json");
  } else {
    claudePath = join(home, ".config", "Claude", "claude_desktop_config.json");
  }
  targets.push({ id: "claude-desktop", name: "Claude Desktop", configPath: claudePath });

  targets.push({ id: "cursor", name: "Cursor", configPath: join(home, ".cursor", "mcp.json") });

  return targets;
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

  const servers = (existing.mcpServers as Record<string, unknown>) ?? {};
  servers.parseable = entry;
  return { ...existing, mcpServers: servers };
}

async function writeClientConfig(
  target: ClientTarget,
  creds: { url: string; username: string; password: string },
): Promise<void> {
  let existing: Record<string, unknown> = {};
  if (existsSync(target.configPath)) {
    const raw = await readFile(target.configPath, "utf8");
    if (raw.trim()) {
      try {
        existing = JSON.parse(raw);
      } catch {
        throw new Error(
          `Existing config at ${target.configPath} is not valid JSON. Refusing to overwrite.`,
        );
      }
    }
    await writeFile(`${target.configPath}.bak`, raw, "utf8");
  } else {
    await mkdir(dirname(target.configPath), { recursive: true });
  }

  const merged = mergeConfig(existing, creds);
  await writeFile(target.configPath, `${JSON.stringify(merged, null, 2)}\n`, "utf8");
}

async function ask(rl: Interface, question: string, fallback?: string): Promise<string> {
  const q = fallback ? `${question} [${fallback}]: ` : `${question}: `;
  const answer = (await rl.question(q)).trim();
  return answer || fallback || "";
}

export async function runInit(argv: string[] = process.argv.slice(3)): Promise<void> {
  const args = parseInitArgs(argv);

  console.log("Parseable MCP server — interactive setup\n");

  const all = getClientTargets();
  const detected = all.filter((t) => existsSync(t.configPath));

  if (detected.length === 0) {
    console.log(
      "No MCP clients detected yet. Creating config files for both Claude Desktop and Cursor.",
    );
    console.log("If you only use one, you can delete the other later.\n");
  } else {
    console.log("Detected MCP clients:");
    for (const [i, t] of detected.entries()) {
      console.log(`  ${i + 1}. ${t.name} (${t.configPath})`);
    }
    console.log();
  }

  const rl = createInterface({ input: process.stdin, output: process.stdout });

  let chosen: ClientTarget[];
  if (args.client) {
    const match = all.find((t) => t.id === args.client);
    if (!match) {
      rl.close();
      console.error(
        `Unknown client "${args.client}". Use one of: ${all.map((t) => t.id).join(", ")}`,
      );
      process.exit(1);
    }
    chosen = [match];
  } else if (detected.length === 0) {
    chosen = all;
  } else {
    const pick = await ask(rl, "Configure which? (comma-separated numbers, or 'all')", "all");
    if (pick === "all") {
      chosen = detected;
    } else {
      const indices = pick.split(",").map((s) => Number.parseInt(s.trim(), 10) - 1);
      chosen = indices.map((i) => detected[i]).filter(Boolean);
    }
  }

  if (chosen.length === 0) {
    rl.close();
    console.error("No clients selected. Aborting.");
    process.exit(1);
  }

  const url = args.url || (await ask(rl, "Parseable URL"));
  const username = args.username || (await ask(rl, "Username", "admin"));
  const password = args.password || (await ask(rl, "Password"));

  rl.close();

  if (!url || !username || !password) {
    console.error("URL, username, and password are all required.");
    process.exit(1);
  }

  for (const target of chosen) {
    try {
      await writeClientConfig(target, { url, username, password });
      console.log(`✓ Configured ${target.name}: ${target.configPath}`);
    } catch (err) {
      console.error(`✗ Failed to configure ${target.name}: ${(err as Error).message}`);
    }
  }

  console.log(`\nRestart ${chosen.map((t) => t.name).join(" / ")} to load 27 Parseable tools.`);
}
