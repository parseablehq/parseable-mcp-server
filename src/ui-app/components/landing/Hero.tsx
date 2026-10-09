import { CircleLockCheck01Icon, Telescope01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

export function Hero() {
  return (
    <section className="pt-[76px] pb-[76px] md:pt-[122px] md:pb-[121px]">
      <div className="mx-auto grid max-w-page gap-6 px-4 md:grid-cols-[1fr_565px] md:items-stretch md:gap-10 md:px-0">
        <div className="contents md:flex md:min-h-29 md:flex-col md:items-start md:justify-between md:gap-8">
          <h1 className="order-2 font-sans text-[40px] font-light leading-[48px] tracking-[-0.03em] text-[#1b1b1b] md:order-none md:text-[44px]">
            Parseable <span className="text-[#1f40ed]">MCP Server</span>
          </h1>
          <div className="order-1 inline-flex w-max items-center gap-2 rounded-full border border-[#e7e7e7] bg-[#fafafa] px-4 py-2 text-sm md:order-none">
            <span className="flex items-center gap-1.5"><HugeiconsIcon icon={Telescope01Icon} size={16} strokeWidth={1.5} aria-hidden="true" />Log monitoring</span>
            <span className="size-1.5 rounded-full bg-[#d9d9d9]" />
            <span className="flex items-center gap-1.5"><HugeiconsIcon icon={CircleLockCheck01Icon} size={16} strokeWidth={1.5} aria-hidden="true" />AI native</span>
          </div>
        </div>
        <div className="contents md:flex md:flex-col md:items-end md:justify-between md:gap-8">
          <p className="order-3 font-inter text-[15px] leading-6 text-[#6d6d6d] md:order-none md:text-right md:text-base">
            Connect Claude, Cursor, or any MCP-compatible agent to Parseable. Query terabytes of logs, metrics, and traces in natural language - at sub-second speed.
          </p>
          <div className="order-4 flex gap-3 md:order-none">
            <a href="https://app.parseable.com" className="rounded-lg bg-[#1f40ed] px-4 py-2 text-base font-medium text-white hover:bg-[#1834c9]">Start for free</a>
            <a href="#connect" className="rounded-lg border border-[#d1d1d1] bg-white px-3 py-2 text-sm font-medium hover:bg-[#fafafa]">View demo</a>
          </div>
        </div>
      </div>
    </section>
  );
}
