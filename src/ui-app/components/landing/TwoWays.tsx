import {
  IconArrowUpRight,
  IconCheck,
  IconCopy,
  IconPlugConnected,
  IconTerminal2,
} from "@tabler/icons-react";
import { useCallback, useState } from "react";

type CopyKey = string;

function useCopy() {
  const [copied, setCopied] = useState<CopyKey | null>(null);
  const copy = useCallback((text: string, key: CopyKey) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }, []);
  return { copied, copy };
}

const HOSTED_URL = `${window.location.origin}/mcp`;
const PARSEABLE_URL = "https://your-parseable.example.com";
const API_KEY = "your-parseable-api-key";

const DEMO_LOG_ROWS = [
  {
    ts: "14:02:31",
    svc: "payment-service",
    level: "ERROR",
    msg: "charge_stripe: timeout after 5000ms",
  },
  {
    ts: "14:02:29",
    svc: "payment-service",
    level: "ERROR",
    msg: "charge_stripe: timeout after 5000ms",
  },
  {
    ts: "14:02:26",
    svc: "auth-service",
    level: "ERROR",
    msg: "JWT decode failed: signature mismatch",
  },
  {
    ts: "14:02:21",
    svc: "payment-service",
    level: "ERROR",
    msg: "charge_stripe: connection refused",
  },
  {
    ts: "14:02:18",
    svc: "api-gateway",
    level: "ERROR",
    msg: "upstream timeout: payment-service:3001",
  },
];

