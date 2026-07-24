import type { OrgWorkspace } from "../oauth/orchestrator.js";

function esc(v: string): string {
  return String(v)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function headHtml(title: string): string {
  return `<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(title)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
<script src="https://cdn.tailwindcss.com"></script>
<script>
  tailwind.config = {
    theme: {
      extend: {
        colors: {
          brandPrimary: "#3a3a8c",
          brandHighlight: "#00A896",
          parseableBlue: { 600: "#5760d9", 700: "#3a3a8c" }
        },
        fontFamily: { sans: ["Open Sans", "ui-sans-serif", "system-ui", "sans-serif"] }
      }
    }
  };
</script>
<style>body { font-family: "Open Sans", ui-sans-serif, system-ui, sans-serif; }</style>
</head>`;
}

export function renderWorkspacePicker(opts: {
  flowToken: string;
  workspaces: OrgWorkspace[];
  username: string;
}): string {
  const cards = opts.workspaces
    .map((w) => {
      const stateClass =
        w.state === "running"
          ? "bg-brandHighlight/15 text-brandHighlight"
          : "bg-amber-500/15 text-amber-400";
      const stateLabel = esc(w.state);
      const id = esc(w.workspace_id);
      const name = esc(w.workspace_name);
      const plan = esc(w.plan);
      const url = esc(w.prism_url);
      const disabled =
        w.state !== "running" ? "opacity-60 pointer-events-none" : "";
      return `
<label class="block ${disabled}">
  <input type="radio" name="workspace_id" value="${id}" class="peer sr-only" ${w.state === "running" ? "" : "disabled"} />
  <div class="rounded-xl border border-slate-700 bg-slate-900 p-5 cursor-pointer transition hover:border-brandPrimary peer-checked:border-brandPrimary peer-checked:bg-slate-800">
    <div class="flex items-start justify-between gap-3">
      <div>
        <div class="text-lg font-semibold text-slate-100">${name}</div>
        <div class="mt-1 text-xs text-slate-400">${url}</div>
      </div>
      <span class="rounded-full px-2 py-0.5 text-xs font-medium ${stateClass}">${stateLabel}</span>
    </div>
    <div class="mt-3 text-xs text-slate-500 uppercase tracking-wide">${plan} plan</div>
  </div>
</label>`;
    })
    .join("\n");

  return `<!doctype html>
<html lang="en">
${headHtml("Select workspace")}
<body class="bg-slate-950 text-slate-200 min-h-screen flex items-center justify-center p-6">
<div class="w-full max-w-2xl rounded-2xl bg-slate-900 shadow-xl p-8 sm:p-10">
  <div class="mb-6">
    <h1 class="text-2xl font-semibold text-slate-100">Select a workspace</h1>
    <p class="mt-1 text-sm text-slate-500">Signed in as ${esc(opts.username)}. Pick the Parseable workspace to connect.</p>
  </div>
  <form method="POST" action="/oauth/select-workspace" class="space-y-3">
    <input type="hidden" name="flow_token" value="${esc(opts.flowToken)}" />
    ${cards}
    <button type="submit" class="mt-6 w-full rounded-lg bg-brandPrimary px-4 py-2.5 text-sm font-semibold text-white hover:bg-brandPrimary/90 disabled:opacity-50">
      Continue
    </button>
  </form>
</div>
</body>
</html>`;
}

export function renderNoWorkspace(opts: { username: string }): string {
  return `<!doctype html>
<html lang="en">
${headHtml("No workspace yet")}
<body class="bg-slate-950 text-slate-200 min-h-screen flex items-center justify-center p-6">
<div class="w-full max-w-md rounded-2xl bg-slate-900 shadow-xl p-8 sm:p-10 text-center">
  <div class="mx-auto h-12 w-12 rounded-full bg-brandPrimary/20 flex items-center justify-center text-brandPrimary text-xl font-semibold">!</div>
  <h1 class="mt-5 text-xl font-semibold text-slate-100">No Parseable workspace yet</h1>
  <p class="mt-2 text-sm text-slate-400">Signed in as ${esc(opts.username)}, but you don't have a Parseable workspace. Create one to use this connector.</p>
  <a href="https://app.parseable.com" class="mt-6 inline-block w-full rounded-lg bg-brandPrimary px-4 py-2.5 text-sm font-semibold text-white hover:bg-brandPrimary/90">
    Create a workspace at app.parseable.com
  </a>
  <p class="mt-4 text-xs text-slate-500">After creating a workspace, restart this connection from Claude.</p>
</div>
</body>
</html>`;
}
