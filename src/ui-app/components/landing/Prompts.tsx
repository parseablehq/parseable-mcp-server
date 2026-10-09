import { IconCheck, IconCopy } from "@tabler/icons-react";
import { useCallback, useState } from "react";

type CopyKey = string;

function useCopy() {
  const [copied, setCopied] = useState<CopyKey | null>(null);
  const copy = useCallback((text: string, key: CopyKey) => {
    navigator.clipboard.writeText(text).catch(() => { });
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
  const [category, setCategory] = useState<PromptCategory>("Discover");
  const { copied, copy } = useCopy();

  const featured = [PROMPTS[0], PROMPTS[1], PROMPTS[2], PROMPTS[14], PROMPTS[3], PROMPTS[3], PROMPTS[0], PROMPTS[1]];
  const filtered = category === "Discover" ? featured : category === "All" ? PROMPTS : PROMPTS.filter((p) => p.category === category);

  return (
    <section className="section-rule py-[76px] md:py-32">
      <div className="mx-auto flex max-w-page flex-col items-center gap-19 px-4 md:px-0">
        <div className="flex w-full max-w-125.25 flex-col items-center gap-3.75 text-center">
          <h2 className="w-full font-sans text-[28px] font-light leading-9 text-[#3d3d3d] md:text-[32px] md:leading-normal">
            Copy, paste, and ask
          </h2>
          <p className="text-[15px] leading-normal text-[#6d6d6d] md:text-base">
            These prompts work out of the box with any MCP-compatible AI client
            connected to Parseable.
          </p>
        </div>

        <div className="flex w-full flex-col items-center gap-7">
          <div className="mobile-tab-scroller flex w-full items-center justify-start gap-2 overflow-x-auto px-1 py-1 md:w-auto md:flex-wrap md:justify-center md:overflow-visible md:px-0" role="group" aria-label="Filter prompts by category">
            {PROMPT_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                aria-pressed={category === cat}
                className={`flex h-9.25 shrink-0 cursor-pointer items-center justify-center whitespace-nowrap px-2.5 py-2 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1f40ed] md:px-4 md:text-sm ${category === cat ? "rounded-lg border border-[#3d3d3d] bg-[#3d3d3d] text-[#fafafa] shadow-[0_0_0_2px_white,0_0_0_3px_#3d3d3d]" : "rounded-md border border-[#e7e7e7] bg-[#fafafa] text-[#3d3d3d] hover:border-[#b0b0b0]"}`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid w-full grid-cols-1 gap-4 px-0 sm:grid-cols-2 md:px-0 lg:grid-cols-3">
            {filtered.map((prompt, i) => (
              <div key={`${prompt.text}-${i}-${category}`} className="flex min-h-16.5 items-start gap-2.5 rounded-xl border border-[#e7e7e7] bg-[#fafafa] p-3">
                <p className="min-w-0 flex-1 text-sm leading-normal text-[#24292e]">{prompt.text}{prompt.text.endsWith("?") || prompt.text.endsWith(".") ? "" : "."}</p>
                <button type="button" onClick={() => copy(prompt.text, `prompt-${i}-${category}`)} aria-label={`Copy prompt: ${prompt.text}`} className="flex size-4 shrink-0 items-center justify-center rounded text-[#24292e] transition-colors hover:text-[#1f40ed] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1f40ed]">
                  {copied === `prompt-${i}-${category}` ? <IconCheck size={16} stroke={2} className="text-[#1f40ed]" aria-hidden="true" /> : <IconCopy size={16} stroke={1.5} aria-hidden="true" />}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Slack Bot ────────────────────────────────────────────────────────────────
