import { IconCheck, IconChevronRight, IconCopy } from "@tabler/icons-react";
import { useCallback, useState } from "react";

type Connection = "hosted" | "local";

const LOCAL_COMMAND = "npx -y @parseable/parseable-mcp-server@latest init";
const HOSTED_URL = `${window.location.origin}/mcp`;

const CONTENT = {
  local: {
    title: "Local MCP",
    eyebrow: "Open Source",
    description: "Run the Parseable MCP server on your own machine. Full control over credentials and config.",
    benefits: [
      "Open source under Apache 2.0",
      "Runs entirely inside your environment",
      "Works with self-hosted Parseable instances",
      "Full control over credentials and config",
    ],
    links: [
      ["Local MCP setup guide", "https://www.parseable.com/docs/mcp"],
      ["View on GitHub", "https://github.com/parseablehq/parseable-mcp-server"],
    ],
    steps: [
      ["1. Install and configure", LOCAL_COMMAND, true],
      ["2. Restart your MCP client", "Parseable tools appear after restart", false],
    ],
  },
  hosted: {
    title: "Remote MCP",
    eyebrow: "Streamable HTTP",
    description: "Connect to a deployed MCP endpoint over HTTP. No local MCP server installation required.",
    benefits: [
      "Direct Parseable API key authentication",
      "No MCP server installation on the client",
      "Works with Parseable Cloud and self-hosted instances",
      "Credentials remain in your MCP client configuration",
    ],
    links: [["Remote MCP setup guide", "https://www.parseable.com/docs/mcp"]],
    steps: [
      ["1. Use the hosted endpoint", HOSTED_URL, true],
      ["2. Add your credentials", "X-API-Key: your-parseable-api-key", true],
    ],
  },
} as const;

export function TwoWays() {
  const [active, setActive] = useState<Connection>("local");
  const [copied, setCopied] = useState<string | null>(null);
  const content = CONTENT[active];

  const copy = useCallback((value: string) => {
    navigator.clipboard.writeText(value).catch(() => {});
    setCopied(value);
    setTimeout(() => setCopied(null), 2000);
  }, []);

  return (
    <section id="connect" className="section-rule py-32">
      <div className="mx-auto flex max-w-page flex-col items-center gap-[76px] px-6 md:px-0">
        <div className="flex w-full max-w-[501px] flex-col items-center gap-[15px] text-center">
          <h2 className="w-full font-sans text-[32px] font-light leading-normal text-[#3d3d3d]">
            Two ways to <span className="text-[#1f40ed]">connect</span>
          </h2>
          <p className="text-base leading-normal text-[#6d6d6d]">
            Connect to a deployed MCP server over HTTP, or run the open-source server locally over stdio.
          </p>
        </div>

        <div className="flex w-full flex-col items-center gap-7">
          <div className="flex h-[39px] w-[337px] items-center gap-[5px] rounded-lg border border-[#e7e7e7] bg-[#e7e7e7] p-0.5">
            {(["hosted", "local"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setActive(option)}
                aria-pressed={active === option}
                className={`flex h-full flex-1 items-center justify-center rounded-md px-4 py-2 text-sm transition-colors ${active === option ? "bg-white text-[#3d3d3d]" : "text-[#5d5d5d] hover:text-[#3d3d3d]"}`}
              >
                {option === "hosted" ? "Remote MCP" : "Local MCP"}
              </button>
            ))}
          </div>

          <div className="w-full overflow-hidden border border-[#e7e7e7] bg-white p-5">
            <div className="flex w-full items-stretch gap-3.5 max-md:flex-col">
              <div className="flex min-w-0 flex-1 flex-col items-start gap-4">
                <div className="flex flex-col items-start gap-2">
                  <h3 className="font-sans text-[32px] font-normal leading-normal text-[#1b1b1b]">{content.title}</h3>
                  <p className="text-base text-[#1b1b1b]">{content.eyebrow}</p>
                </div>

                <div className="flex h-[77px] w-full max-w-[626px] items-start border-b border-dashed border-[#b0b0b0] py-2.5">
                  <p className="text-base font-medium leading-normal text-[#3d3d3d]">{content.description}</p>
                </div>

                <div className="flex w-full max-w-[626px] flex-col items-start gap-3 text-sm">
                  <p className="text-black">Benefits :</p>
                  <ul className="flex w-full flex-col gap-3">
                    {content.benefits.map((benefit) => (
                      <li key={benefit} className="flex items-center gap-1.5 text-[#3d3d3d]">
                        <IconCheck size={20} stroke={1.5} className="shrink-0 text-[#1f40ed]" aria-hidden="true" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex flex-wrap items-center gap-6">
                  {content.links.map(([label, href]) => (
                    <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-base font-medium leading-[1.53] text-[#1f40ed] hover:text-[#1834c9]">
                      {label}<IconChevronRight size={22} stroke={1.5} />
                    </a>
                  ))}
                </div>
              </div>

              <div className="w-full shrink-0 md:w-[487px]">
                <div className="flex w-full flex-col items-start gap-6 rounded-xl border border-[#e7e7e7] bg-[#fafafa] p-4">
                  {content.steps.map(([label, value, canCopy]) => (
                    <div key={label} className="flex w-full flex-col items-start gap-2">
                      <p className="text-base text-[#00020f]">{label}</p>
                      <div className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-[#e7e7e7] bg-white p-3">
                        <code className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap font-mono text-xs leading-[1.5] text-[#24292e]">{value}</code>
                        {canCopy && (
                          <button type="button" onClick={() => copy(value)} aria-label={`Copy ${label}`} className="flex size-4 shrink-0 items-center justify-center text-[#24292e] hover:text-[#1f40ed]">
                            {copied === value ? <IconCheck size={16} /> : <IconCopy size={16} stroke={1.5} />}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
