const DOT_PATTERN = `url("data:image/svg+xml,%3Csvg%20width%3D%2728%27%20height%3D%2728%27%20viewBox%3D%270%200%2028%2028%27%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%3E%3Cg%20stroke%3D%27%233B4AA4%27%20stroke-opacity%3D%270.10%27%20stroke-width%3D%271%27%20stroke-linecap%3D%27round%27%3E%3Cpath%20d%3D%27M14%2011.5v5%27%2F%3E%3Cpath%20d%3D%27M11.5%2014h5%27%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E")`;

const features = [
  {
    color: "#15a0a2",
    text: "Petascale ingestion",
    d: "M13 2 3 14h7v8l11-12h-8z",
  },
  {
    color: "#7C3AED",
    text: "Natural language interface",
    d: "M12 2a10 10 0 1 0 10 10M12 6v6l4 2",
  },
  {
    color: "#22C55E",
    text: "Native OpenTelemetry support",
    d: "M11 11 2 2m9 9 9-9M11 11v10M11 11H1",
  },
  {
    color: "#F59E0B",
    text: "Blazing fast query engine",
    d: "M13 2 3 14h7v8l11-12h-8z",
  },
  {
    color: "#6E6EBA",
    text: "Up to 90% compression",
    d: "M12 2 2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
  },
];

const footerLinks = [
  ["Documentation", "https://www.parseable.com/docs/"],
  ["Help", "https://logg.ing/quick-chat"],
  ["Privacy", "https://www.parseable.com/policy/"],
] as const;

export function LeftPanel() {
  return (
    <div
      className="relative p-10 lg:p-12 min-h-104 overflow-hidden flex flex-col"
      style={{
        backgroundColor: "#E8EBFF",
        backgroundImage: DOT_PATTERN,
        backgroundRepeat: "repeat",
        backgroundSize: "28px 28px",
      }}
    >
      <a
        href="https://www.parseable.com"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Parseable"
        className="flex items-center"
      >
        <svg
          width="180"
          height="36"
          viewBox="0 0 560 90"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect x="0" y="5" width="56" height="56" rx="8" fill="#3a3a8c" />
          <rect x="10" y="15" width="36" height="36" rx="5" fill="#E8EBFF" />
          <rect x="22" y="27" width="12" height="12" rx="2" fill="#3a3a8c" />
          <text
            x="68"
            y="56"
            fontFamily="Inter,sans-serif"
            fontWeight="700"
            fontSize="46"
            fill="#18181b"
          >
            parseable
          </text>
        </svg>
      </a>

      <div className="mt-10 flex flex-col leading-[1.05]">
        <span className="text-4xl font-bold text-coolGray-200">
          Observability
        </span>
        <span className="text-4xl font-bold text-parseableBlue-500">
          Simplified.
        </span>
      </div>

      <p className="mt-3 text-[0.9375rem] text-coolGray-400">
        AI Native observability datalake.
      </p>

      <div className="mt-8 flex flex-col gap-4">
        {features.map((f) => (
          <div key={f.text} className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white border border-black/5 shadow-sm flex items-center justify-center shrink-0">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke={f.color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d={f.d} />
              </svg>
            </div>
            <span className="text-[0.9375rem] text-coolGray-200">{f.text}</span>
          </div>
        ))}
      </div>

      <div className="mt-auto pt-8">
        <div className="h-px w-full bg-black/5 mb-2" />
        <div className="flex gap-2 items-center flex-wrap">
          {footerLinks.map(([label, href], i) => (
            <span key={href} className="flex items-center gap-2">
              {i > 0 && <span className="text-xs text-coolGray-500">|</span>}
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[0.8125rem] text-coolGray-400 hover:text-parseableBlue-500 no-underline"
              >
                {label}
              </a>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
