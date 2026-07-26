import { useEffect, useState } from "react";
import { ClerkProvider, useClerk } from "@clerk/clerk-react";
import { CenteredCard } from "../components/Card";
import { Spinner } from "../components/Spinner";
import { useConfig } from "../ConfigProvider";

function PostAuth({ callbackBase }: { callbackBase: string }) {
  const { session } = useClerk();
  const [error, setError] = useState("");

  useEffect(() => {
    let tries = 0;
    function go() {
      try {
        const token = sessionStorage.getItem("parseable_mcp_flow_token");
        if (!token) { setError("Missing flow_token - restart the connector from Claude."); return; }
        window.location.replace(`${callbackBase}/oauth/callback?flow_token=${encodeURIComponent(token)}`);
      } catch (e: unknown) {
        setError((e as Error).message ?? "Unknown error");
      }
    }
    function check() {
      tries++;
      if (session || tries > 40) { go(); return; }
      setTimeout(check, 100);
    }
    check();
  }, [session, callbackBase]);

  if (error) {
    return (
      <div className="text-center flex flex-col gap-3">
        <p className="text-sm text-red-500">{error}</p>
        <p className="text-xs text-[#71717a]">Return to Claude and reconnect.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <Spinner />
      <p className="text-sm text-[#52525b]">Finishing sign-in…</p>
    </div>
  );
}

export function PostAuthPage() {
  const { publishableKey, publicBaseUrl } = useConfig();
  const base = publicBaseUrl.replace(/\/+$/, "");

  return (
    <ClerkProvider publishableKey={publishableKey} signInUrl="/login">
      <CenteredCard>
        <PostAuth callbackBase={base} />
      </CenteredCard>
    </ClerkProvider>
  );
}
