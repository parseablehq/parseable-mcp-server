import { useState } from "react";

// Real logo SVG from Prism repo
function ParseableLogo() {
  return (
    <svg
      width="160"
      height="25"
      viewBox="0 0 180 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M32.3247 5.29923H36.5859V7.31373C37.9631 5.66919 39.9425 4.96439 41.9542 4.96439C46.5854 4.96439 49.5396 8.85831 49.5396 13.6569C49.5396 18.4555 46.5179 22.4169 41.8867 22.4169C39.9397 22.4169 38.0279 21.6446 36.8181 20.1675V26.9131H32.322V5.29923H32.3247ZM44.9436 13.6893C44.9436 11.0376 43.2315 9.12567 40.7823 9.12567C38.5005 9.12567 36.7884 11.0051 36.7884 13.6893C36.7884 16.3735 38.4654 18.253 40.7823 18.253C43.2315 18.253 44.9436 16.3411 44.9436 13.6893Z"
        fill="#061432"
      />
      <path
        d="M51.2253 13.6915C51.2253 8.85784 54.1795 4.96658 58.8107 4.96658C60.7577 4.96658 62.837 5.73889 64.0468 7.34834V5.30143H68.443V22.0816H64.0468V20.0671C62.8721 21.6793 60.7577 22.4165 58.8107 22.4165C54.1795 22.4165 51.2253 18.5225 51.2253 13.6915ZM63.9442 13.6915C63.9442 11.0721 62.2672 9.12784 59.9503 9.12784C57.6334 9.12784 55.789 11.0748 55.789 13.6915C55.789 16.3082 57.5334 18.2551 59.9503 18.2551C62.3671 18.2551 63.9442 16.3757 63.9442 13.6915Z"
        fill="#061432"
      />
      <path
        d="M71.8657 5.30143H76.2941V8.52298C76.7638 7.14849 78.476 4.96658 82.1676 4.96658V9.86779C78.2735 9.86779 76.3616 11.6473 76.3616 15.6412V22.0843H71.8657V5.30143Z"
        fill="#061432"
      />
      <path
        d="M83.3035 20.1324L84.9159 16.6759C86.0578 17.5481 87.635 18.4554 90.1515 18.4554C91.1915 18.4554 92.9037 18.0531 92.9037 17.0459C92.9037 16.0386 91.4616 15.8037 90.0165 15.4014C86.6948 14.5291 83.9757 13.4219 83.9757 10.2004C83.9757 6.77634 87.3326 4.96439 90.4862 4.96439C93.2384 4.96439 94.9829 5.63678 96.7295 6.64132L95.2199 9.99791C93.5759 9.19318 92.0311 8.82322 90.5567 8.82322C89.5174 8.82322 88.5421 9.29307 88.5421 9.99791C88.5421 10.9376 89.9519 11.24 91.4968 11.5749C94.348 12.2473 97.4701 13.4868 97.4701 16.9109C97.4701 21.0397 93.2736 22.4142 90.1545 22.4142C86.5627 22.4142 84.2487 21.0047 83.3086 20.1324H83.3035Z"
        fill="#061432"
      />
      <path
        d="M99.1387 13.6893C99.1387 8.85564 102.898 4.96439 107.831 4.96439C112.395 4.96439 115.986 8.85836 115.986 13.6218C115.986 14.4265 115.886 15.2339 115.886 15.2339H103.705C104.242 17.5482 106.155 18.658 108.371 18.658C109.981 18.658 111.661 18.1881 112.902 17.3483L114.579 20.5699C112.701 21.812 110.519 22.4143 108.339 22.4143C103.438 22.4143 99.1445 19.2251 99.1445 13.6893H99.1387ZM111.757 12.2473C111.423 10.1329 109.744 8.72332 107.696 8.72332C105.649 8.72332 104.073 10.1329 103.635 12.2473H111.757Z"
        fill="#061432"
      />
      <path
        d="M117.62 13.6893C117.62 8.85566 120.574 4.96439 125.205 4.96439C127.152 4.96439 129.232 5.7367 130.441 7.34609V5.29923H134.837V22.0794H130.441V20.0649C129.266 21.677 127.152 22.4142 125.205 22.4142C120.574 22.4142 117.62 18.5203 117.62 13.6893ZM130.338 13.6893C130.338 11.0699 128.661 9.12567 126.345 9.12567C124.028 9.12567 122.183 11.0726 122.183 13.6893C122.183 16.306 123.928 18.253 126.345 18.253C128.761 18.253 130.338 16.3735 130.338 13.6893Z"
        fill="#061432"
      />
      <path
        d="M142.24 20.0665V22.081H137.979V0H142.475V7.18301C143.685 5.74101 145.597 4.9687 147.544 4.9687C152.175 4.9687 155.194 8.86262 155.194 13.6936C155.194 18.5246 152.24 22.4185 147.609 22.4185C145.594 22.4185 143.48 21.6813 142.24 20.0692V20.0665ZM150.63 13.6909C150.63 11.0715 148.886 9.12727 146.469 9.12727C144.052 9.12727 142.475 11.0742 142.475 13.6909C142.475 16.3076 144.187 18.2546 146.469 18.2546C148.886 18.2546 150.63 16.3427 150.63 13.6909Z"
        fill="#061432"
      />
      <path d="M156.944 0H161.44V22.081H156.944V0Z" fill="#061432" />
      <path
        d="M163.152 13.523C163.152 8.68928 166.911 4.79807 171.844 4.79807C176.409 4.79807 180 8.69199 180 13.4555C180 14.2602 179.9 15.0676 179.9 15.0676H167.718C168.256 17.3818 170.168 18.4917 172.382 18.4917C173.994 18.4917 175.671 18.0218 176.914 17.182L178.591 20.4036C176.711 21.6457 174.529 22.2479 172.347 22.2479C167.445 22.2479 163.152 19.0588 163.152 13.523ZM175.771 12.0809C175.436 9.96657 173.756 8.55703 171.709 8.55703C169.663 8.55703 168.085 9.96657 167.648 12.0809H175.771Z"
        fill="#061432"
      />
      <path
        d="M20.0748 9.31942C20.9493 8.44362 22.3681 8.44254 23.2439 9.317C24.1197 10.1915 24.1208 11.6103 23.2463 12.4861L9.78785 25.9652C8.91339 26.841 7.49453 26.8421 6.61873 25.9676C5.74293 25.0931 5.74185 23.6743 6.61631 22.7985L20.0748 9.31942Z"
        fill="#061432"
      />
      <path
        d="M12.275 3.93749C12.7606 3.45037 12.3836 2.60951 11.7028 2.66114C8.79618 2.87775 5.94719 4.10327 3.71474 6.34293C1.4823 8.58259 0.24617 11.4554 0.00618704 14.3956C-0.0509127 15.0869 0.776363 15.476 1.26193 14.9861L12.275 3.93749Z"
        fill="#061432"
      />
      <path
        d="M23.6618 15.4098C24.1482 14.9235 24.9896 15.2992 24.9391 15.9801C24.7269 18.887 23.5057 21.7378 21.2695 23.9737C19.0332 26.2096 16.1623 27.4501 13.2225 27.6946C12.5313 27.7527 12.1409 26.926 12.63 26.4397L23.6618 15.4098Z"
        fill="#061432"
      />
      <path
        d="M8.81696 17.0681L18.3595 7.4905C19.4296 6.39999 19.0862 4.58805 17.6878 3.95667L17.6489 3.94081C16.7954 3.55617 15.7898 3.74282 15.1363 4.4115L5.60472 13.978C4.74152 14.8577 4.76143 16.261 5.64923 17.1158C6.53704 17.9705 7.9538 17.9504 8.817 17.0708L8.81696 17.0681Z"
        fill="#061432"
      />
      <path
        d="M5.39983 19.5808C5.39983 20.7623 4.41937 21.72 3.20992 21.72C2.00047 21.72 1.02002 20.7623 1.02002 19.5808C1.02002 18.3994 2.00047 17.4417 3.20992 17.4417C4.41937 17.4417 5.39983 18.3994 5.39983 19.5808Z"
        fill="#061432"
      />
    </svg>
  );
}

