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
              Query logs, metrics, traces, and alerts without leaving Slack,
              right in the thread.
            </p>
            <ul className="flex flex-col gap-3">
              {[
                "Ask questions in plain English, get answers from your observability data",
                "Works in any channel: alert threads, incidents, on-call, DMs",
                "Plays well with PagerDuty, Grafana, and custom webhooks",
                "Scoped to your team's existing RBAC permissions",
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
            <div className="flex flex-wrap items-center gap-4 mt-2">
              <a
                href="https://slack.com/oauth/v2/authorize?client_id=9215702685972.11441171822325&scope=app_mentions:read,channels:history,channels:read,chat:write,commands,groups:history,im:history,mpim:history,team:read,users:read,users:read.email&user_scope="
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt="Add to Slack"
                  height={40}
                  width={139}
                  src="https://platform.slack-edge.com/img/add_to_slack.png"
                  srcSet="https://platform.slack-edge.com/img/add_to_slack.png 1x, https://platform.slack-edge.com/img/add_to_slack@2x.png 2x"
                />
              </a>
            </div>
          </div>

          {/* Right: Slack thread preview */}
          <div className="rounded-xl overflow-hidden mx-auto" style={{ maxWidth: "100%" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/slackbot-preview.png"
              alt="Parseable Slack bot answering a data ingestion question in a thread"
              width={480}
              height={503}
              className="w-full h-auto"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── CTA Banner ───────────────────────────────────────────────────────────────
