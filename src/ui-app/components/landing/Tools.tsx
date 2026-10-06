import { useCallback, useState } from "react";
import { IconCheck, IconCopy } from "@tabler/icons-react";

type CopyKey = string;

function useCopy() {
  const [copied, setCopied] = useState<CopyKey | null>(null);
  const copy = useCallback((text: string, key: CopyKey) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  }, []);
  return { copied, copy };
}

type ToolGroup = { group: string; tools: string[] };

const TOOL_GROUPS: ToolGroup[] = [
  {
    group: "Datasets and events",
    tools: [
      "list_datasets",
      "get_dataset_info",
      "get_dataset_schema",
      "get_dataset_stats",
      "sample_events",
    ],
  },
  {
    group: "Queries",
    tools: ["query_sql", "query_promql", "explain_query"],
  },
  {
    group: "Alerts",
    tools: [
      "list_alerts",
      "get_alert",
      "list_alert_tags",
      "enable_alert",
      "disable_alert",
      "evaluate_alert",
      "create_alert",
    ],
  },
  {
    group: "Alert targets",
    tools: ["list_alert_targets", "get_alert_target", "create_alert_target"],
  },
  {
    group: "Access review",
    tools: ["list_users", "get_user_roles", "list_roles", "get_role", "get_default_role"],
  },
  {
    group: "Cluster and retention",
    tools: ["ping", "get_cluster_status", "get_cluster_metrics", "get_retention"],
  },
];

const TOOL_COUNT = TOOL_GROUPS.reduce((sum, g) => sum + g.tools.length, 0);

const TOOLS_MARKDOWN = TOOL_GROUPS.map(
  (g) => `## ${g.group}\n${g.tools.map((t) => `- ${t}`).join("\n")}`,
).join("\n\n");

function ToolListItem({
  index,
  name,
  copied,
  onCopy,
}: {
  index: number;
  name: string;
  copied: string | null;
  onCopy: (text: string, key: string) => void;
}) {
  const isCopied = copied === name;
  return (
    <li>
      <button
        type="button"
        onClick={() => onCopy(name, name)}
        aria-label={`Copy ${name}`}
        className="group flex w-full cursor-pointer items-start gap-2.5 rounded-xl border border-[#e7e7e7] bg-white p-3 text-left transition-colors hover:border-[#b0b0b0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1f40ed]"
      >
        <span className="shrink-0 text-sm leading-[1.5] text-[#24292e] tabular-nums">
          {index}.
        </span>
        <span className="flex-1 text-sm leading-[1.5] text-[#24292e]">
          {name}
        </span>
        <span className={`size-4 shrink-0 transition-opacity ${index === 1 || isCopied ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
          {isCopied ? (
            <IconCheck size={16} stroke={2} aria-hidden="true" className="text-[#1f40ed]" />
          ) : (
            <IconCopy size={16} stroke={1.5} aria-hidden="true" className="text-[#24292e]" />
          )}
        </span>
      </button>
    </li>
  );
}

function ToolGroupCard({ group, tools }: ToolGroup) {
  const { copied, copy } = useCopy();
  return (
    <div className="flex w-full flex-col gap-3 rounded-2xl bg-[#fafafa] p-3">
      <h3 className="text-base font-normal leading-[1.53] text-[#1b1b1b]">
        {group}
      </h3>
      <ol className="flex flex-col gap-1.5">
        {tools.map((tool, i) => (
          <ToolListItem
            key={tool}
            index={i + 1}
            name={tool}
            copied={copied}
            onCopy={copy}
          />
        ))}
      </ol>
    </div>
  );
}

export function Tools() {
  const { copied, copy } = useCopy();
  const isMarkdownCopied = copied === "tools-markdown";

  return (
    <section className="section-rule w-full py-32">
      <div className="mx-auto flex max-w-page flex-col items-center gap-[76px] px-6 md:px-0">
        <div className="flex w-full max-w-[501px] flex-col items-center gap-[15px] text-center">
          <h2 className="w-full font-sans text-[32px] font-light leading-normal text-[#3d3d3d]">
            The full <span className="text-[#1f40ed]">Parseable toolkit,</span>
            <br />
            one call away
          </h2>
          <p className="text-base leading-normal text-[#6d6d6d]">
            {TOOL_COUNT} tools across datasets, queries, alerts, and access
            control. Your agent gets exactly the access you do. Nothing more,
            nothing less.
          </p>
        </div>

        <div className="flex w-full flex-col items-center gap-7">
          <button type="button" onClick={() => copy(TOOLS_MARKDOWN, "tools-markdown")} className="inline-flex items-center gap-2.5 rounded-lg border border-[#d1d1d1] bg-white px-3 py-2 text-sm font-medium text-[#1b1b1b] transition-colors hover:bg-[#fafafa] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1f40ed]">
            {isMarkdownCopied ? (
              <><span>Copied</span><IconCheck size={16} stroke={2} aria-hidden="true" className="text-[#1f40ed]" /></>
            ) : <><span>Copy as Markdown</span><IconCopy size={16} stroke={1.5} aria-hidden="true" /></>}
          </button>

          <div className="grid w-full grid-cols-1 items-start gap-5 md:grid-cols-3">
            {[[TOOL_GROUPS[0], TOOL_GROUPS[1]], [TOOL_GROUPS[2], TOOL_GROUPS[5]], [TOOL_GROUPS[4], TOOL_GROUPS[3]]].map((column, index) => (
              <div key={index} className="flex min-w-0 flex-col gap-5">
                {column.map((group) => <ToolGroupCard key={group.group} group={group.group} tools={group.tools} />)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
