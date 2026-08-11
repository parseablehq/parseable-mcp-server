import { useCallback, useState } from "react";
import type { ReactNode } from "react";
import {
  IconCheck,
  IconChevronDown,
  IconCloud,
  IconCopy,
  IconServer,
} from "@tabler/icons-react";

type CopyKey = string;

// ─── copy hook ────────────────────────────────────────────────────────────────

function useCopy() {
  const [copied, setCopied] = useState<CopyKey | null>(null);
  const copy = useCallback((text: string, key: CopyKey) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }, []);
  return { copied, copy };
}

const CLIENT_ICONS: Record<string, ReactNode> = {
  "Claude Code": (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/assets/clients/claude-ai.svg"
      width={20}
      height={20}
      alt=""
      aria-hidden="true"
    />
  ),
  Cursor: (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/assets/clients/cursor-mono.svg"
      width={20}
      height={20}
      alt=""
      aria-hidden="true"
    />
  ),
  "VS Code": (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/assets/clients/visual-studio-code.svg"
      width={20}
      height={20}
      alt=""
      aria-hidden="true"
    />
  ),
  "Claude Desktop": (
    <img
      src="/assets/clients/claude-ai.svg"
      width={20}
      height={20}
      alt=""
      aria-hidden="true"
    />
  ),
  "ChatGPT Desktop": (
    <img
      src="/assets/clients/openai-chatgpt.svg"
      width={20}
      height={20}
      alt=""
      aria-hidden="true"
    />
  ),
  Codex: (
    <img
      src="/assets/clients/openai-chatgpt.svg"
      width={20}
      height={20}
      alt=""
      aria-hidden="true"
    />
  ),
  Windsurf: (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/assets/clients/windsurf-mono.svg"
      width={20}
      height={20}
      alt=""
      aria-hidden="true"
    />
  ),
};

const CLIENTS = [
  "Claude Code",
  "Cursor",
  "VS Code",
  "Claude Desktop",
  "ChatGPT Desktop",
  "Codex",
  "Windsurf",
] as const;
type Client = (typeof CLIENTS)[number];
type ParseableMode = "cloud" | "self-hosted";

type ClientGroup = {
  id: "init" | "codex" | "windsurf";
  clients: Client[];
};

const GROUPS: ClientGroup[] = [
  {
    id: "init",
    clients: ["Claude Code", "Cursor", "VS Code", "Claude Desktop"],
  },
  {
    id: "codex",
    clients: ["ChatGPT Desktop", "Codex"],
  },
  {
    id: "windsurf",
    clients: ["Windsurf"],
  },
];

const HOSTED_URL = `${window.location.origin}/mcp`;
const PARSEABLE_URL = "https://your-parseable.example.com";
const API_KEY = "your-parseable-api-key";
const INSTALL_COMMAND = "npx -y @parseable/parseable-mcp-server@latest init";
function authHeaders(mode: ParseableMode) {
  return mode === "cloud"
    ? { "X-Parseable-Mode": "cloud", "X-API-Key": API_KEY }
    : { "X-Parseable-URL": PARSEABLE_URL, "X-API-Key": API_KEY };
}

function manualConfig(
  mode: ParseableMode,
): Record<Client, { file: string; content: string }> {
  const headers = authHeaders(mode);
  const codexToml = `[mcp_servers.parseable]
url = "${HOSTED_URL}"
http_headers = { ${Object.entries(headers)
    .map(([key, value]) => `"${key}" = "${value}"`)
    .join(", ")} }`;

  return {
    "Claude Code": {
      file: "~/.claude.json",
      content: JSON.stringify(
        {
          mcpServers: {
            parseable: { type: "http", url: HOSTED_URL, headers },
          },
        },
        null,
        2,
      ),
    },
    Cursor: {
      file: "~/.cursor/mcp.json",
      content: JSON.stringify(
        {
          mcpServers: {
            parseable: { type: "http", url: HOSTED_URL, headers },
          },
        },
        null,
        2,
      ),
    },
    "VS Code": {
      file: ".vscode/mcp.json",
      content: JSON.stringify(
        {
          servers: {
            parseable: { type: "http", url: HOSTED_URL, headers },
          },
        },
        null,
        2,
      ),
    },
    "Claude Desktop": {
      file: "claude_desktop_config.json",
      content: JSON.stringify(
        mode === "cloud"
          ? {
              mcpServers: {
                parseable: { type: "http", url: HOSTED_URL, headers },
              },
            }
          : {
              mcpServers: {
                parseable: {
                  command: "npx",
                  args: ["-y", "@parseable/parseable-mcp-server@latest"],
                  env: {
                    PARSEABLE_URL,
                    PARSEABLE_API_KEY: API_KEY,
                  },
                },
              },
            },
        null,
        2,
      ),
    },
    "ChatGPT Desktop": {
      file: "~/.codex/config.toml",
      content: codexToml,
    },
    Codex: {
      file: "~/.codex/config.toml",
      content: codexToml,
    },
    Windsurf: {
      file: "~/.codeium/windsurf/mcp_config.json",
      content: JSON.stringify(
        {
          mcpServers: {
            parseable: { serverUrl: HOSTED_URL, headers },
          },
        },
        null,
        2,
      ),
    },
  };
}

