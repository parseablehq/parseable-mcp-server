import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { TwoColumnCard } from "../components/Card";

interface Workspace {
  workspace_id: string;
  workspace_name: string;
  state: string;
  plan: string;
  prism_url: string;
}

export function WorkspacePickerPage() {
  const [params] = useSearchParams();
  const flowToken = params.get("flow_token") ?? "";
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [username, setUsername] = useState("");
  const [selected, setSelected] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    // Data is embedded by the server as JSON in the page, or fetched via query param.
    // The server renders this page by redirecting to /pick-workspace?flow_token=... with
    // workspace data as a JSON query param (base64 encoded).
    const raw = params.get("data");
    if (raw) {
      try {
        const decoded = JSON.parse(atob(raw));
        setWorkspaces(decoded.workspaces ?? []);
        setUsername(decoded.username ?? "");
      } catch {}
    }
  }, [params]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    setBusy(true);
    const form = document.createElement("form");
    form.method = "POST";
    form.action = "/oauth/select-workspace";
    [["flow_token", flowToken], ["workspace_id", selected]].forEach(([k, v]) => {
      const inp = document.createElement("input");
      inp.type = "hidden"; inp.name = k; inp.value = v;
      form.appendChild(inp);
    });
    document.body.appendChild(form);
    form.submit();
  };

  return (
    <TwoColumnCard>
      <p className="text-lg font-semibold text-[#18181b]">Select a workspace</p>
      {username && <p className="text-sm text-[#71717a] -mt-4">Signed in as {username}</p>}

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        {workspaces.length === 0 ? (
          <div className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-8 text-center">
            <div className="mx-auto w-10 h-10 rounded-full bg-[#3a3a8c]/10 flex items-center justify-center text-[#3a3a8c] font-semibold mb-3">!</div>
            <p className="text-sm font-semibold text-[#18181b] mb-1">No Parseable workspace yet</p>
            <p className="text-xs text-[#71717a] mb-4">Create a workspace to use this connector.</p>
            <a href="https://app.parseable.com" className="inline-block px-4 py-2 rounded-md bg-[#3a3a8c] text-white text-sm font-semibold hover:bg-[#2e2e70] no-underline transition-colors">
              Create workspace
            </a>
          </div>
        ) : (
          <>
            {workspaces.map((w) => {
              const running = w.state === "running";
              return (
                <label key={w.workspace_id} className={`block ${!running ? "opacity-60 pointer-events-none" : "cursor-pointer"}`}>
                  <input
                    type="radio"
                    name="workspace_id"
                    value={w.workspace_id}
                    disabled={!running}
                    checked={selected === w.workspace_id}
                    onChange={() => setSelected(w.workspace_id)}
                    className="sr-only peer"
                  />
                  <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 transition hover:border-[#3a3a8c] peer-checked:border-[#3a3a8c] peer-checked:bg-[#eeeef9]">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-base font-semibold text-[#18181b]">{w.workspace_name}</div>
                        <div className="mt-0.5 text-xs text-[#71717a]">{w.prism_url}</div>
                      </div>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${running ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>
                        {w.state}
                      </span>
                    </div>
                    <div className="mt-2 text-xs text-[#a1a1aa] uppercase tracking-wide">{w.plan} plan</div>
                  </div>
                </label>
              );
            })}
            <button
              type="submit"
              disabled={!selected || busy}
              className="mt-2 h-10 px-3 rounded-md bg-[#3a3a8c] text-white text-sm font-semibold cursor-pointer hover:bg-[#2e2e70] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Continue
            </button>
          </>
        )}
      </form>
    </TwoColumnCard>
  );
}
