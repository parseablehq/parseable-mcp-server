import {
  IconBell,
  IconBolt,
  IconDatabase,
  IconEye,
  IconSearch,
  IconShieldCheck,
} from "@tabler/icons-react";

const FEATURES = [
  {
    icon: <IconSearch size={20} stroke={1.5} aria-hidden="true" />,
    iconColor: "#3A3A8C",
    iconBg: "rgba(58,58,140,0.08)",
    title: "Natural language querying",
    desc: "Ask questions in plain English. The server translates them to SQL and runs against your Parseable datasets.",
  },
  {
    icon: <IconBolt size={20} stroke={1.5} aria-hidden="true" />,
    iconColor: "#D97706",
    iconBg: "rgba(217,119,6,0.08)",
    title: "Sub-second search",
    desc: "Full-fidelity queries across millions of log events, powered by Parseable's columnar storage engine.",
  },
  {
    icon: <IconDatabase size={20} stroke={1.5} aria-hidden="true" />,
    iconColor: "#0891B2",
    iconBg: "rgba(8,145,178,0.08)",
    title: "Full tool surface",
    desc: "Datasets, alerts, RBAC roles, and cluster health are all exposed - not just raw log search.",
  },
  {
    icon: <IconShieldCheck size={20} stroke={1.5} aria-hidden="true" />,
    iconColor: "#059669",
    iconBg: "rgba(5,150,105,0.08)",
    title: "Same auth as Parseable",
    desc: "Uses your existing Parseable credentials or OAuth token. No separate secret management.",
  },
  {
    icon: <IconEye size={20} stroke={1.5} aria-hidden="true" />,
    iconColor: "#7C3AED",
    iconBg: "rgba(124,58,237,0.08)",
    title: "Dashboard-free investigation",
    desc: "Debug production incidents, find anomalies, and correlate signals without switching context.",
  },
  {
    icon: <IconBell size={20} stroke={1.5} aria-hidden="true" />,
    iconColor: "#DC2626",
    iconBg: "rgba(220,38,38,0.08)",
    title: "Safety rails built in",
    desc: "query_sql blocks all DDL and DML. Admin tools are read-only. You can't break production by asking.",
  },
];

export function FeatureGrid() {
  return (
    <section
      className="mt-40 w-full"
      style={{
        background:
          "linear-gradient(180deg, #FFFFFF 0%, rgba(241, 231, 255, 0.8) 100%)",
      }}
    >
      <div className="max-w-page mx-auto px-4 md:px-0">
        <div className="flex flex-col items-center text-center gap-4 mb-14">
          <h2
            className="font-sans text-[3rem] font-medium leading-[112%] tracking-tight text-[rgba(0,0,0,0.76)]"
            style={{ fontFamily: '"Open Sans", sans-serif' }}
          >
            Everything you need to investigate faster
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map(({ icon, iconColor, iconBg, title, desc }) => (
            <div
              key={title}
              className="flex flex-col gap-4 p-7 rounded-xl border border-black/[0.06] bg-white hover:border-black/10 transition-all"
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ background: iconBg, color: iconColor }}
              >
                {icon}
              </div>
              <div className="flex flex-col gap-2">
                <h3
                  className="font-sans text-base font-medium text-[#14151A]"
                  style={{ fontFamily: '"Open Sans", sans-serif' }}
                >
                  {title}
                </h3>
                <p className="font-inter text-sm text-black/60 leading-6">
                  {desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Prompts ──────────────────────────────────────────────────────────────────