type Tab = "claude-desktop" | "claude-code" | "cursor" | "vscode";

const MCP_URL = `${window.location.origin}/mcp`;

const tabs: { id: Tab; label: string }[] = [
  { id: "claude-desktop", label: "Claude Desktop" },
  { id: "claude-code", label: "Claude Code" },
  { id: "cursor", label: "Cursor" },
  { id: "vscode", label: "VS Code" },
];

const configs: Record<
  Tab,
  { instructions?: string[]; json?: string; cli?: string }
> = {
  "claude-desktop": {
    instructions: [
      "Open Claude Desktop → Settings → Connectors",
      'Click "Add custom connector"',
      "Name: Parseable",
      `Remote MCP server URL: ${MCP_URL}`,
      'Click "Add", then "Connect" and complete the OAuth flow',
    ],
  },
  "claude-code": {
    cli: `claude mcp add --transport http parseable ${MCP_URL} --scope user`,
  },
  cursor: {
    json: JSON.stringify(
      { mcpServers: { parseable: { type: "http", url: MCP_URL } } },
      null,
      2,
    ),
  },
  vscode: {
    json: JSON.stringify(
      { servers: { parseable: { type: "http", url: MCP_URL } } },
      null,
      2,
    ),
  },
};

const tools = [
  "Query logs with SQL",
  "List & explore datasets",
  "Get schema & stats",
  "Manage alerts & targets",
  "Manage roles & users",
  "Cluster metrics & status",
  "Sample events",
  "PromQL queries",
];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="text-xs px-2 py-1 rounded bg-[#E8EBFF] text-parseableBlue-500 hover:bg-[#d8dcf5] transition-colors font-medium cursor-pointer border-none"
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