function DarkCodeBlock({
  content,
  copyKey,
  copied,
  onCopy,
}: {
  content: string;
  copyKey: string;
  copied: string | null;
  onCopy: (text: string, key: string) => void;
}) {
  return (
    <div
      className="relative rounded-xl overflow-hidden border border-coolGray-900"
      style={{ background: "rgba(244,244,245,0.5)" }}
    >
      <button
        type="button"
        onClick={() => onCopy(content, copyKey)}
        aria-label="Copy to clipboard"
        className="absolute top-3 right-3 inline-flex items-center justify-center w-7 h-7 rounded border border-coolGray-800 bg-white text-coolGray-500 hover:text-parseableBlue-500 hover:border-parseableBlue-500/30 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#3A3A8C]"
      >
        {copied === copyKey ? (
          <IconCheck
            size={13}
            stroke={2}
            aria-hidden="true"
            className="text-[#059669]"
          />
        ) : (
          <IconCopy size={13} stroke={1.5} aria-hidden="true" />
        )}
      </button>
      <pre
        className="px-5 py-3 pr-12 text-[13px] leading-6 overflow-x-auto"
        style={{
          fontFamily: '"JetBrains Mono", ui-monospace, monospace',
          color: "#27272A",
        }}
      >
        <code>{content}</code>
      </pre>
    </div>
  );
}

function ClientRow({ clients }: { clients: Client[] }) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      {clients.map((client) => (
        <div key={client} className="flex items-center gap-1.5 text-black/45">
          <span className="flex items-center opacity-70">
            {CLIENT_ICONS[client]}
          </span>
          <span className="font-inter text-xs">{client}</span>
        </div>
      ))}
    </div>
  );
}

function ModeToggle({
  mode,
  onChange,
  compact = false,
}: {
  mode: ParseableMode;
  onChange: (mode: ParseableMode) => void;
  compact?: boolean;
}) {
  return (
    <div
      className={`inline-flex items-center rounded-lg border border-black/[0.07] bg-black/[0.02] ${compact ? "h-8 p-0.5" : "p-1"}`}
    >
      {(["cloud", "self-hosted"] as const).map((option) => (
        <button
          key={option}
          type="button"
          aria-pressed={mode === option}
          onClick={() => onChange(option)}
          className={`inline-flex cursor-pointer items-center rounded-md font-inter transition-colors ${
            compact ? "h-full gap-1 px-2.5 text-xs" : "gap-2 px-5 py-2 text-sm"
          } ${
            mode === option
              ? "bg-white text-[#14151A] shadow-[0_1px_3px_0_rgba(0,0,0,0.08)] font-medium"
              : "text-black/40 hover:text-black/70"
          }`}
        >
          {option === "cloud" ? (
            <IconCloud size={compact ? 12 : 15} stroke={1.5} />
          ) : (
            <IconServer size={compact ? 12 : 15} stroke={1.5} />
          )}
          {option === "cloud" ? "Parseable Cloud" : "Self-hosted"}
        </button>
      ))}
    </div>
  );
}

export function QuickSetup() {
  const [mode, setMode] = useState<ParseableMode>("cloud");
  const [openGroup, setOpenGroup] = useState<ClientGroup["id"] | null>(
    GROUPS[0].id,
  );
  const { copied, copy } = useCopy();
  const configs = manualConfig(mode);

  return (
    <section className="mt-16 pb-8">
      <div className="max-w-page mx-auto px-4 md:px-0">
        {/* Mode toggle — shared across every block below */}
        <div className="flex justify-center mb-10">
          <ModeToggle mode={mode} onChange={setMode} />
        </div>

        {/* Accordion — one group open at a time, first one open by default */}
        <div className="max-w-[720px] mx-auto rounded-xl border border-black/[0.07] bg-white shadow-[0_4px_24px_0_rgba(0,0,0,0.07)] divide-y divide-black/6">
          {GROUPS.map((group) => {
            const isInit = group.id === "init";
            const isOpen = openGroup === group.id;
            const manual = configs[group.clients[0]];
            return (
              <div key={group.id}>
                <button
                  type="button"
                  onClick={() => setOpenGroup(isOpen ? null : group.id)}
                  aria-expanded={isOpen}
                  className="w-full flex cursor-pointer items-center justify-between gap-4 px-6 py-4 text-left"
                >
                  <ClientRow clients={group.clients} />
                  <IconChevronDown
                    size={16}
                    stroke={1.5}
                    aria-hidden="true"
                    className={`shrink-0 text-black/40 transition-transform ${isOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-6">
                    <DarkCodeBlock
                      content={isInit ? INSTALL_COMMAND : manual.content}
                      copyKey={`config-${group.id}`}
                      copied={copied}
                      onCopy={copy}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── Demo ─────────────────────────────────────────────────────────────────────
