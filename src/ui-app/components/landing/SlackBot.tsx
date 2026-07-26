import { IconArrowUpRight } from "@tabler/icons-react";

export function SlackBot() {
  return (
    <section className="mt-40">
      <div className="max-w-page mx-auto px-4 md:px-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          {/* Left: text */}
          <div className="flex flex-col gap-6">
            <h2
              className="font-sans text-[2.75rem] font-medium leading-[112%] tracking-tight text-[rgba(0,0,0,0.76)]"
              style={{ fontFamily: '"Open Sans", sans-serif' }}
            >
              Your entire observability stack, accessible from Slack
            </h2>
            <p className="font-inter text-base text-black/50 leading-7">
              Ask anything about your infrastructure directly in Slack. Query
              logs, metrics, traces, and alerts in plain English - the Parseable
              bot responds with real data from your stack, right in the thread.
            </p>
            <ul className="flex flex-col gap-3">
              {[
                "Ask questions in plain English, get answers from your observability data",
                "Works inside any channel - alert threads, incidents, on-call channels",
                "Integrates with PagerDuty, Grafana, and custom webhooks",
                "Respects your team's RBAC permissions",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 font-inter text-sm text-black/60"
                >
                  <svg
                    width="14"
                    height="11"
                    viewBox="0 0 14 11"
                    fill="none"
                    aria-hidden="true"
                    className="mt-0.5 shrink-0"
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
              href="https://www.parseable.com/docs/slack-bot"
              target="_blank"
              rel="noopener noreferrer"
              className="self-start inline-flex items-center gap-1.5 font-inter text-sm font-medium text-[#3A3A8C] hover:text-[#2F2F70] hover:underline transition-colors mt-2"
            >
              Set up the Slack bot{" "}
              <IconArrowUpRight size={14} aria-hidden="true" />
            </a>
          </div>

          {/* Right: mock Slack thread */}
          <div className="rounded-xl border border-black/[0.07] bg-white shadow-[0_4px_24px_0_rgba(0,0,0,0.06)] overflow-hidden">
            {/* Slack header bar */}
            <div
              className="flex items-center gap-2 px-4 py-3 border-b border-black/6"
              style={{ background: "#3F0E40" }}
            >
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-white/20" />
                <span className="w-3 h-3 rounded-full bg-white/20" />
                <span className="w-3 h-3 rounded-full bg-white/20" />
              </div>
              <span className="ml-2 font-inter text-xs text-white/60">
                # alerts-production
              </span>
            </div>
            {/* Messages */}
            <div className="flex flex-col gap-4 p-5">
              {/* Alert */}
              <div className="flex items-start gap-3">
                <div
                  className="w-8 h-8 rounded-md flex items-center justify-center shrink-0"
                  style={{ background: "#FEE2E2" }}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M8 2L14.5 13H1.5L8 2Z"
                      stroke="#DC2626"
                      strokeWidth="1.5"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M8 6v3M8 11v.5"
                      stroke="#DC2626"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-inter text-[13px] font-semibold text-[#1D1C1D]">
                      PagerDuty
                    </span>
                    <span className="font-inter text-[11px] text-black/30">
                      9:14 AM
                    </span>
                  </div>
                  <p className="font-inter text-[13px] text-[#1D1C1D] leading-5">
                    🔴 <span className="font-semibold">P1 alert:</span> Error
                    rate on{" "}
                    <code className="text-xs bg-black/6 px-1 rounded">
                      api-gateway
                    </code>{" "}
                    exceeded 5% for 3 min
                  </p>
                </div>
              </div>
              {/* User question */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#3A3A8C] flex items-center justify-center shrink-0">
                  <span className="font-inter text-[11px] font-bold text-white">
                    SK
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-inter text-[13px] font-semibold text-[#1D1C1D]">
                      Shivam
                    </span>
                    <span className="font-inter text-[11px] text-black/30">
                      9:15 AM
                    </span>
                  </div>
                  <p className="font-inter text-[13px] text-[#1D1C1D] leading-5">
                    @parseable show me the errors from api-gateway in the last
                    10 minutes
                  </p>
                </div>
              </div>
              {/* Bot response */}
              <div className="flex items-start gap-3">
                <div
                  className="w-8 h-8 rounded-md flex items-center justify-center shrink-0 border border-black/8"
                  style={{ background: "#F4F4F5" }}
                >
                  <img
                    src="/assets/CompleteLogo.svg"
                    alt="Parseable"
                    width={20}
                    height={20}
                    style={{ objectFit: "contain" }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-inter text-[13px] font-semibold text-[#1D1C1D]">
                      Parseable
                    </span>
                    <span className="font-inter text-white bg-[#3A3A8C] px-1.5 py-0.5 rounded text-[10px]">
                      App
                    </span>
                    <span className="font-inter text-[11px] text-black/30">
                      9:15 AM
                    </span>
                  </div>
                  <div
                    className="rounded-lg border border-black/[0.07] p-3 mt-1"
                    style={{ background: "#F9F9FB" }}
                  >
                    <p className="font-inter text-[12px] text-black/60 mb-2">
                      Found{" "}
                      <span className="font-semibold text-[#DC2626]">
                        847 errors
                      </span>{" "}
                      in the last 10 min - 94% from one route:
                    </p>
                    <pre
                      className="text-[11px] text-[#27272A] overflow-x-auto"
                      style={{ fontFamily: '"JetBrains Mono", monospace' }}
                    >
                      <code>
                        POST /v2/ingest → 503 Service Unavailable{"\n"}upstream:
                        kafka-broker-3 (connection refused){"\n"}first seen:
                        09:11:42 UTC
                      </code>
                    </pre>
                    <p className="font-inter text-[12px] text-black/50 mt-2">
                      Likely cause:{" "}
                      <span className="text-black/70">
                        kafka-broker-3 is unreachable
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── CTA Banner ───────────────────────────────────────────────────────────────
