export function Hero() {
  return (
    <section className="pt-32 pb-0">
      <div className="max-w-page mx-auto flex flex-col items-center text-center gap-6">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded border border-black/8 bg-white">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00A896]" />
          <span className="font-inter text-xs font-medium text-[#5E5F6E]">
            Observability, meet AI
          </span>
        </div>

        {/* H1 */}
        <h1
          className="max-w-3xl font-sans text-[2.75rem] md:text-[3.5rem] font-medium leading-[107%] tracking-tight text-[#2F2F37]"
          style={{ fontFamily: '"Open Sans", sans-serif' }}
        >
          Parseable MCP Server
        </h1>

        {/* Description */}
        <p className="max-w-2xl font-inter text-base text-black/60 leading-7">
          Connect Claude, Cursor, or any MCP-compatible agent to Parseable.
          Query terabytes of logs, metrics, and traces in natural language — at
          sub-second speed.
        </p>
      </div>
    </section>
  );
}
