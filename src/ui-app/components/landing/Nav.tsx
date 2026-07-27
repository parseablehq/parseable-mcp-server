import {
  IconBell,
  IconArrowRight,
  IconBrandGithub,
  IconBrandSlack,
  IconCalendarEvent,
  IconChartLine,
  IconChevronDown,
  IconCode,
  IconCoin,
  IconCpu,
  IconLogs,
  IconMenu2,
  IconMessage,
  IconPlugConnected,
  IconRoute,
  IconRocket,
  IconSparkles,
  IconSum,
  IconTelescope,
  IconX,
  type TablerIcon,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { Image } from "../ui/Image";
import { Link } from "../ui/Link";

const SITE = "https://www.parseable.com";

type ProductItem = {
  label: string;
  href: string;
  description: string;
  Icon: TablerIcon;
};

const PRODUCT_SECTIONS: { title: string; items: ProductItem[] }[] = [
  {
    title: "AI Native",
    items: [
      { label: "Ask questions", href: `${SITE}/docs/user-guide/ai-native/keystone`, description: "Natural language interface", Icon: IconMessage },
      { label: "Proactive alerting", href: `${SITE}/docs/user-guide/alerting/forecasting`, description: "Time series forecasting alerts", Icon: IconSparkles },
      { label: "Summary on demand", href: `${SITE}/docs/user-guide/ai-native/summary`, description: "Real time insights", Icon: IconSum },
    ],
  },
  {
    title: "Product",
    items: [
      { label: "Logs", href: `${SITE}/solutions/log-monitoring`, description: "Centralized management at scale", Icon: IconLogs },
      { label: "Metrics", href: `${SITE}/solutions/metrics-monitoring`, description: "High cardinality made simple", Icon: IconChartLine },
      { label: "Traces", href: `${SITE}/solutions/traces`, description: "End to end distributed tracing", Icon: IconRoute },
      { label: "Alerts", href: `${SITE}/docs/user-guide/alerting`, description: "Get notified when issues arise", Icon: IconBell },
      { label: "Agent observability", href: `${SITE}/docs/user-guide/agent-observability`, description: "Observe your AI Agents", Icon: IconCpu },
      { label: "SQL Editor", href: `${SITE}/docs/user-guide/sql-editor`, description: "Query telemetry data with SQL", Icon: IconCode },
    ],
  },
  {
    title: "Platform",
    items: [
      { label: "OTel first", href: `${SITE}/docs/ingest-data/otel`, description: "OTel native ingestion and analysis", Icon: IconTelescope },
      { label: "Integration", href: `${SITE}/docs/integrations`, description: "100s of integrations supported", Icon: IconPlugConnected },
      { label: "Predictable cost", href: `${SITE}/pricing`, description: "Pay only for what you use", Icon: IconCoin },
    ],
  },
];

const baseLink =
  "inline-flex w-max items-center justify-center gap-2.5 rounded-lg px-4 py-2 font-inter text-sm font-normal leading-normal text-black/80 transition-colors hover:bg-[rgba(241,231,255,0.40)] hover:text-black hover:backdrop-blur-[4px] focus:outline-none";

function ProductMenu({ mobile = false }: { mobile?: boolean }) {
  return (
    <div
      className={
        mobile
          ? "flex flex-col gap-5 px-4 pb-5"
          : "flex w-212 flex-col gap-10 rounded-xl bg-white p-6 shadow-lg"
      }
    >
      {PRODUCT_SECTIONS.map((section) => (
        <div key={section.title} className="flex flex-col gap-4">
          <p className="text-sm font-medium leading-5 text-[#5E5F6E]">{section.title}</p>
          <div className={mobile ? "flex flex-col gap-4" : "grid grid-cols-3 gap-x-3 gap-y-6"}>
            {section.items.map(({ label, href, description, Icon }) => (
              <Link key={href} href={href} className="group flex items-start gap-3 rounded-lg">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#F1E7FF66] text-[#3A3A8C] group-hover:bg-[#3A3A8C] group-hover:text-white">
                  <Icon size={20} stroke={1.5} aria-hidden="true" />
                </span>
                <span className="flex flex-col gap-1">
                  <span className="flex items-center gap-1">
                    <span className="text-sm font-medium leading-5 text-[#14151F] group-hover:text-[#3A3A8C]">{label}</span>
                    <IconArrowRight size={16} className="-translate-x-2 text-[#3A3A8C] opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100" />
                  </span>
                  <span className="text-xs leading-5 text-[#5E5F6E] group-hover:text-black">{description}</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      ))}
      {!mobile && (
        <div className="flex w-full items-center gap-4 pt-2">
          <Link href="https://app.parseable.com/" target="_blank" rel="noopener noreferrer" className="group flex w-1/2 cursor-pointer items-center gap-3 rounded-lg bg-[#F1E7FF66] px-4 py-6 hover:bg-[#3A3A8C]">
            <span className="flex h-12 w-12 items-center justify-center rounded-md bg-white"><IconRocket size={20} stroke={1.5} className="text-[#3A3A8C]" /></span>
            <span className="flex flex-col gap-1"><span className="text-sm font-medium leading-5 text-[#2E2E70] group-hover:text-white">Start for free</span><span className="text-xs leading-5 text-[#5E5F6E] group-hover:text-white">Start your 14 days fully featured trial</span></span>
          </Link>
          <Link href="https://cal.com/parseable/enterprise" target="_blank" rel="noopener noreferrer" className="group flex w-1/2 cursor-pointer items-center gap-3 rounded-lg bg-[#F1E7FF66] px-4 py-6 hover:bg-[#3A3A8C]">
            <span className="flex h-12 w-12 items-center justify-center rounded-md bg-white"><IconCalendarEvent size={20} stroke={1.5} className="text-[#3A3A8C]" /></span>
            <span className="flex flex-col gap-1"><span className="text-sm font-medium leading-5 text-black group-hover:text-white">Book a demo</span><span className="text-xs leading-5 text-black group-hover:text-white">Talk to our team of observability experts</span></span>
          </Link>
        </div>
      )}
    </div>
  );
}

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileProductOpen, setMobileProductOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <header className={`fixed inset-x-0 top-0 z-50 h-16 transition-all duration-200 ${scrolled ? "border-b border-black/5 bg-white/40 backdrop-blur-sm" : "border-b border-transparent bg-transparent"}`} style={{ borderTop: "0.1px solid transparent" }}>
      <div className="mx-auto grid h-full w-full max-w-425 grid-cols-[1fr_auto_1fr] items-center gap-4 px-6">
        <Link href={SITE} aria-label="Parseable home" className="inline-flex justify-self-start">
          <Image src="/assets/CompleteLogo.svg" alt="Parseable" width={180} height={100} priority className="w-35 md:w-45" />
        </Link>

        <nav className="hidden items-center space-x-1 lg:flex" aria-label="Main navigation">
          <Link href={SITE} className={baseLink}>Home</Link>
          <div className="group/product relative">
            <button type="button" className={`${baseLink} flex cursor-pointer items-center gap-1`}>
              Product <IconChevronDown size={15} className="transition-transform group-hover/product:rotate-180" aria-hidden="true" />
            </button>
            <div className="invisible absolute left-1/2 top-full -translate-x-1/2 pt-1.5 opacity-0 transition-all group-hover/product:visible group-hover/product:opacity-100 group-focus-within/product:visible group-focus-within/product:opacity-100">
              <ProductMenu />
            </div>
          </div>
          <Link href={`${SITE}/pricing`} className={baseLink}>Pricing</Link>
          <Link href={`${SITE}/docs`} className={baseLink}>Docs</Link>
          <div className="group/resources relative">
            <button type="button" className={`${baseLink} flex cursor-pointer items-center gap-1`}>
              Resources <IconChevronDown size={15} className="transition-transform group-hover/resources:rotate-180" aria-hidden="true" />
            </button>
            <div className="invisible absolute left-0 top-full pt-2 opacity-0 transition-all group-hover/resources:visible group-hover/resources:opacity-100 group-focus-within/resources:visible group-focus-within/resources:opacity-100">
              <div className="w-36 rounded-xl bg-white p-2 shadow-lg ring-1 ring-black/5">
                <Link href={`${SITE}/about`} className="block rounded-lg p-2 text-sm hover:bg-[#F1E7FF66]">About us</Link>
                <Link href={`${SITE}/blog`} className="block rounded-lg p-2 text-sm hover:bg-[#F1E7FF66]">Blog</Link>
                <Link href="https://trust.parseable.com" className="block rounded-lg p-2 text-sm hover:bg-[#F1E7FF66]">Trust center</Link>
              </div>
            </div>
          </div>
        </nav>

        <div className="hidden items-center justify-self-end gap-1 lg:flex">
          <Link href="https://www.github.com/parseablehq" target="_blank" rel="noopener noreferrer" aria-label="Parseable on GitHub" className="flex h-10 w-10 items-center justify-center rounded-lg text-[#3A3A8C] hover:bg-[#3A3A8C]/8"><IconBrandGithub size={20} stroke={1.5} /></Link>
          <Link href="https://logg.ing/community" target="_blank" rel="noopener noreferrer" aria-label="Parseable Slack community" className="flex h-10 w-10 items-center justify-center rounded-lg text-[#3A3A8C] hover:bg-[#3A3A8C]/8"><IconBrandSlack size={20} stroke={1.5} /></Link>
          <span className="mx-1 h-5 w-px bg-black/10" />
          <Link href="https://app.parseable.com/" target="_blank" rel="noopener noreferrer" className="flex h-10 items-center rounded-lg bg-[#3A3A8C] px-6 text-sm font-medium text-white shadow-sm hover:bg-[#2F2F70]">Start for free</Link>
        </div>

        <button type="button" onClick={() => setMobileOpen(true)} className="flex h-10 w-10 cursor-pointer items-center justify-center justify-self-end rounded-lg text-[#3A3A8C] lg:hidden" aria-label="Open menu"><IconMenu2 size={24} /></button>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-white lg:hidden">
          <div className="flex h-14 items-center justify-between px-4">
            <Link href={SITE} aria-label="Parseable home"><Image src="/assets/CompleteLogo.svg" alt="Parseable" width={180} height={100} className="w-35" /></Link>
            <button type="button" onClick={() => setMobileOpen(false)} className="flex h-10 w-10 cursor-pointer items-center justify-center" aria-label="Close menu"><IconX size={24} /></button>
          </div>
          <nav aria-label="Mobile navigation">
            <Link href={SITE} className="block border-t border-black/10 px-4 py-4 text-sm font-medium">Home</Link>
            <button type="button" onClick={() => setMobileProductOpen((open) => !open)} className="flex w-full cursor-pointer items-center justify-between border-t border-black/10 px-4 py-4 text-sm font-medium" aria-expanded={mobileProductOpen}>
              Product <IconChevronDown size={18} className={`transition-transform ${mobileProductOpen ? "rotate-180" : ""}`} />
            </button>
            {mobileProductOpen && <ProductMenu mobile />}
            <Link href={`${SITE}/pricing`} className="block border-t border-black/10 px-4 py-4 text-sm font-medium">Pricing</Link>
            <Link href={`${SITE}/docs`} className="block border-t border-black/10 px-4 py-4 text-sm font-medium">Docs</Link>
            <Link href={`${SITE}/about`} className="block border-t border-black/10 px-4 py-4 text-sm font-medium">About us</Link>
            <Link href={`${SITE}/blog`} className="block border-y border-black/10 px-4 py-4 text-sm font-medium">Blog</Link>
          </nav>
          <div className="p-4">
            <Link href="https://app.parseable.com/" className="flex h-12 items-center justify-center rounded-lg bg-[#3A3A8C] text-sm font-medium text-white">Start for free</Link>
          </div>
        </div>
      )}
    </header>
  );
}
