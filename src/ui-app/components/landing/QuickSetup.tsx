import { useCallback, useState } from "react";
import type { ReactNode } from "react";
import { IconCheck, IconCopy } from "@tabler/icons-react";

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

const HOSTED_URL = `${window.location.origin}/mcp`;
const PARSEABLE_URL = "https://your-parseable.example.com";
const API_KEY = "your-parseable-api-key";
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
                  args: ["-y", "@parseable/parseable-mcp-server"],
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

function SectionDivider() {
  return (
    <div
      className="w-full h-px"
      style={{
        background:
          "linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.08) 15%, rgba(0,0,0,0.08) 85%, transparent 100%)",
      }}
    />
  );
}

function DarkCodeBlock({
  content,
  copyKey,
  copied,
  onCopy,
  label,
}: {
  content: string;
  copyKey: string;
  copied: string | null;
  onCopy: (text: string, key: string) => void;
  label?: string;
}) {
  return (
    <div
      className="rounded-xl overflow-hidden border border-coolGray-900"
      style={{ background: "rgba(244,244,245,0.5)" }}
    >
      {label && (
        <div
          className="flex items-center justify-between px-4 py-2 border-b border-coolGray-900"
          style={{ background: "#ECEDEE" }}
        >
          <span className="font-inter text-[10px] font-semibold tracking-widest text-coolGray-500 uppercase">
            {label}
          </span>
          <button
            type="button"
            onClick={() => onCopy(content, copyKey)}
            aria-label="Copy to clipboard"
            className="inline-flex items-center gap-1.5 px-2.5 h-6 rounded border border-coolGray-800 bg-white font-inter text-[11px] text-coolGray-500 hover:text-parseableBlue-500 hover:border-parseableBlue-500/30 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#3A3A8C]"
          >
            {copied === copyKey ? (
              <>
                <IconCheck
                  size={11}
                  stroke={2}
                  aria-hidden="true"
                  className="text-[#059669]"
                />{" "}
                Copied
              </>
            ) : (
              <>
                <IconCopy size={11} stroke={1.5} aria-hidden="true" /> Copy
              </>
            )}
          </button>
        </div>
      )}
      <pre
        className="px-5 py-3 text-[13px] leading-6 overflow-x-auto"
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

function SectionLabel({ children }: { children: ReactNode }) {
  return <p className="font-inter text-xs text-black/40 mb-2">{children}</p>;
}

export function QuickSetup() {
  const [active, setActive] = useState<Client>("Cursor");
  const [mode, setMode] = useState<ParseableMode>("cloud");
  const { copied, copy } = useCopy();
  const manual = manualConfig(mode)[active];
  const headers = authHeaders(mode);
  const cliHeaders = Object.entries(headers)
    .map(([key, value]) => `--header "${key}: ${value}"`)
    .join(" ");

  return (
    <section className="mt-16 pb-8">
      <div className="max-w-page mx-auto px-4 md:px-0">
        <div className="rounded-xl overflow-hidden border border-black/[0.07] bg-white shadow-[0_4px_24px_0_rgba(0,0,0,0.07)]">
          {/* Tabs */}
          <div className="flex items-center justify-center border-b border-black/6 px-6 gap-0 overflow-x-auto overflow-y-hidden">
            <div className="flex gap-0 min-w-max" role="tablist">
              {CLIENTS.map((client) => (
                <button
                  key={client}
                  type="button"
                  role="tab"
                  aria-selected={active === client}
                  aria-controls="setup-panel"
                  onClick={() => setActive(client)}
                  className={`flex-none inline-flex cursor-pointer items-center gap-1.5 px-4 py-4 font-inter text-[13px] border-b-2 -mb-px transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3A3A8C] ${
                    active === client
                      ? "border-parseableBlue-500 text-parseableBlue-500 font-medium"
                      : "border-transparent text-[#3F404D] hover:text-[#14151A]"
                  }`}
                >
                  <span style={{ opacity: active === client ? 1 : 0.45 }}>
                    {CLIENT_ICONS[client]}
                  </span>
                  {client}
                </button>
              ))}
            </div>
          </div>

          {/* Tab content */}
          <div id="setup-panel" className="p-6 flex flex-col gap-4 min-w-0">
            <div className="inline-flex self-start rounded-lg p-1 border border-black/[0.07] bg-black/2">
              {(["cloud", "self-hosted"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  aria-pressed={mode === option}
                  onClick={() => setMode(option)}
                  className={`cursor-pointer px-3 py-1.5 rounded-md font-inter text-xs transition-colors ${
                    mode === option
                      ? "bg-white text-[#14151A] shadow-[0_1px_3px_0_rgba(0,0,0,0.08)] font-medium"
                      : "text-black/40 hover:text-black/70"
                  }`}
                >
                  {option === "cloud" ? "Parseable Cloud" : "Self-hosted"}
                </button>
              ))}
            </div>
            <p className="font-inter text-sm text-black/55 leading-6">
              {mode === "cloud"
                ? "Connect to the remote MCP endpoint with your Parseable Cloud API key. Cloud routing is resolved automatically; no Parseable URL or OAuth sign-in is required."
                : active === "Claude Desktop"
                  ? "Run the server locally over stdio for self-hosted Parseable. Replace the URL and API key, save, then restart Claude Desktop."
                  : "Add your self-hosted Parseable URL and API key. Requests authenticate through headers; no OAuth sign-in is required."}
            </p>
            {active === "Claude Code" && (
              <>
                <div>
                  <SectionLabel>CLI</SectionLabel>
                  <DarkCodeBlock
                    content={`claude mcp add --transport http parseable ${HOSTED_URL} --scope user ${cliHeaders}`}
                    copyKey="cli-cc"
                    copied={copied}
                    onCopy={copy}
                  />
                </div>
              </>
            )}
            <div>
              <SectionLabel>Manual configuration · {manual.file}</SectionLabel>
              <DarkCodeBlock
                content={manual.content}
                copyKey={`config-${active}`}
                copied={copied}
                onCopy={copy}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Demo ─────────────────────────────────────────────────────────────────────
