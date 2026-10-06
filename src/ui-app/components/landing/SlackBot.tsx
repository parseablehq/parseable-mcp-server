import { IconCheck } from "@tabler/icons-react";

const BENEFITS = [
  "Ask questions in plain English, get answers from your observability data",
  "Works in any channel: alert threads, incidents, on-call, DMs",
  "Plays well with PagerDuty, Grafana, and custom webhooks",
  "Scoped to your team's existing RBAC permissions",
];

const SLACK_INSTALL_URL =
  "https://slack.com/oauth/v2/authorize?client_id=9215702685972.11441171822325&scope=app_mentions:read,channels:history,channels:read,chat:write,commands,groups:history,im:history,mpim:history,team:read,users:read,users:read.email&user_scope=";

export function SlackBot() {
  return (
    <section className="py-32">
      <div className="mx-auto max-w-page px-6 md:px-0">
        <div className="flex flex-col items-center justify-center border border-[#e7e7e7] bg-white p-8 md:flex-row">
          <div className="flex w-full items-stretch gap-3.5 rounded-lg max-md:flex-col">
            <div className="flex min-w-0 flex-1 flex-col items-start gap-4">
              <h2 className="w-full font-sans text-[32px] font-light leading-normal text-[#3d3d3d]">
                Your <span className="text-[#1f40ed]">entire observability stack</span>, accessible from Slack Platform
              </h2>

              <div className="flex h-[43px] w-full items-start border-b border-dashed border-[#b0b0b0] py-2.5">
                <p className="text-base font-medium leading-normal text-[#1b1b1b]">
                  Query logs, metrics, traces, and alerts without leaving Slack, right in the thread.
                </p>
              </div>

              <div className="flex w-full flex-col items-start gap-3 text-sm">
                <p className="text-[#1b1b1b]">Benefits :</p>
                <ul className="flex w-full flex-col gap-3">
                  {BENEFITS.map((item) => (
                    <li key={item} className="flex w-full items-center gap-1.5 text-[#3d3d3d]">
                      <IconCheck size={20} stroke={1.5} className="shrink-0 text-[#1f40ed]" aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <a href={SLACK_INSTALL_URL} target="_blank" rel="noopener noreferrer" className="flex h-9 items-center justify-center rounded-lg bg-[#1f40ed] px-4 py-2 text-base font-medium text-white hover:bg-[#1834c9]">
                Add to Slack
              </a>
            </div>

            <div className="flex min-h-[336px] w-full shrink-0 items-center justify-center overflow-hidden bg-[#fafafa] px-6 py-10 md:w-[487px]">
              <img
                src="/assets/slackbot-preview.png"
                alt="Parseable Slack bot answering an observability question in a thread"
                width={439}
                height={296}
                className="max-h-[296px] w-full object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
