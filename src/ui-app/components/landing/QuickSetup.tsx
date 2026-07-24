import { useCallback, useState } from "react";
import type { ReactNode } from "react";
import { IconArrowUpRight, IconCheck, IconCopy } from "@tabler/icons-react";

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
    <img src="/assets/clients/claude-ai.svg" width={20} height={20} alt="" aria-hidden="true" />
  ),
  Cursor: (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/assets/clients/cursor-mono.svg" width={20} height={20} alt="" aria-hidden="true" />
  ),
  "VS Code": (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/assets/clients/visual-studio-code.svg" width={20} height={20} alt="" aria-hidden="true" />
  ),
  "Claude Desktop": (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/assets/clients/claude-ai.svg" width={20} height={20} alt="" aria-hidden="true" />
  ),
  ChatGPT: (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/assets/clients/openai-chatgpt.svg" width={20} height={20} alt="" aria-hidden="true" />
  ),
  Windsurf: (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/assets/clients/windsurf-mono.svg" width={20} height={20} alt="" aria-hidden="true" />
  ),
  "Slack Bot": (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/assets/clients/slack.svg" width={18} height={18} alt="" aria-hidden="true" />
  ),
};

const CLIENTS = ["Claude Code", "Cursor", "VS Code", "Claude Desktop", "ChatGPT", "Windsurf", "Slack Bot"] as const;
type Client = (typeof CLIENTS)[number];

const HOSTED_URL = `${window.location.origin}/mcp`;

const MANUAL_JSON: Record<Client, { file: string; json: object }> = {
  "Claude Code": {
    file: "~/.claude/claude_code_config.json",
    json: {
      mcpServers: {
        parseable: { type: "http", url: HOSTED_URL },
      },
    },
  },
  Cursor: {
    file: "~/.cursor/mcp.json",
    json: {
      mcpServers: {
        parseable: { type: "http", url: HOSTED_URL },
      },
    },
  },
  "VS Code": {
    file: ".vscode/mcp.json",
    json: {
      servers: {
        parseable: { type: "http", url: HOSTED_URL },
      },
    },
  },
  "Claude Desktop": {
    file: "~/Library/Application Support/Claude/claude_desktop_config.json",
    json: {
      mcpServers: {
        parseable: { type: "http", url: HOSTED_URL },
      },
    },
  },
  ChatGPT: {
    file: "~/Library/Application Support/com.openai.chat/mcp.json",
    json: {
      mcpServers: {
        parseable: { type: "http", url: HOSTED_URL },
      },
    },
  },
  Windsurf: {
    file: "~/.codeium/windsurf/mcp_config.json",
    json: {
      mcpServers: {
        parseable: { type: "http", url: HOSTED_URL },
      },
    },
  },
  "Slack Bot": {
    file: "",
    json: {},
  },
};

function SectionDivider() {
  return (
    <div className="w-full h-px" style={{ background: "linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.08) 15%, rgba(0,0,0,0.08) 85%, transparent 100%)" }} />
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
    <div className="rounded-xl overflow-hidden border border-[#E4E4E7]" style={{ background: "rgba(244,244,245,0.5)" }}>
      {label && (
        <div className="flex items-center justify-between px-4 py-2 border-b border-[#E4E4E7]" style={{ background: "#ECEDEE" }}>
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
              <><IconCheck size={11} stroke={2} aria-hidden="true" className="text-[#059669]" /> Copied</>
            ) : (
              <><IconCopy size={11} stroke={1.5} aria-hidden="true" /> Copy</>
            )}
          </button>
        </div>
      )}
      <pre
        className="px-5 py-3 text-[13px] leading-6 overflow-x-auto"
        style={{ fontFamily: '"JetBrains Mono", ui-monospace, monospace', color: "#27272A" }}
      >
        <code>{content}</code>
      </pre>
    </div>
  );
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="font-inter text-xs text-black/40 mb-2">
      {children}
    </p>
  );
}

function InstallButton({ href, icon, label }: { href: string; icon: ReactNode; label: string; iconColor?: string }) {
  return (
    <a
      href={href}
      className="inline-flex items-center gap-2.5 px-4 h-10 rounded-lg border border-black/[0.1] bg-white hover:bg-black/[0.02] font-inter text-sm font-medium text-[#14151A] transition-colors shadow-[0_1px_3px_0_rgba(0,0,0,0.06)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3A3A8C]"
    >
      {icon}
      {label}
    </a>
  );
}

