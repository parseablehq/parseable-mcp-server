import { Link } from "../ui/Link";

export function Footer() {
  return (
    <footer className="border-t border-black/[0.06] py-4">
      <div className="max-w-page mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="font-inter text-sm text-black/40">
          © {new Date().getFullYear()} Parseable, Inc.
        </p>
        <nav className="flex items-center gap-5" aria-label="Footer links">
          {[
            { label: "Terms", href: "/tos" },
            { label: "Privacy", href: "/policy" },
            { label: "Docs", href: "https://www.parseable.com/docs/mcp" },
            { label: "GitHub", href: "https://github.com/parseablehq/parseable-mcp-server" },
          ].map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              target={href.startsWith("http") ? "_blank" : undefined}
              rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
              className="font-inter text-sm text-black/40 hover:text-[#14151A] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3A3A8C] rounded"
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