export function LandingPage() {
  const [tab, setTab] = useState<Tab>("claude-desktop");
  const cfg = configs[tab];

  return (
    <div className="min-h-screen bg-[#F3F4F6] font-[Inter,sans-serif]">
      {/* Nav */}
      <nav className="bg-white border-b border-[#E5E7EB] px-6 py-4 flex items-center justify-between">
        <a
          href="https://www.parseable.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          <ParseableLogo />
        </a>
        <div className="flex items-center gap-4">
          <a
            href="https://www.parseable.com/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-coolGray-400 hover:text-parseableBlue-500 no-underline"
          >
            Docs
          </a>
          <a
            href="https://github.com/parseablehq/parseable-mcp-server"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-coolGray-400 hover:text-parseableBlue-500 no-underline flex items-center gap-1.5"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
            </svg>
            GitHub
          </a>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-16 flex flex-col gap-16">
        {/* Hero */}
        <section className="text-center flex flex-col items-center gap-6">
          <ParseableLogo />
          <div className="flex flex-col gap-3">
            <h1 className="text-4xl font-bold text-coolGray-100 leading-tight">
              Parseable MCP Server
            </h1>
            <p className="text-lg text-coolGray-400 max-w-xl mx-auto leading-relaxed">
              Connect your AI tools to Parseable — query logs, explore datasets,
              manage alerts, and more using natural language.
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap justify-center">
            <a
              href="/login"
              className="inline-flex items-center gap-2 h-10 px-5 rounded-md bg-parseableBlue-500 text-white text-sm font-semibold hover:bg-parseableBlue-400 no-underline transition-colors"
            >
              Connect with OAuth
            </a>
            <a
              href="https://www.parseable.com/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 h-10 px-5 rounded-md border border-[#E5E7EB] bg-white text-coolGray-200 text-sm font-semibold hover:bg-[#F9FAFB] no-underline transition-colors"
            >
              Documentation
            </a>
          </div>
        </section>

        {/* MCP endpoint */}
        <section className="bg-white rounded-2xl border border-[#E5E7EB] p-6 flex flex-col gap-2">
          <p className="text-xs font-semibold text-coolGray-500 uppercase tracking-wide">
            MCP Endpoint
          </p>
          <div className="flex items-center justify-between gap-3 bg-[#F9FAFB] rounded-lg px-4 py-3">
            <code className="text-sm text-parseableBlue-500 font-mono">
              {MCP_URL}
            </code>
            <CopyButton text={MCP_URL} />
          </div>
          <p className="text-xs text-coolGray-500">
            HTTP transport · OAuth 2.0 · PKCE
          </p>
        </section>

        {/* Tools */}
        <section className="flex flex-col gap-5">
          <h2 className="text-xl font-semibold text-coolGray-100">
            What you can do
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {tools.map((t) => (
              <div
                key={t}
                className="flex items-center gap-3 bg-white rounded-xl border border-[#E5E7EB] px-4 py-3"
              >
                <div className="w-2 h-2 rounded-full bg-parseableBlue-500 shrink-0" />
                <span className="text-sm text-coolGray-200">{t}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Setup */}
        <section className="flex flex-col gap-5">
          <h2 className="text-xl font-semibold text-coolGray-100">
            Quick Setup
          </h2>
          <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
            {/* Tab bar */}
            <div className="flex border-b border-[#E5E7EB] overflow-x-auto">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`px-5 py-3 text-sm font-medium whitespace-nowrap cursor-pointer border-none transition-colors ${
                    tab === t.id
                      ? "text-parseableBlue-500 border-b-2 border-parseableBlue-500 bg-white"
                      : "text-coolGray-500 hover:text-coolGray-200 bg-transparent"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="p-6 flex flex-col gap-4">
              {cfg.instructions && (
                <ol className="flex flex-col gap-2">
                  {cfg.instructions.map((step, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-[#E8EBFF] text-parseableBlue-500 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span className="text-sm text-coolGray-200">{step}</span>
                    </li>
                  ))}
                </ol>
              )}
              {cfg.cli && (
                <div className="flex flex-col gap-2">
                  <p className="text-xs font-medium text-coolGray-500">
                    Run in terminal
                  </p>
                  <div className="flex items-center justify-between gap-3 bg-coolGray-100 rounded-lg px-4 py-3">
                    <code className="text-sm text-coolGray-900 font-mono break-all">
                      {cfg.cli}
                    </code>
                    <CopyButton text={cfg.cli} />
                  </div>
                </div>
              )}
              {cfg.json && (
                <div className="flex flex-col gap-2">
                  <p className="text-xs font-medium text-coolGray-500">
                    Add to MCP config
                  </p>
                  <div className="relative bg-coolGray-100 rounded-lg px-4 py-3">
                    <div className="absolute top-3 right-3">
                      <CopyButton text={cfg.json} />
                    </div>
                    <pre className="text-sm text-coolGray-900 font-mono overflow-x-auto pr-12">
                      {cfg.json}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center flex flex-col gap-2 pb-4">
          <div className="flex items-center justify-center gap-4 text-sm text-coolGray-500">
            <a
              href="https://www.parseable.com/csa"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-parseableBlue-500 no-underline"
            >
              Terms
            </a>
            <span>·</span>
            <a
              href="https://www.parseable.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-parseableBlue-500 no-underline"
            >
              Privacy
            </a>
            <span>·</span>
            <a
              href="https://www.parseable.com/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-parseableBlue-500 no-underline"
            >
              Docs
            </a>
          </div>
          <p className="text-xs text-coolGray-600">
            © {new Date().getFullYear()} Parseable Inc.
          </p>
        </footer>
      </main>
    </div>
  );
}