export function QuickSetup() {
  const [active, setActive] = useState<Client>("Cursor");
  const { copied, copy } = useCopy();
  const manual = MANUAL_JSON[active];
  const manualStr = JSON.stringify(manual.json, null, 2);

  return (
    <section className="mt-16 pb-8">
      <div className="max-w-[900px] mx-auto px-4 md:px-0">
        <div className="rounded-xl overflow-hidden border border-black/[0.07] bg-white shadow-[0_4px_24px_0_rgba(0,0,0,0.07)]">
          {/* Tabs */}
          <div className="flex items-center justify-center border-b border-black/[0.06] px-6 gap-0 overflow-x-auto">
            <div className="flex gap-0 min-w-max" role="tablist">
              {CLIENTS.map((client) => (
                <button
                  key={client}
                  type="button"
                  role="tab"
                  aria-selected={active === client}
                  aria-controls="setup-panel"
                  onClick={() => setActive(client)}
                  className={`flex-none inline-flex items-center gap-1.5 px-4 py-4 font-inter text-[13px] border-b-2 -mb-px transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3A3A8C] ${
                    active === client
                      ? "border-[#3A3A8C] text-[#3A3A8C] font-medium"
                      : "border-transparent text-[#5E5F6E] hover:text-[#14151A]"
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

            {active === "Claude Code" && (
              <>
                <div>
                  <SectionLabel>CLI</SectionLabel>
                  <DarkCodeBlock content={`claude mcp add --transport http parseable ${HOSTED_URL}`} copyKey="cli-cc" copied={copied} onCopy={copy} />
                </div>
                <div>
                  <SectionLabel>Manual configuration · {manual.file}</SectionLabel>
                  <DarkCodeBlock content={manualStr} copyKey="json-cc" copied={copied} onCopy={copy} />
                </div>
              </>
            )}

            {active === "Cursor" && (
              <>
                <div>
                  <SectionLabel>One click install</SectionLabel>
                  <InstallButton
                    href="cursor://anysphere.cursor-deeplink/mcp/install?name=parseable&config=eyJjb21tYW5kIjoibnB4IiwiYXJncyI6WyIteSIsIkBwYXJzZWFibGVocS9tY3AiXX0%3D"
                    icon={CLIENT_ICONS["Cursor"]}
                    label="Add to Cursor"
                  />
                </div>
                <div>
                  <SectionLabel>CLI</SectionLabel>
                  <DarkCodeBlock content={`npx -y @parseablehq/mcp --url ${HOSTED_URL}`} copyKey="cli-cursor" copied={copied} onCopy={copy} />
                </div>
                <div>
                  <SectionLabel>Manual configuration · {manual.file}</SectionLabel>
                  <DarkCodeBlock content={manualStr} copyKey="json-cursor" copied={copied} onCopy={copy} />
                </div>
              </>
            )}

            {active === "VS Code" && (
              <>
                <div>
                  <SectionLabel>One click install</SectionLabel>
                  <div className="flex flex-wrap gap-2">
                    <InstallButton
                      href="vscode:extension/mcp/install?name=parseable&config=eyJjb21tYW5kIjoibnB4IiwiYXJncyI6WyIteSIsIkBwYXJzZWFibGVocS9tY3AiXX0%3D"
                      icon={CLIENT_ICONS["VS Code"]}
                      label="Add to VS Code"
                    />
                    <InstallButton
                      href="vscode-insiders:extension/mcp/install?name=parseable&config=eyJjb21tYW5kIjoibnB4IiwiYXJncyI6WyIteSIsIkBwYXJzZWFibGVocS9tY3AiXX0%3D"
                      icon={CLIENT_ICONS["VS Code"]}
                      label="Add to VS Code Insiders"
                    />
                  </div>
                </div>
                <div>
                  <SectionLabel>CLI</SectionLabel>
                  <DarkCodeBlock content={`npx -y @parseablehq/mcp setup vscode --url ${HOSTED_URL}\nnpx -y @parseablehq/mcp setup vscode-insiders --url ${HOSTED_URL}`} copyKey="cli-vscode" copied={copied} onCopy={copy} />
                </div>
                <div>
                  <SectionLabel>Manual configuration · {manual.file}</SectionLabel>
                  <DarkCodeBlock content={manualStr} copyKey="json-vscode" copied={copied} onCopy={copy} />
                </div>
              </>
            )}

            {active === "Claude Desktop" && (
              <ol className="flex flex-col gap-2.5">
                {[
                  <>Open Claude Desktop → Settings → Developer</>,
                  <>Click Edit Config to open <code className="text-xs px-1.5 py-0.5 rounded bg-black/[0.05]" style={{ fontFamily: '"JetBrains Mono", ui-monospace, monospace' }}>claude_desktop_config.json</code></>,
                  <>Add the parseable entry under <code className="text-xs px-1.5 py-0.5 rounded bg-black/[0.05]" style={{ fontFamily: '"JetBrains Mono", ui-monospace, monospace' }}>mcpServers</code> using the URL <code className="text-xs px-1.5 py-0.5 rounded bg-black/[0.05]" style={{ fontFamily: '"JetBrains Mono", ui-monospace, monospace' }}>{HOSTED_URL}</code></>,
                  <>Save and restart Claude Desktop</>,
                  <>Look for the hammer icon in chat — Parseable tools appear there</>,
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-3 font-inter text-sm text-black/60 leading-5">
                    <span className="mt-0.5 shrink-0 w-5 h-5 rounded-full bg-black/[0.05] flex items-center justify-center font-inter text-[11px] text-black/40">
                      {i + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            )}

            {active === "ChatGPT" && (
              <ol className="flex flex-col gap-2.5">
                {[
                  <>Open ChatGPT Desktop → Settings → Beta Features</>,
                  <>Enable Model Context Protocol (MCP)</>,
                  <>Go to Settings → Connectors → Add MCP Server</>,
                  <>Set the URL to <code className="text-xs px-1.5 py-0.5 rounded bg-black/[0.05]" style={{ fontFamily: '"JetBrains Mono", ui-monospace, monospace' }}>{HOSTED_URL}</code> and authenticate</>,
                  <>Restart ChatGPT and look for the tools icon in chat</>,
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-3 font-inter text-sm text-black/60 leading-5">
                    <span className="mt-0.5 shrink-0 w-5 h-5 rounded-full bg-black/[0.05] flex items-center justify-center font-inter text-[11px] text-black/40">
                      {i + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            )}

            {active === "Windsurf" && (
              <>
                <div>
                  <SectionLabel>CLI</SectionLabel>
                  <DarkCodeBlock content={`npx -y @parseablehq/mcp --url ${HOSTED_URL}`} copyKey="cli-windsurf" copied={copied} onCopy={copy} />
                </div>
                <div>
                  <SectionLabel>Manual configuration · {manual.file}</SectionLabel>
                  <DarkCodeBlock content={manualStr} copyKey="json-windsurf" copied={copied} onCopy={copy} />
                </div>
              </>
            )}

            {active === "Slack Bot" && (
              <ol className="flex flex-col gap-2.5">
                {[
                  <>Go to <a href="https://parseable.com/slack" target="_blank" rel="noopener noreferrer" className="text-[#3A3A8C] hover:underline">parseable.com/slack</a> and click <span className="font-medium text-[#14151A]">Add to Slack</span></>,
                  <>Authorize the Parseable app in your workspace</>,
                  <>In any channel, type <code className="text-xs px-1.5 py-0.5 rounded bg-black/[0.05]" style={{ fontFamily: '"JetBrains Mono", monospace' }}>/parseable connect</code> to link your Parseable instance</>,
                  <>Ask anything — <code className="text-xs px-1.5 py-0.5 rounded bg-black/[0.05]" style={{ fontFamily: '"JetBrains Mono", monospace' }}>@parseable show errors from api-gateway in the last 30 minutes</code></>,
                  <>Invite the bot to alert channels to get automatic root cause analysis on every firing alert</>,
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-3 font-inter text-sm text-black/60 leading-5">
                    <span className="mt-0.5 shrink-0 w-5 h-5 rounded-full bg-black/[0.05] flex items-center justify-center font-inter text-[11px] text-black/40">{i + 1}</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            )}

          </div>

        </div>
      </div>
    </section>
  );
}

// ─── Demo ─────────────────────────────────────────────────────────────────────
