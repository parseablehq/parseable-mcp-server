import { Button } from "../ui/Button";
import { Link } from "../ui/Link";

export function CTABanner() {
  return (
    <div
      className="section-rule w-full shrink-0 bg-[#fafafa]"
    >
      <div className="flex flex-col items-center justify-center py-24 px-6">
        <div className="flex flex-col items-center gap-6 text-center max-w-3xl">
          <h2 className="section-heading text-[40px] leading-[48px] tracking-[-0.03em]">
            Your Observability data <span className="text-[#1f40ed]">deserves better than a dashboard</span>
          </h2>
          <p className="font-inter text-base font-normal text-black/60 leading-7 max-w-xl">
            Connect Parseable to Claude, Cursor, or any MCP-compatible agent and investigate incidents across logs, metrics, traces, and alerts - in natural language, without switching context.
          </p>
          <div className="flex gap-3 mt-2 flex-wrap justify-center">
            <Link
              href="https://app.parseable.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button className="flex px-6 h-11 justify-center items-center gap-1 rounded-[8px] bg-[#3A3A8C] shadow-[0_1px_2px_0_rgba(20,21,26,0.05)] font-inter text-base font-medium text-white hover:bg-[#2F2F70]">
                Explore Parseable
              </Button>
            </Link>
            <Link
              href="https://www.parseable.com/docs/mcp"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                variant="secondary"
                className="flex px-6 h-11 justify-center items-center gap-1 rounded-[8px] border border-[#DEE0E3] bg-white shadow-[0_1px_2px_0_rgba(20,21,26,0.05)] font-inter text-base font-medium text-[#14151A] hover:bg-gray-50"
              >
                Read the docs
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