function Demo() {
  return (
    <section className="mt-40">
      <div className="max-w-page mx-auto px-4 md:px-0">
        {/* Section header */}
        <div className="flex flex-col items-center text-center gap-4 mb-14">
          <h2
            className="font-sans text-[3rem] font-medium leading-[112%] tracking-tight text-[rgba(0,0,0,0.76)]"
            style={{ fontFamily: '"Open Sans", sans-serif' }}
          >
            Debug production without opening a tab
          </h2>
          <p className="max-w-lg font-inter text-base text-black/60 leading-7">
            Ask a question in plain English. The MCP server translates it to
            SQL, queries Parseable, and returns structured results - right in
            your AI client.
          </p>
        </div>

        {/* Mock conversation */}
        <div className="max-w-2xl mx-auto flex flex-col gap-4">
          {/* User message */}
          <div className="flex justify-end">
            <div className="max-w-sm bg-parseableBlue-500 text-white rounded-xl rounded-tr-sm px-4 py-3 font-inter text-sm leading-6">
              Why is the payment service throwing errors? Show me recent logs.
            </div>
          </div>

          {/* Tool call chip */}
          <div className="flex justify-start">
            <div
              className="inline-flex items-center gap-2 px-3 py-2 rounded border border-black/8 bg-white font-mono text-xs text-[#5E5F6E]"
              style={{
                fontFamily: '"JetBrains Mono", ui-monospace, monospace',
              }}
            >
              <IconTerminal2
                size={13}
                stroke={1.5}
                aria-hidden="true"
                className="text-parseableBlue-500"
              />
              <span className="text-parseableBlue-500">query_sql</span>
              <span className="text-black/30">·</span>
              <span>
                SELECT * FROM logs WHERE service = &apos;payment-service&apos;
                AND level = &apos;ERROR&apos; LIMIT 50
              </span>
            </div>
          </div>

          {/* Result table */}
          <div className="rounded-xl border border-black/8 overflow-hidden bg-white">
            <div className="px-4 py-2.5 border-b border-black/6 flex items-center justify-between">
              <span className="font-inter text-xs font-medium text-[#5E5F6E]">
                Result · 5 rows
              </span>
              <span
                className="font-mono text-[10px] text-black/30"
                style={{
                  fontFamily: '"JetBrains Mono", ui-monospace, monospace',
                }}
              >
                32ms
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-inter">
                <thead>
                  <tr className="border-b border-black/6 bg-black/2">
                    <th className="text-left px-4 py-2 font-medium text-[#5E5F6E] whitespace-nowrap">
                      Timestamp
                    </th>
                    <th className="text-left px-4 py-2 font-medium text-[#5E5F6E] whitespace-nowrap">
                      Service
                    </th>
                    <th className="text-left px-4 py-2 font-medium text-[#5E5F6E]">
                      Level
                    </th>
                    <th className="text-left px-4 py-2 font-medium text-[#5E5F6E]">
                      Message
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {DEMO_LOG_ROWS.map((row, i) => (
                    <tr
                      key={i}
                      className="border-b border-black/4 last:border-0"
                    >
                      <td
                        className="px-4 py-2 font-mono text-black/50 whitespace-nowrap"
                        style={{
                          fontFamily:
                            '"JetBrains Mono", ui-monospace, monospace',
                        }}
                      >
                        {row.ts}
                      </td>
                      <td className="px-4 py-2 text-[#14151A] whitespace-nowrap">
                        {row.svc}
                      </td>
                      <td className="px-4 py-2">
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-red-50 text-red-600">
                          {row.level}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-black/60 max-w-60 truncate">
                        {row.msg}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Agent response */}
          <div className="flex justify-start">
            <div className="max-w-lg bg-white border border-black/8 rounded-xl rounded-tl-sm px-4 py-3 font-inter text-sm leading-6 text-[#14151A]">
              <p>
                The payment service is experiencing repeated Stripe API timeouts
                - 4 of the 5 recent errors are
                <code
                  className="mx-1 px-1 py-0.5 rounded text-xs bg-black/5 font-mono"
                  style={{
                    fontFamily: '"JetBrains Mono", ui-monospace, monospace',
                  }}
                >
                  charge_stripe: timeout after 5000ms
                </code>
                with one connection refused.
              </p>
              <p className="mt-2 text-black/60">
                The api-gateway is also logging upstream timeouts to
                payment-service:3001, suggesting the service is either
                overloaded or its Stripe connection is degraded. I can check
                latency trends or recent deploys if you&apos;d like.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Two ways ─────────────────────────────────────────────────────────────────

export function TwoWays() {
  const [activeTab, setActiveTab] = useState<"hosted" | "local">("hosted");
  const [remoteMode, setRemoteMode] = useState<"cloud" | "self-hosted">(
    "cloud",
  );
  const { copied, copy } = useCopy();
  const hostedHeaders =
    remoteMode === "cloud"
      ? `X-Parseable-Mode: cloud\nX-API-Key: ${API_KEY}`
      : `X-Parseable-URL: ${PARSEABLE_URL}\nX-API-Key: ${API_KEY}`;
  const hostedCommand = `claude mcp add --transport http parseable ${HOSTED_URL} --scope user ${hostedHeaders
    .split("\n")
    .map((header) => `--header "${header}"`)
    .join(" ")}`;

  const localConfig = JSON.stringify(
    {
      mcpServers: {
        parseable: {
          command: "npx",
          args: ["-y", "@parseable/parseable-mcp-server"],
          env: {
            PARSEABLE_URL: "https://your-instance.parseable.com",
            PARSEABLE_API_KEY: "your-api-key",
          },
        },
      },
    },
    null,
    2,
  );

  return (
    <section className="mt-40">
      <div className="max-w-page mx-auto px-4 md:px-0">
        {/* Header */}
        <div className="flex flex-col items-center text-center gap-4 mb-12">
          <h2
            className="font-sans text-[3rem] font-medium leading-[112%] tracking-tight text-[rgba(0,0,0,0.76)]"
            style={{ fontFamily: '"Open Sans", sans-serif' }}
          >
            Two ways to connect
          </h2>
          <p className="max-w-lg font-inter text-base text-black/50 leading-7">
            Connect to a deployed MCP server over HTTP, or run the open-source
            server locally over stdio.
          </p>
        </div>

        {/* Tab toggle */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex rounded-lg p-1 border border-black/[0.07] bg-black/2">
            {(["hosted", "local"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`inline-flex items-center gap-2 px-5 py-2 rounded-md font-inter text-sm transition-colors ${
                  activeTab === tab
                    ? "bg-white text-[#14151A] shadow-[0_1px_3px_0_rgba(0,0,0,0.08)] font-medium"
                    : "text-black/40 hover:text-black/70"
                }`}
              >
                {tab === "hosted" ? (
                  <IconPlugConnected size={15} stroke={1.5} />
                ) : (
                  <IconTerminal2 size={15} stroke={1.5} />
                )}
                {tab === "hosted" ? "Remote MCP" : "Local MCP"}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {/* Left: info card */}
          <div className="rounded-xl p-8 flex flex-col gap-6 border border-black/[0.07] bg-white shadow-[0_1px_4px_0_rgba(0,0,0,0.04)]">
            {activeTab === "hosted" ? (
              <>
                <span
                  className="self-start inline-flex items-center px-2.5 py-1 rounded text-[11px] font-semibold"
                  style={{
                    background: "rgba(217,119,6,0.08)",
                    color: "#B45309",
                  }}
                >
                  Streamable HTTP
                </span>
                <div>
                  <h3
                    className="font-sans text-2xl font-medium text-[#14151A] mb-2"
                    style={{ fontFamily: '"Open Sans", sans-serif' }}
                  >
                    Remote MCP
                  </h3>
                  <p className="font-inter text-sm text-black/55 leading-6">
                    Connect to this deployed MCP endpoint. Cloud needs your API
                    key; self-hosted also needs your Parseable URL.
                  </p>
                </div>
                <ul className="flex flex-col gap-3">
                  {[
                    "Direct Parseable API key authentication",
                    "No MCP server installation on the client",
                    "Works with Parseable Cloud and self-hosted instances",
                    "Credentials remain in your MCP client configuration",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-3 font-inter text-sm text-black/60"
                    >
                      <svg
                        width="14"
                        height="11"
                        viewBox="0 0 14 11"
                        fill="none"
                        aria-hidden="true"
                      >
                        <path
                          d="M1 5.5l4 4 8-8"
                          stroke="#00A896"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
                <a
                  href="https://www.parseable.com/docs/mcp"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-inter text-sm font-medium text-parseableBlue-500 hover:text-[#2F2F70] hover:underline transition-colors mt-2"
                >
                  Remote MCP setup guide <IconArrowUpRight size={14} />
                </a>
              </>
            ) : (
              <>
                <span
                  className="self-start inline-flex items-center px-2.5 py-1 rounded text-[11px] font-semibold"
                  style={{ background: "rgba(0,0,0,0.05)", color: "#5E5F6E" }}
                >
                  Open source
                </span>
                <div>
                  <h3
                    className="font-sans text-2xl font-medium text-[#14151A] mb-2"
                    style={{ fontFamily: '"Open Sans", sans-serif' }}
                  >
                    Local MCP
                  </h3>
                  <p className="font-inter text-sm text-black/55 leading-6">
                    Run the Parseable MCP server on your own machine. Full
                    control over credentials and config.
                  </p>
                </div>
                <ul className="flex flex-col gap-3">
                  {[
                    "Open source under Apache 2.0",
                    "Runs entirely inside your environment",
                    "Works with self-hosted Parseable instances",
                    "Full control over credentials and config",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-3 font-inter text-sm text-black/60"
                    >
                      <svg
                        width="14"
                        height="11"
                        viewBox="0 0 14 11"
                        fill="none"
                        aria-hidden="true"
                      >
                        <path
                          d="M1 5.5l4 4 8-8"
                          stroke="#00A896"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="flex gap-5 mt-2">
                  <a
                    href="https://www.parseable.com/docs/mcp"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 font-inter text-sm font-medium text-parseableBlue-500 hover:text-[#2F2F70] hover:underline transition-colors"
                  >
                    Local MCP setup guide <IconArrowUpRight size={14} />
                  </a>
                  <a
                    href="https://github.com/parseablehq/parseable-mcp-server"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 font-inter text-sm font-medium text-parseableBlue-500 hover:text-[#2F2F70] hover:underline transition-colors"
                  >
                    View on GitHub <IconArrowUpRight size={14} />
                  </a>
                </div>
              </>
            )}
          </div>

          {/* Right: numbered steps */}
          <div className="flex flex-col gap-4">
            {activeTab === "hosted" ? (
              <>
                <div className="inline-flex self-start rounded-lg p-1 border border-black/[0.07] bg-black/2">
                  {(["cloud", "self-hosted"] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      aria-pressed={remoteMode === mode}
                      onClick={() => setRemoteMode(mode)}
                      className={`cursor-pointer px-3 py-1.5 rounded-md font-inter text-xs transition-colors ${
                        remoteMode === mode
                          ? "bg-white text-[#14151A] shadow-[0_1px_3px_0_rgba(0,0,0,0.08)] font-medium"
                          : "text-black/40 hover:text-black/70"
                      }`}
                    >
                      {mode === "cloud" ? "Parseable Cloud" : "Self-hosted"}
                    </button>
                  ))}
                </div>
                <div>
                  <div
                    className="rounded-xl border border-coolGray-900 overflow-hidden"
                    style={{ background: "rgba(244,244,245,0.5)" }}
                  >
                    <div className="flex items-center justify-between gap-3 px-4 py-2 border-b border-coolGray-900">
                      <p className="font-inter text-xs font-medium text-black/45 truncate">
                        1. Add the Parseable MCP server
                      </p>
                      <button
                        type="button"
                        onClick={() => copy(hostedCommand, "tw-step1")}
                        className="text-coolGray-500 hover:text-[#14151A] transition-colors shrink-0"
                      >
                        {copied === "tw-step1" ? (
                          <IconCheck
                            size={13}
                            stroke={2}
                            className="text-[#00A896]"
                          />
                        ) : (
                          <IconCopy size={13} stroke={1.5} />
                        )}
                      </button>
                    </div>
                    <pre
                      className="px-4 py-3 text-[13px] text-coolGray-200 overflow-x-auto"
                      style={{ fontFamily: '"JetBrains Mono", monospace' }}
                    >
                      <code>{hostedCommand}</code>
                    </pre>
                  </div>
                </div>
                <div>
                  <div
                    className="rounded-xl border border-coolGray-900 overflow-hidden"
                    style={{ background: "rgba(244,244,245,0.5)" }}
                  >
                    <div className="flex items-center justify-between gap-3 px-4 py-2 border-b border-coolGray-900">
                      <p className="font-inter text-xs font-medium text-black/45 truncate">
                        2. Credentials sent with every request
                      </p>
                    </div>
                    <pre
                      className="px-4 py-3 text-[13px] text-coolGray-200"
                      style={{ fontFamily: '"JetBrains Mono", monospace' }}
                    >
                      <code>{hostedHeaders}</code>
                    </pre>
                  </div>
                </div>
                <div>
                  <div
                    className="rounded-xl border border-coolGray-900 overflow-hidden"
                    style={{ background: "rgba(244,244,245,0.5)" }}
                  >
                    <div className="flex items-center justify-between gap-3 px-4 py-2 border-b border-coolGray-900">
                      <p className="font-inter text-xs font-medium text-black/45 truncate">
                        Endpoint URL
                      </p>
                      <button
                        type="button"
                        onClick={() => copy(HOSTED_URL, "tw-url")}
                        className="text-coolGray-500 hover:text-[#14151A] transition-colors shrink-0"
                      >
                        {copied === "tw-url" ? (
                          <IconCheck
                            size={13}
                            stroke={2}
                            className="text-[#00A896]"
                          />
                        ) : (
                          <IconCopy size={13} stroke={1.5} />
                        )}
                      </button>
                    </div>
                    <pre
                      className="px-4 py-3 text-[13px] text-coolGray-200 overflow-x-auto"
                      style={{ fontFamily: '"JetBrains Mono", monospace' }}
                    >
                      <code>{HOSTED_URL}</code>
                    </pre>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div>
                  <div
                    className="rounded-xl border border-coolGray-900 overflow-hidden"
                    style={{ background: "rgba(244,244,245,0.5)" }}
                  >
                    <div className="flex items-center justify-between gap-3 px-4 py-2 border-b border-coolGray-900">
                      <p className="font-inter text-xs font-medium text-black/45 truncate">
                        1. Install
                      </p>
                      <button
                        type="button"
                        onClick={() =>
                          copy(
                            "npx -y @parseable/parseable-mcp-server init",
                            "tw-install",
                          )
                        }
                        className="text-coolGray-500 hover:text-[#14151A] transition-colors shrink-0"
                      >
                        {copied === "tw-install" ? (
                          <IconCheck
                            size={13}
                            stroke={2}
                            className="text-[#00A896]"
                          />
                        ) : (
                          <IconCopy size={13} stroke={1.5} />
                        )}
                      </button>
                    </div>
                    <pre
                      className="px-4 py-3 text-[13px] text-coolGray-200"
                      style={{ fontFamily: '"JetBrains Mono", monospace' }}
                    >
                      <code>npx -y @parseable/parseable-mcp-server init</code>
                    </pre>
                  </div>
                </div>
                <div>
                  <div
                    className="rounded-xl border border-coolGray-900 overflow-hidden"
                    style={{ background: "rgba(244,244,245,0.5)" }}
                  >
                    <div className="flex items-center justify-between gap-3 px-4 py-2 border-b border-coolGray-900">
                      <p className="font-inter text-xs font-medium text-black/45 truncate">
                        2. Configure
                      </p>
                      <button
                        type="button"
                        onClick={() => copy(localConfig, "tw-config")}
                        className="text-coolGray-500 hover:text-[#14151A] transition-colors shrink-0"
                      >
                        {copied === "tw-config" ? (
                          <IconCheck
                            size={13}
                            stroke={2}
                            className="text-[#00A896]"
                          />
                        ) : (
                          <IconCopy size={13} stroke={1.5} />
                        )}
                      </button>
                    </div>
                    <pre
                      className="px-4 py-3 text-[13px] text-coolGray-200 overflow-x-auto"
                      style={{ fontFamily: '"JetBrains Mono", monospace' }}
                    >
                      <code>{localConfig}</code>
                    </pre>
                  </div>
                </div>
                <div>
                  <div
                    className="rounded-xl border border-coolGray-900 overflow-hidden"
                    style={{ background: "rgba(244,244,245,0.5)" }}
                  >
                    <div className="flex items-center justify-between gap-3 px-4 py-2 border-b border-coolGray-900">
                      <p className="font-inter text-xs font-medium text-black/45 truncate">
                        3. Restart your MCP client
                      </p>
                    </div>
                    <pre
                      className="px-4 py-3 text-[13px] text-coolGray-200 overflow-x-auto"
                      style={{ fontFamily: '"JetBrains Mono", monospace' }}
                    >
                      <code>Parseable tools appear after restart</code>
                    </pre>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Feature Grid ─────────────────────────────────────────────────────────────
