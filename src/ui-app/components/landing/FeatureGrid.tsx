import {
  Alert01Icon,
  BoltIcon,
  ChatSearch01Icon,
  EyeIcon,
  Search01Icon,
  ShieldCheckIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

const FEATURES = [
  {
    icon: ChatSearch01Icon,
    mobileOrder: "order-1",
    title: "Natural language querying",
    description: "Ask questions in plain English. The server translates them to SQL and runs against your Parseable datasets.",
  },
  {
    icon: Search01Icon,
    mobileOrder: "order-2",
    title: "Sub-second search",
    description: "Full-fidelity queries across millions of log events, powered by Parseable's columnar storage engine.",
  },
  {
    icon: BoltIcon,
    mobileOrder: "order-6",
    title: "Full tool surface",
    description: "Your Parseable instance publishes its live OSS, Enterprise, or Cloud tool catalog.",
  },
  {
    icon: ShieldCheckIcon,
    mobileOrder: "order-3",
    title: "Direct API key authentication",
    description: "Connects to your Parseable instance using its URL and API key headers. No OAuth flow or separate account required.",
  },
  {
    icon: EyeIcon,
    mobileOrder: "order-4",
    title: "Dashboard-free investigation",
    description: "Debug production incidents, find anomalies, and correlate signals without switching context.",
  },
  {
    icon: Alert01Icon,
    mobileOrder: "order-5",
    title: "Safety rails built in",
    description: "Parseable validates tool input and enforces RBAC at execution time.",
  },
];

export function FeatureGrid() {
  return (
    <section className="section-rule flex w-full flex-col items-center gap-8 py-[76px] md:gap-[76px] md:py-32">
      <div className="flex w-full max-w-[501px] flex-col items-center px-6 text-center">
        <h2 className="w-full max-w-[391px] font-sans text-[28px] font-light leading-9 text-[#3d3d3d] md:text-[32px] md:leading-normal">
          Everything that you need to <span className="text-[#1f40ed]">investigate</span>
        </h2>
      </div>

      <div className="grid w-[calc(100%_-_32px)] grid-cols-1 border-l border-t border-[#e7e7e7] sm:grid-cols-2 md:w-full lg:grid-cols-3">
        {FEATURES.map(({ icon, title, description, mobileOrder }) => (
          <article key={title} className={`${mobileOrder} flex min-w-0 flex-col items-start gap-5 overflow-hidden border-b border-r border-[#e7e7e7] bg-[#fafafa] px-5 py-5 sm:order-none md:px-8 md:py-11`}>
            <div className="flex items-center gap-2">
              <HugeiconsIcon icon={icon} size={24} strokeWidth={1.5} className="shrink-0 text-[#1f40ed]" aria-hidden="true" />
              <h3 className="text-base font-semibold leading-6 text-[#1f40ed]">{title}</h3>
            </div>
            <p className="text-base leading-6 text-[#3d3d3d]">{description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
