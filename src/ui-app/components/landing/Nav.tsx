import {
  IconBell,
  IconArrowRight,
  IconBrandGithub,
  IconBrandSlack,
  IconChartLine,
  IconChevronDown,
  IconCode,
  IconCpu,
  IconLogs,
  IconMenu2,
  IconMessage,
  IconPlugConnected,
  IconRoute,
  IconShieldCheck,
  IconSparkles,
  IconSum,
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

const CAPABILITY_COLUMNS: ProductItem[][] = [
  [
    { label: "Agent observability", description: "Deep insights into agents", href: "/docs/user-guide/agent-observability", Icon: IconCpu },
    { label: "APM", description: "Performance monitoring", href: "/docs/user-guide/apm", Icon: IconChartLine },
    { label: "Logs", description: "Log analysis", href: "/solutions/log-monitoring", Icon: IconLogs },
    { label: "Metrics", description: "Timeseries data analysis", href: "/solutions/metrics-monitoring", Icon: IconChartLine },
    { label: "Traces", description: "Distributed tracing", href: "/solutions/traces", Icon: IconRoute },
  ],
  [
    { label: "Ask questions", description: "Query in natural language", href: "/docs/user-guide/ai-native/keystone", Icon: IconMessage },
    { label: "Summary on demand", description: "Instant data summaries", href: "/docs/user-guide/ai-native/summary", Icon: IconSum },
    { label: "Anomaly detection", description: "ML anomaly detection", href: "/docs/user-guide/alerting", Icon: IconBell },
    { label: "Proactive learning", description: "Learn from patterns", href: "/docs/user-guide/alerting/forecasting", Icon: IconSparkles },
    { label: "SQL & PromQL Editor", description: "Raw query execution", href: "/docs/user-guide/sql-editor", Icon: IconCode },
  ],
];

const CONNECTORS: ProductItem[] = [
  { label: "MCP", description: "Connect any LLM", href: "https://mcp.parseable.com", Icon: IconPlugConnected },
  { label: "pb", description: "CLI for agents & humans", href: "/docs/pb-cli", Icon: IconCode },
  { label: "Grafana", description: "Connect to Grafana", href: "/docs/integrations/visualization/grafana", Icon: IconChartLine },
  { label: "AI providers", description: "Ingest from agents", href: "/docs/ingest-data/ai-agents", Icon: IconCpu },
  { label: "Kafka & Redpanda", description: "Ingest from topics", href: "/docs/ingest-data/streaming/kafka", Icon: IconRoute },
];

const RESOURCES: ProductItem[] = [
  { label: "Blog", description: "Read our latest articles", href: "/blog", Icon: IconLogs },
  { label: "About", description: "Learn more about us", href: "/about", Icon: IconMessage },
  { label: "Trust center", description: "Privacy and security practices", href: "https://trust.parseable.com/", Icon: IconShieldCheck },
];

const baseLink =
  "inline-flex w-max items-center justify-center gap-1 font-inter text-base font-medium leading-normal text-[#6d6d6d] transition-colors hover:text-[#1b1b1b] focus:outline-none focus-visible:text-[#1b1b1b]";

function productHref(href: string) {
  return href.startsWith("http") ? href : `${SITE}${href}`;
}

function ProductColumn({ title, items }: { title?: string; items: ProductItem[] }) {
  return (
    <div className="flex w-47 shrink-0 flex-col gap-4">
      {title ? <p className="text-sm font-medium text-[#1f40ed]">{title}</p> : <div className="h-[17px]" />}
      <div className="flex flex-col gap-1">
        {items.map(({ label, description, href, Icon }) => (
          <Link key={label} href={productHref(href)} className="flex w-47 items-center gap-2 overflow-hidden rounded-md p-2 hover:bg-[#fafafa]">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-[#e7e7e7] bg-white"><span className="flex size-8 items-center justify-center rounded border border-[#e7e7e7]"><Icon size={16} stroke={1.5} className="text-[#1f40ed]" /></span></span>
            <span className="min-w-0 leading-normal"><span className="block whitespace-nowrap text-sm text-[#1b1b1b]">{label}</span><span className="mt-1 block whitespace-nowrap text-xs text-[#888]">{description}</span></span>
          </Link>
        ))}
      </div>
    </div>
  );
}

function ProductMenu({ mobile = false }: { mobile?: boolean }) {
  if (mobile) return <div className="grid gap-5 px-4 pb-5 sm:grid-cols-2">{CAPABILITY_COLUMNS.map((items, index) => <ProductColumn key={index} title={index === 0 ? "Capabilities" : undefined} items={items} />)}<ProductColumn title="Connectors" items={CONNECTORS} /></div>;
  return (
    <div className="w-[1377px] max-w-[calc(100vw-48px)] -translate-x-24 translate-y-3.5 overflow-hidden rounded-b-[20px] border border-[#e7e7e7] bg-[#fafafa] p-1.5">
      <div className="overflow-hidden rounded-b-[20px] border border-[#e7e7e7] bg-white">
        <div className="flex items-start justify-between p-6">
          <section className="flex shrink-0 gap-9">{CAPABILITY_COLUMNS.map((items, index) => <ProductColumn key={index} title={index === 0 ? "Capabilities" : undefined} items={items} />)}</section>
          <div className="flex w-47 shrink-0 flex-col gap-4"><ProductColumn title="Connectors" items={CONNECTORS} /><Link href={`${SITE}/docs/integrations`} className="flex items-center gap-1 text-sm text-[#1f40ed]">View all integrations <IconArrowRight size={18} stroke={1} /></Link></div>
          <aside className="flex w-[322px] shrink-0 flex-col gap-3">
            <div className="flex h-45 flex-col justify-between rounded-xl bg-[#1f40ed] p-4 text-white"><div><p className="text-lg">Download Enterprise Trial</p><p className="mt-2 text-[13px] opacity-80">Download the latest Enterprise edition of Parseable for a full-featured trial.</p></div><Link href={`${SITE}/download`} className="w-fit rounded-lg bg-[#fafafa] px-3 py-2 text-sm font-medium text-black">Download</Link></div>
            <Link href="https://www.youtube.com/live/Tc3T-Gj4QK8?si=gpesCwcHzQNcFQ7A" target="_blank" rel="noreferrer" className="group relative h-[157px] overflow-hidden rounded-xl border border-[#e7e7e7] bg-[#1b1b1b]"><img src={`${SITE}/images/product-menu/parseable-demo-thumbnail.jpg`} alt="Latest in Parseable" className="size-full object-cover transition-transform group-hover:scale-[1.03]" /><span className="absolute inset-0 bg-linear-to-t from-black/65 to-transparent" /><span className="absolute inset-x-4 bottom-3 text-center text-sm font-medium text-white">Latest in Parseable</span></Link>
          </aside>
        </div>
      </div>
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
    <header className={`site-header h-[60px] border-b border-[#e7e7e7] bg-white transition-shadow md:h-[72px] ${scrolled ? "shadow-sm" : ""}`}>
      <div className="mx-auto flex h-full w-full max-w-[1377px] items-center justify-between px-4 md:px-6 lg:px-0">
        <div className="flex items-center gap-16">
        <Link href={SITE} aria-label="Parseable home" className="block size-6 overflow-hidden md:size-8">
          <Image src="/assets/CompleteLogo.svg" alt="" width={206} height={32} priority className="h-6 w-[155px] max-w-none md:h-8 md:w-[206px]" />
        </Link>

        <nav className="relative hidden items-center gap-6 lg:flex" aria-label="Main navigation">
          <Link href={SITE} className={`${baseLink} text-[#1b1b1b]`}>Home</Link>
          <div className="group/product">
            <button type="button" className={`${baseLink} flex cursor-pointer items-center gap-1`}>
              Product <IconChevronDown size={15} className="transition-transform group-hover/product:rotate-180" aria-hidden="true" />
            </button>
            <div className="invisible absolute left-0 top-full pt-1.5 opacity-0 transition-all group-hover/product:visible group-hover/product:opacity-100 group-focus-within/product:visible group-focus-within/product:opacity-100">
              <ProductMenu />
            </div>
          </div>
          <div className="group/resources">
            <button type="button" className={`${baseLink} flex cursor-pointer items-center gap-1`}>
              Resources <IconChevronDown size={15} className="transition-transform group-hover/resources:rotate-180" aria-hidden="true" />
            </button>
            <div className="invisible absolute left-0 top-full pt-2 opacity-0 transition-all group-hover/resources:visible group-hover/resources:opacity-100 group-focus-within/resources:visible group-focus-within/resources:opacity-100">
              <div className="translate-x-15 translate-y-3.5 overflow-hidden rounded-b-[20px] border border-[#e7e7e7] bg-[#fafafa] p-1.5">
                <div className="overflow-hidden rounded-b-[20px] border border-[#e7e7e7] bg-white p-2">
                  {RESOURCES.map(({ label, description, href, Icon }) => (
                    <Link key={label} href={productHref(href)} target={href.startsWith("http") ? "_blank" : undefined} rel={href.startsWith("http") ? "noreferrer" : undefined} className="flex items-center gap-2 rounded-md p-2 hover:bg-[#fafafa]">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-[#e7e7e7] bg-white"><span className="flex size-8 items-center justify-center rounded border border-[#e7e7e7]"><Icon size={16} stroke={1.5} className="text-[#1f40ed]" /></span></span>
                      <span className="min-w-0 flex-1 leading-normal"><span className="block text-sm text-[#1b1b1b]">{label}</span><span className="mt-1 block whitespace-nowrap text-xs text-[#888]">{description}</span></span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <Link href={`${SITE}/docs`} className={baseLink}>Docs</Link>
          <Link href={`${SITE}/about`} className={baseLink}>About</Link>
          <Link href={`${SITE}/pricing`} className={baseLink}>Pricing</Link>
        </nav>
        </div>

        <div className="hidden items-center gap-2 lg:flex">
          <Link href="https://www.github.com/parseablehq" target="_blank" rel="noopener noreferrer" aria-label="Parseable on GitHub" className="flex size-9 items-center justify-center rounded-md text-[#1b1b1b] hover:bg-[#fafafa] hover:text-[#1f40ed]"><IconBrandGithub size={24} stroke={1} /></Link>
          <Link href="https://logg.ing/community" target="_blank" rel="noopener noreferrer" aria-label="Parseable Slack community" className="flex size-9 items-center justify-center rounded-md text-[#1b1b1b] hover:bg-[#fafafa] hover:text-[#1f40ed]"><IconBrandSlack size={24} stroke={1} /></Link>
          <Link href="https://app.parseable.com/" target="_blank" rel="noopener noreferrer" className="ml-1 flex h-9 items-center rounded-lg bg-[#3d3d3d] px-3 text-sm font-medium text-white hover:bg-[#1b1b1b]">Start for free</Link>
        </div>

        <button type="button" onClick={() => setMobileOpen(true)} className="flex size-6 cursor-pointer items-center justify-center justify-self-end text-[#1b1b1b] lg:hidden" aria-label="Open menu"><IconMenu2 size={24} /></button>
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
