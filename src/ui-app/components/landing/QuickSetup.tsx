import { useCallback, useState } from "react";
import type { ReactNode } from "react";
import {
  IconCheck,
  IconChevronDown,
  IconCopy,
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
    <div className="group relative overflow-hidden rounded-xl border border-[#e7e7e7] bg-white p-3">
      <button
        type="button"
        onClick={() => onCopy(content, copyKey)}
        aria-label="Copy to clipboard"
        className="absolute top-3 right-3 inline-flex size-7 items-center justify-center rounded border border-[#e7e7e7] bg-white text-[#888] opacity-0 transition-all hover:text-[#1f40ed] group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#1f40ed]"
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
        className="overflow-x-auto pr-10 text-[14px] leading-[1.5] text-[#24292e]"
        style={{
          fontFamily: '"Fira Code", ui-monospace, monospace',
        }}
      >
        <code>{content}</code>
      </pre>
    </div>
  );
}

function ClientRow({ clients }: { clients: Client[] }) {
  return (
    <div className="flex min-w-0 flex-nowrap items-center gap-2 md:flex-wrap md:gap-5">
      {clients.map((client) => (
        <div key={client} className="flex shrink-0 items-center gap-1 text-black md:gap-1.5">
          <span className="flex size-2.5 shrink-0 items-center [&>img]:size-2.5 md:size-[18px] md:[&>img]:size-[18px]">
            {CLIENT_ICONS[client]}
          </span>
          <span className="font-inter text-[10px] leading-normal md:text-sm">{client}</span>
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
    <div className={`inline-flex items-center rounded-lg border border-[#e7e7e7] bg-[#e7e7e7] ${compact ? "h-8 p-0.5" : "h-[39px] w-full gap-[5px] p-0.5 md:w-[337px]"}`}>
      {(["cloud", "self-hosted"] as const).map((option) => (
        <button
          key={option}
          type="button"
          aria-pressed={mode === option}
          onClick={() => onChange(option)}
          className={`inline-flex cursor-pointer items-center rounded-md font-inter transition-colors ${
            compact ? "h-full px-2.5 text-xs" : "h-full flex-1 justify-center px-4 py-2 text-sm"
          } ${
            mode === option
              ? "bg-white text-[#3d3d3d]"
              : "text-[#888] hover:text-[#3d3d3d]"
          }`}
        >
          {option === "cloud" ? "Parseable Cloud" : "Self-hosted"}
        </button>
      ))}
    </div>
  );
}

export function QuickSetup() {
  const [mode, setMode] = useState<ParseableMode>("cloud");
  const [openGroup, setOpenGroup] = useState<ClientGroup["id"] | null>(
    GROUPS[1].id,
  );
  const { copied, copy } = useCopy();
  const configs = manualConfig(mode);

  return (
    <section className="pb-[76px] md:pb-32">
      <div className="max-w-page mx-auto px-4 md:px-0">
        {/* Mode toggle — shared across every block below */}
        <div className="mb-6 flex justify-center">
          <ModeToggle mode={mode} onChange={setMode} />
        </div>

        {/* Accordion — one group open at a time, first one open by default */}
        <div className="mx-auto flex max-w-[800px] flex-col gap-4 rounded-xl border border-[#e7e7e7] bg-[#fafafa] p-2 md:gap-5 md:p-3">
          {GROUPS.map((group) => {
            const isInit = group.id === "init";
            const isOpen = openGroup === group.id;
            const manual = configs[group.clients[0]];
            return (
              <div key={group.id} className={isOpen ? "flex flex-col gap-2" : undefined}>
                <button
                  type="button"
                  onClick={() => setOpenGroup(isOpen ? null : group.id)}
                  aria-expanded={isOpen}
                  className="flex h-6 w-full cursor-pointer items-center justify-between gap-4 p-0 text-left"
                >
                  <ClientRow clients={group.clients} />
                  <IconChevronDown
                    size={18}
                    stroke={1.5}
                    aria-hidden="true"
                    className={`shrink-0 text-black/40 transition-transform ${isOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {isOpen && (
                  <div>
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
