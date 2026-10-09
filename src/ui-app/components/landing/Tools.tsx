const STEPS = [
  {
    number: "01",
    title: "Authenticate",
    description: "Your existing Parseable API key establishes instance and tenant access.",
  },
  {
    number: "02",
    title: "Discover",
    description: "The connected OSS, Enterprise, or Cloud instance returns its live tool catalog.",
  },
  {
    number: "03",
    title: "Execute",
    description: "Tool calls run inside Parseable with server-side validation and RBAC.",
  },
];

export function Tools() {
  return (
    <section className="mt-40 w-full">
      <div className="max-w-page mx-auto px-4 md:px-0">
        <div className="flex flex-col items-center text-center gap-4 mb-14 max-w-2xl mx-auto">
          <h2
            className="font-sans text-[3rem] font-medium leading-[112%] tracking-tight text-[rgba(0,0,0,0.76)]"
            style={{ fontFamily: '"Open Sans", sans-serif' }}
          >
            Tools from your Parseable instance
          </h2>
          <p className="font-inter text-base text-black/50 leading-7">
            No fixed catalog in the MCP adapter. Your instance exposes exactly the tools supported
            by its edition and deployment.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {STEPS.map((step) => (
            <div
              key={step.number}
              className="rounded-xl border border-black/[0.06] bg-white p-6 hover:border-black/10 transition-all"
            >
              <span className="font-mono text-xs text-[#3A3A8C]">{step.number}</span>
              <h3 className="mt-4 font-sans text-lg font-medium text-[#14151A]">{step.title}</h3>
              <p className="mt-2 font-inter text-sm leading-6 text-black/50">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
