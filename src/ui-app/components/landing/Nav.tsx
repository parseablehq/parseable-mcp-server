import { useEffect, useState } from "react";
import { IconArrowUpRight, IconBrandGithub } from "@tabler/icons-react";
import { Image } from "../ui/Image";
import { Link } from "../ui/Link";

export function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        scrolled
          ? "bg-white/80 backdrop-blur-sm border-b border-black/[0.06]"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-page mx-auto h-14 flex items-center justify-between">
        <Link
          href="https://parseable.com"
          aria-label="Parseable home"
          className="inline-flex items-center gap-2"
        >
          <Image
            src="/assets/CompleteLogo.svg"
            alt="Parseable"
            width={180}
            height={100}
            priority
            className="w-35 md:w-45"
          />
        </Link>

        <nav className="flex items-center gap-1" aria-label="MCP page navigation">
          <Link
            href="https://github.com/parseablehq/parseable-mcp-server"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub repository"
            className="inline-flex items-center justify-center w-9 h-9 rounded-[6px] text-[#5E5F6E] hover:text-[#14151A] hover:bg-black/[0.04] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3A3A8C]"
          >
            <IconBrandGithub size={18} stroke={1.5} aria-hidden="true" />
          </Link>
          <Link
            href="https://www.parseable.com/docs/mcp"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 inline-flex items-center gap-1.5 px-4 h-9 rounded-[8px] bg-[#3A3A8C] font-inter text-sm font-medium text-white hover:bg-[#2F2F70] shadow-[0_1px_2px_0_rgba(20,21,26,0.05)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3A3A8C] focus-visible:ring-offset-2"
          >
            Docs <IconArrowUpRight size={14} aria-hidden="true" />
          </Link>
        </nav>
      </div>
    </header>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
