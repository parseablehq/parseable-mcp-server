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
    <img src="/assets/clients/claude-ai.svg" width={20} height={20} alt="" aria-hidden="true" />
  ),
  "ChatGPT Desktop": (
    <img src="/assets/clients/openai-chatgpt.svg" width={20} height={20} alt="" aria-hidden="true" />
  ),
  Codex: (
    <img src="/assets/clients/openai-chatgpt.svg" width={20} height={20} alt="" aria-hidden="true" />
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

const HOSTED_URL = `${window.location.origin}/mcp`;
const PARSEABLE_URL = "https://your-parseable.example.com";
const API_KEY = "your-parseable-api-key";
const AUTH_HEADERS = {
  "X-Parseable-URL": PARSEABLE_URL,
  "X-API-Key": API_KEY,
};

const CODEX_TOML = `[mcp_servers.parseable]
url = "${HOSTED_URL}"
http_headers = { "X-Parseable-URL" = "${PARSEABLE_URL}", "X-API-Key" = "${API_KEY}" }`;

const MANUAL_CONFIG: Record<Client, { file: string; content: string }> = {
  "Claude Code": {
    file: "~/.claude.json",
    content: JSON.stringify({
      mcpServers: {
        parseable: { type: "http", url: HOSTED_URL, headers: AUTH_HEADERS },
      },
    }, null, 2),
  },
  Cursor: {
    file: "~/.cursor/mcp.json",
    content: JSON.stringify({
      mcpServers: {
        parseable: { type: "http", url: HOSTED_URL, headers: AUTH_HEADERS },
      },
    }, null, 2),
  },
  "VS Code": {
    file: ".vscode/mcp.json",
    content: JSON.stringify({
      servers: {
        parseable: { type: "http", url: HOSTED_URL, headers: AUTH_HEADERS },
      },
    }, null, 2),
  },
  "Claude Desktop": {
    file: "claude_desktop_config.json",
    content: JSON.stringify({
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
    }, null, 2),
  },
  "ChatGPT Desktop": {
    file: "~/.codex/config.toml",
    content: CODEX_TOML,
  },
  Codex: {
    file: "~/.codex/config.toml",
    content: CODEX_TOML,
  },
  Windsurf: {
    file: "~/.codeium/windsurf/mcp_config.json",
    content: JSON.stringify({
      mcpServers: {
        parseable: { serverUrl: HOSTED_URL, headers: AUTH_HEADERS },
      },
    }, null, 2),
  },
};

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
      className="rounded-xl overflow-hidden border border-[#E4E4E7]"
      style={{ background: "rgba(244,244,245,0.5)" }}
    >
      {label && (
        <div
          className="flex items-center justify-between px-4 py-2 border-b border-[#E4E4E7]"
          style={{ background: "#ECEDEE" }}
        >
          <span className="font-inter text-[10px] font-semibold tracking-widest text-[#71717A] uppercase">
            {label}
          </span>
          <button
            type="button"
            onClick={() => onCopy(content, copyKey)}
            aria-label="Copy to clipboard"
            className="inline-flex items-center gap-1.5 px-2.5 h-6 rounded border border-[#D4D4D8] bg-white font-inter text-[11px] text-[#71717A] hover:text-[#3A3A8C] hover:border-[#3A3A8C]/30 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#3A3A8C]"
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
  const { copied, copy } = useCopy();
  const manual = MANUAL_CONFIG[active];

  return (
    <section className="mt-16 pb-8">
      <div className="max-w-225 mx-auto px-4 md:px-0">
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
                      ? "border-[#3A3A8C] text-[#3A3A8C] font-medium"
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
            <p className="font-inter text-sm text-black/55 leading-6">
              {active === "Claude Desktop"
                ? "Claude Desktop runs the server locally over stdio. Replace the Parseable URL and API key, save, then restart Claude Desktop."
                : "Replace credential placeholders below with your Parseable URL and API key. Requests authenticate through headers - no OAuth sign-in required."}
            </p>
            {active === "Claude Code" && (
              <>
                <div>
                  <SectionLabel>CLI</SectionLabel>
                  <DarkCodeBlock
                    content={`claude mcp add --transport http parseable ${HOSTED_URL} --scope user --header "X-Parseable-URL: ${PARSEABLE_URL}" --header "X-API-Key: ${API_KEY}"`}
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
