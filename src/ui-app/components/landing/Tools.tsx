import { IconCheck, IconCopy } from "@tabler/icons-react";
import { useCallback, useState } from "react";

const STEPS = [
  {
    number: "01",
    title: "Authenticate",
    description: "Your existing Parseable API key establishes instance and tenant access.",
  },
  {
    number: "02",
    title: "Discover",
    description: "The connected OSS, Enterprise, or Cloud instance returns its live tool catalog.",
  },
  {
    number: "03",
    title: "Execute",
    description: "Tool calls run inside Parseable with server-side validation and RBAC.",
  },
];

const TOOL_GROUPS = [
  { title: "Datasets and events", tools: ["list_datasets", "get_dataset_info", "get_dataset_schema", "get_dataset_stats", "sample_events"] },
  { title: "Queries", tools: ["query_sql", "query_promql", "explain_query"] },
  { title: "Alerts", tools: ["list_alerts", "get_alert", "list_alert_tags", "enable_alert", "disable_alert", "evaluate_alert", "create_alert"] },
  { title: "Cluster and retention", tools: ["ping", "get_cluster_status", "get_cluster_metrics", "get_retention"] },
  { title: "Access review", tools: ["list_users", "get_user_roles", "list_roles", "get_role", "get_default_role"] },
  { title: "Alert targets", tools: ["list_alert_targets", "get_alert_target", "create_alert_target"] },
] as const;

const TOOL_MARKDOWN = TOOL_GROUPS.map(
  ({ title, tools }) => `## ${title}\n${tools.map((tool) => `- \`${tool}\``).join("\n")}`,
).join("\n\n");

export function Tools() {
  const [copied, setCopied] = useState(false);
  const copyTools = useCallback(() => {
    navigator.clipboard.writeText(TOOL_MARKDOWN).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  return (
    <section className="w-full border-t border-[#e7e7e7] py-[76px] md:mt-40 md:border-0 md:py-0">
      <div className="max-w-page mx-auto px-4 md:px-0">
        <div className="flex flex-col items-center text-center gap-4 mb-[76px] md:hidden max-w-2xl mx-auto">
          <h2 className="font-sans text-[28px] font-light leading-9 text-[#3d3d3d]">
            The full <span className="text-[#1f40ed]">Parseable toolkit,</span><br />one call away
          </h2>
          <p className="text-[15px] leading-normal text-[#6d6d6d]">
            Tool availability comes from your connected Parseable instance and follows your existing access.
          </p>
        </div>

        <div className="mb-[28px] flex justify-center md:hidden">
          <button type="button" onClick={copyTools} className="flex items-center gap-2 rounded-lg border border-[#d1d1d1] bg-white px-3 py-2 text-sm font-medium">
            Copy as Markdown {copied ? <IconCheck size={16} className="text-[#1f40ed]" /> : <IconCopy size={16} />}
          </button>
        </div>

        <div className="flex flex-col gap-5 md:hidden">
          {TOOL_GROUPS.map((group) => (
            <section key={group.title} className="rounded-2xl bg-[#fafafa] p-3">
              <h3 className="mb-3 text-base text-[#1b1b1b]">{group.title}</h3>
              <ol className="flex flex-col gap-1.5">
                {group.tools.map((tool, index) => (
                  <li key={tool} className="flex min-h-[46px] items-center rounded-xl border border-[#e7e7e7] bg-white px-3 text-sm text-[#24292e]">
                    <span className="mr-1">{index + 1}.</span>{tool}
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </div>

        <div className="mx-auto mb-14 hidden max-w-2xl flex-col items-center gap-4 text-center md:flex">
          <h2
            className="font-sans text-[28px] font-light leading-9 text-[#3d3d3d] md:text-[3rem] md:font-medium md:leading-[112%] md:tracking-tight md:text-[rgba(0,0,0,0.76)]"
            style={{ fontFamily: '"Open Sans", sans-serif' }}
          >
            Tools from your Parseable instance
          </h2>
          <p className="font-inter text-[15px] text-[#6d6d6d] leading-normal md:text-base md:text-black/50 md:leading-7">
            No fixed catalog in the MCP adapter. Your instance exposes exactly the tools supported
            by its edition and deployment.
          </p>
        </div>

        <div className="hidden grid-cols-1 gap-5 md:grid md:grid-cols-3">
          {STEPS.map((step) => (
            <div
              key={step.number}
              className="rounded-2xl bg-[#fafafa] p-5 transition-all md:rounded-xl md:border md:border-black/[0.06] md:bg-white md:p-6 md:hover:border-black/10"
            >
              <span className="font-mono text-xs text-[#3A3A8C]">{step.number}</span>
              <h3 className="mt-4 font-sans text-lg font-medium text-[#14151A]">{step.title}</h3>
              <p className="mt-2 font-inter text-sm leading-6 text-black/50">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
