import { IconCheck, IconCopy } from "@tabler/icons-react";
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

type PromptCategory =
  | "All"
  | "Investigate"
  | "Discover"
  | "Usage & cost"
  | "Alerts";

const PROMPTS: { category: Exclude<PromptCategory, "All">; text: string }[] = [
  {
    category: "Investigate",
    text: "Show me all ERROR logs from the auth service in the last hour",
  },
  {
    category: "Investigate",
    text: "Why is the payment service throwing 500 errors right now?",
  },
  {
    category: "Investigate",
    text: "Show me all log events for trace ID abc-123-xyz",
  },
  {
    category: "Investigate",
    text: "Which endpoints have the highest error rate today?",
  },
  {
    category: "Discover",
    text: "List all available datasets in my Parseable instance",
  },
  {
    category: "Discover",
    text: "What fields are available in the nginx-access dataset?",
  },
  {
    category: "Discover",
    text: "Show me a sample of recent logs from the web-app dataset",
  },
  { category: "Discover", text: "Which services are currently sending logs?" },
  {
    category: "Usage & cost",
    text: "How much data was ingested across all datasets in the last 7 days?",
  },
  { category: "Usage & cost", text: "Which datasets are growing the fastest?" },
  {
    category: "Usage & cost",
    text: "Show me storage usage broken down by dataset",
  },
  {
    category: "Alerts",
    text: "List all active alerts in my Parseable instance",
  },
  {
    category: "Alerts",
    text: "Show me all alerts that fired in the last 24 hours",
  },
  {
    category: "Alerts",
    text: "Which alert has triggered most frequently this week?",
  },
  {
    category: "Investigate",
    text: "Show me all slow queries above 2 seconds in the last 30 minutes",
  },
];

const PROMPT_CATEGORIES: PromptCategory[] = [
  "All",
  "Investigate",
  "Discover",
  "Usage & cost",
  "Alerts",
];

export function Prompts() {
  const [category, setCategory] = useState<PromptCategory>("All");
  const { copied, copy } = useCopy();

  const filtered =
    category === "All"
      ? PROMPTS
      : PROMPTS.filter((p) => p.category === category);

  return (
    <section className="mt-48">
      <div className="max-w-page mx-auto">
        <div className="flex flex-col items-center text-center gap-4 mb-10">
          <h2
            className="font-sans text-[3rem] font-medium leading-[112%] tracking-tight text-[rgba(0,0,0,0.76)]"
            style={{ fontFamily: '"Open Sans", sans-serif' }}
          >
            Copy, paste, and ask
          </h2>
          <p className="max-w-lg font-inter text-base text-black/60 leading-7">
            These prompts work out of the box with any MCP-compatible AI client
            connected to Parseable.
          </p>
        </div>

        {/* Category filter */}
        <div
          className="flex flex-wrap justify-center gap-2 mb-8"
          role="group"
          aria-label="Filter prompts by category"
        >
          {PROMPT_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              aria-pressed={category === cat}
              className={`px-3.5 py-1.5 rounded font-inter text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3A3A8C] ${
                category === cat
                  ? "bg-[#3A3A8C] text-white"
                  : "border border-black/[0.08] text-[#5E5F6E] hover:text-[#14151A] hover:border-black/20"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((prompt, i) => (
            <div
              key={`${prompt.category}-${i}`}
              className="group relative flex items-start justify-between gap-3 p-4 rounded-xl border border-black/[0.06] hover:border-black/[0.14] transition-colors"
              style={{ background: "#FAFAFA", height: "74px" }}
            >
              <p className="font-inter text-sm text-[#14151A] leading-5 pr-2">
                {prompt.text}
              </p>
              <button
                type="button"
                onClick={() => copy(prompt.text, `prompt-${i}-${category}`)}
                aria-label={`Copy prompt: ${prompt.text}`}
                className="shrink-0 mt-0.5 text-black/30 hover:text-[#3A3A8C] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3A3A8C] rounded"
              >
                {copied === `prompt-${i}-${category}` ? (
                  <IconCheck
                    size={15}
                    stroke={2}
                    aria-hidden="true"
                    className="text-[#059669]"
                  />
                ) : (
                  <IconCopy size={15} stroke={1.5} aria-hidden="true" />
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Slack Bot ────────────────────────────────────────────────────────────────
