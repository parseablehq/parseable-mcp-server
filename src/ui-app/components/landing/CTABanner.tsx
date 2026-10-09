import { Button } from "../ui/Button";
import { Link } from "../ui/Link";

export function CTABanner() {
  return (
    <div
      className="mb-[76px] w-full shrink-0 border-y border-dashed border-[#b0b0b0] bg-[#fafafa] md:mb-0 md:border-x-0 md:border-b-0 md:border-t md:border-solid md:border-[#e7e7e7]"
    >
      <div className="flex flex-col items-center justify-center px-6 py-10 md:hidden">
        <div className="flex max-w-[364px] flex-col items-center gap-6 text-center">
          <div className="flex flex-col gap-3">
            <h2 className="section-heading text-[28px] leading-[34px]">
              See your data in <span className="text-[#1f40ed]">a new light</span>
            </h2>
            <p className="text-sm leading-[18px] text-[#6d6d6d]">
              Parseable unifies telemetry data, keeps full-fidelity data queryable. It all lives in open formats on object store with your complete control and ownership.
            </p>
          </div>
          <Link href="https://app.parseable.com" target="_blank" rel="noopener noreferrer" className="flex h-[43px] w-full items-center justify-center rounded-lg bg-[#1f40ed] text-base font-medium text-white">
            Explore more
          </Link>
        </div>
      </div>
      <div className="hidden flex-col items-center justify-center py-24 px-6 md:flex">
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
