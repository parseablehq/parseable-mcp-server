import { IconBrandGithub, IconBrandLinkedin, IconBrandSlack, IconBrandX, IconBrandYoutube, IconChevronDown } from "@tabler/icons-react";
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
      <div className="mx-auto flex max-w-page flex-col gap-16 px-4 py-[52px] md:hidden">
        <div className="rounded-xl border border-[#454545] bg-[#3d3d3d] p-3">
          <p className="mb-4 text-base">Subscribe to our newsletter for updates.</p>
          <div className="flex gap-3"><input aria-label="Email address" placeholder="angelica@gmail.com" className="h-9 min-w-0 flex-1 rounded-lg border border-[#454545] bg-[#1b1b1b] px-3 text-sm" /><button type="button" className="h-9 rounded-lg bg-[#1f40ed] px-4 text-base">Subscribe</button></div>
        </div>
        <div className="flex flex-col">
          {groups.map((group) => <button key={group.title} type="button" className="flex h-[55px] items-center justify-between border-b border-[#454545] text-left text-lg"><span>{group.title}</span><IconChevronDown size={24} /></button>)}
        </div>
        <div className="space-y-6 text-sm text-[#d1d1d1]">
          <div><p className="mb-2 text-white">SFO</p><p>Parseable Inc.<br />584 Castro St. #2112 San Francisco, California 94114-2512<br />Phone: +1 (650) 444 6216</p></div>
          <div><p className="mb-2 text-white">BLR</p><p>Cloudnatively Services Pvt Ltd.<br />JBR Tech Park Whitefield, Bengaluru 560066<br />Phone: +91 9480931554</p></div>
          <p className="inline-flex rounded-lg border border-[#454545] bg-[#3d3d3d] px-3 py-2 text-white"><span className="mr-2 mt-1 inline-block size-2.5 rounded-full bg-[#34d399]" />All system operational</p>
        </div>
        <div className="border-t border-dashed border-[#5d5d5d] pt-3 text-base text-[#888]"><p>Copyright {new Date().getFullYear()} Parseable, Inc. All rights reserved.</p><p>This means that all content, designs, and innovations created by Parseable.</p></div>
        <div className="flex gap-7 text-white"><IconBrandYoutube /><IconBrandX /><IconBrandSlack /><IconBrandLinkedin /><IconBrandGithub /></div>
      </div>
      <div className="mx-auto hidden max-w-page px-6 py-16 md:block md:px-0">
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
