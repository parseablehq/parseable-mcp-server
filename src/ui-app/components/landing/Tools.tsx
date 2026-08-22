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
    <li className="py-1">
      <button
        type="button"
        onClick={() => onCopy(name, name)}
        aria-label={`Copy ${name}`}
        className="group flex w-full cursor-pointer items-center gap-2.5 rounded-md border border-black/[0.06] px-2 py-1.5 text-left hover:border-black/[0.14] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3A3A8C]"
        style={{ background: "#FAFAFA" }}
      >
        <span className="w-4 shrink-0 font-inter text-xs text-black/30 tabular-nums">
          {index}.
        </span>
        <code
          className="flex-1 font-mono text-[12px] text-[#3A3A8C]"
          style={{ fontFamily: '"JetBrains Mono", ui-monospace, monospace' }}
        >
          {name}
        </code>
        <span className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          {isCopied ? (
            <IconCheck size={13} stroke={2} aria-hidden="true" className="text-[#059669]" />
          ) : (
            <IconCopy size={13} stroke={1.5} aria-hidden="true" className="text-black/30" />
          )}
        </span>
      </button>
    </li>
  );
}

function ToolGroupCard({ group, tools }: ToolGroup) {
  const { copied, copy } = useCopy();
  return (
    <div className="rounded-xl border border-black/[0.06] bg-white p-5 hover:border-black/10 transition-all">
      <h3
        className="font-sans text-sm font-medium text-[#14151A] mb-2"
        style={{ fontFamily: '"Open Sans", sans-serif' }}
      >
        {group}
      </h3>
      <ol className="flex flex-col">
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
    <section className="mt-40 w-full">
      <div className="max-w-page mx-auto px-4 md:px-0">
        <div className="flex flex-col items-center text-center gap-4 mb-14 max-w-2xl mx-auto">
          <h2
            className="font-sans text-[3rem] font-medium leading-[112%] tracking-tight text-[rgba(0,0,0,0.76)]"
            style={{ fontFamily: '"Open Sans", sans-serif' }}
          >
            The full Parseable toolkit,
            <br />
            one call away
          </h2>
          <p className="font-inter text-base text-black/50 leading-7">
            {TOOL_COUNT} tools across datasets, queries, alerts, and access
            control. Your agent gets exactly the access you do. Nothing more,
            nothing less.
          </p>
          <button
            type="button"
            onClick={() => copy(TOOLS_MARKDOWN, "tools-markdown")}
            className="inline-flex items-center gap-1.5 rounded-md border border-black/[0.08] px-3 py-1.5 font-inter text-xs text-[#5E5F6E] hover:text-[#14151A] hover:border-black/20 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3A3A8C]"
          >
            {isMarkdownCopied ? (
              <IconCheck size={13} stroke={2} aria-hidden="true" className="text-[#059669]" />
            ) : (
              <IconCopy size={13} stroke={1.5} aria-hidden="true" />
            )}
            {isMarkdownCopied ? "Copied" : "Copy as markdown"}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {TOOL_GROUPS.map((g) => (
            <ToolGroupCard key={g.group} group={g.group} tools={g.tools} />
          ))}
        </div>
      </div>
    </section>
  );
}
