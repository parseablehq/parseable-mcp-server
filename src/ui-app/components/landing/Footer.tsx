import { Link } from "../ui/Link";

const groups = [
  { title: "Product", links: [["Showcase", "https://www.parseable.com/showcase"], ["Integrations", "https://www.parseable.com/integrations"], ["Features", "https://www.parseable.com/docs"]] },
  { title: "Resources", links: [["Blogs", "https://www.parseable.com/blog"], ["Docs", "https://www.parseable.com/docs"], ["Cloud quickstart", "https://www.parseable.com/docs/quickstart"]] },
  { title: "Legal", links: [["Privacy policy", "/policy"], ["Terms of use", "/tos"], ["DPA", "https://www.parseable.com/dpa"]] },
  { title: "Community", links: [["GitHub", "https://github.com/parseablehq/parseable-mcp-server"], ["Slack", "https://logg.ing/community"], ["Status", "https://status.parseable.com"]] },
];

export function Footer() {
  return (
    <footer className="bg-[#252525] text-white">
      <div className="mx-auto max-w-page px-6 py-16 md:px-0">
        <div className="grid gap-12 md:grid-cols-[2fr_1fr]">
          <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
            {groups.map((group) => (
              <div key={group.title}>
                <p className="mb-4 text-sm font-medium text-[#fafafa]">{group.title}</p>
                <div className="flex flex-col gap-2">
                  {group.links.map(([label, href]) => <Link key={label} href={href} className="text-[13px] text-[#b0b0b0] hover:text-white">{label}</Link>)}
                </div>
              </div>
            ))}
          </div>
          <div className="rounded-lg border border-[#454545] bg-[#303030] p-4">
            <p className="mb-4 text-sm">Subscribe to our newsletter for updates.</p>
            <div className="flex gap-2"><input aria-label="Email address" placeholder="you@company.com" className="min-w-0 flex-1 rounded-md border border-[#454545] bg-[#252525] px-3 py-2 text-sm" /><button type="button" className="rounded-md bg-[#1f40ed] px-4 py-2 text-sm">Subscribe</button></div>
          </div>
        </div>
        <div className="mt-14 flex flex-col justify-between gap-6 border-t border-[#454545] pt-8 text-[13px] text-[#b0b0b0] md:flex-row">
          <p>© {new Date().getFullYear()} Parseable, Inc. · SFO & BLR</p>
          <p className="rounded-lg border border-[#454545] px-3 py-2 text-white"><span className="mr-2 inline-block size-2 rounded-full bg-[#34d399]" />All systems operational</p>
        </div>
      </div>
    </footer>
  );
}
