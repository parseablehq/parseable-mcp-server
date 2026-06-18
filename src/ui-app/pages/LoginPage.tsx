import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ClerkProvider, useSignIn, useClerk } from "@clerk/clerk-react";
import { TwoColumnCard } from "../components/Card";
import { useConfig } from "../ConfigProvider";

const LINKEDIN_SVG = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="#0A66C2" xmlns="http://www.w3.org/2000/svg">
    <path d="M20.452 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.357V9h3.414v1.561h.046c.477-.9 1.637-1.852 3.37-1.852 3.601 0 4.268 2.37 4.268 5.456v6.287zM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124zM7.119 20.452H3.554V9H7.12v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.226.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);
const GOOGLE_SVG = (
  <svg width="20" height="20" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
    <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
    <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
    <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
  </svg>
);
const GITHUB_SVG = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="#24292F" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
  </svg>
);

type Provider = "oauth_linkedin_oidc" | "oauth_google" | "oauth_github";

function SocialBtn({
  icon,
  label,
  provider,
  lastUsed,
  disabled,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  provider: Provider;
  lastUsed: boolean;
  disabled: boolean;
  onClick: (p: Provider) => void;
}) {
  return (
    <div className="relative w-full">
      <button
        type="button"
        disabled={disabled}
        onClick={() => onClick(provider)}
        className="flex items-center justify-center gap-2.5 w-full h-10 px-3 rounded-md bg-[#F5F6F7] border border-[#E5E7EB] text-[#27272a] text-sm font-medium cursor-pointer transition-colors hover:bg-[#ECEDF0] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {icon}
        {label}
      </button>
      {lastUsed && (
        <div className="pointer-events-none absolute -right-3 top-0 -translate-y-1/2">
          <span className="bg-[#3a3a8c] text-white border border-[#2e2e70] px-1.5 py-0.5 rounded text-[0.625rem] font-semibold whitespace-nowrap">
            Last used
          </span>
        </div>
      )}
    </div>
  );
}

function LoginForm({ flowToken, publicBaseUrl }: { flowToken: string; publicBaseUrl: string }) {
  const { signIn, isLoaded } = useSignIn();
  const { client } = useClerk();
  const [error, setError] = useState("");
  const [showCode, setShowCode] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  const base = publicBaseUrl.replace(/\/+$/, "");
  const ssoCallback = `${base}/sso-callback`;
  const postAuth = `${base}/post-auth`;

  const lastProvider = (() => {
    const s = client?.lastAuthenticationStrategy;
    return s?.startsWith("oauth_") ? s : null;
  })();

  useEffect(() => {
    try { sessionStorage.setItem("parseable_mcp_flow_token", flowToken); } catch {}
  }, [flowToken]);

  const startSocial = (provider: Provider) => {
    if (!isLoaded) return;
    signIn.authenticateWithRedirect({ strategy: provider, redirectUrl: ssoCallback, redirectUrlComplete: postAuth })
      .catch((e) => setError(e?.message ?? "Sign-in failed"));
  };

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;
    setError(""); setBusy(true);
    try {
      const si = await signIn.create({ identifier: email });
      const factors = si.supportedFirstFactors ?? [];
      if (factors.some((f) => f.strategy === "password")) {
        const attempt = await si.attemptFirstFactor({ strategy: "password", password });
        if (attempt.status === "complete") { window.location.href = postAuth; return; }
        setError("Could not complete sign in.");
      } else {
        const emailCode = factors.find((f) => f.strategy === "email_code");
        if (!emailCode || !("emailAddressId" in emailCode)) { setError("Use your original sign-in method."); return; }
        await si.prepareFirstFactor({ strategy: "email_code", emailAddressId: (emailCode as { emailAddressId: string }).emailAddressId });
        setShowCode(true);
      }
    } catch (e: unknown) {
      setError((e as { message?: string })?.message ?? "Sign in failed");
    } finally { setBusy(false); }
  };

  const handleCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;
    setError(""); setBusy(true);
    try {
      const attempt = await signIn.attemptFirstFactor({ strategy: "email_code", code });
      if (attempt.status === "complete") { window.location.href = postAuth; return; }
      setError("Verification failed.");
    } catch (e: unknown) {
      setError((e as { message?: string })?.message ?? "Verification failed");
    } finally { setBusy(false); }
  };

  const disabled = !isLoaded || busy;

  return (
    <>
      <p className="text-lg font-semibold text-[#18181b] text-center">Log in to your account</p>

      <div className="flex flex-col gap-3">
        <SocialBtn icon={LINKEDIN_SVG} label="Continue with LinkedIn" provider="oauth_linkedin_oidc" lastUsed={lastProvider === "oauth_linkedin_oidc"} disabled={disabled} onClick={startSocial} />
        <SocialBtn icon={GOOGLE_SVG} label="Continue with Google" provider="oauth_google" lastUsed={lastProvider === "oauth_google"} disabled={disabled} onClick={startSocial} />
        <SocialBtn icon={GITHUB_SVG} label="Continue with GitHub" provider="oauth_github" lastUsed={lastProvider === "oauth_github"} disabled={disabled} onClick={startSocial} />
      </div>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-[#E5E7EB]" />
        <span className="text-[0.6875rem] text-[#71717a] uppercase tracking-wide">or with email</span>
        <div className="h-px flex-1 bg-[#E5E7EB]" />
      </div>

      {!showCode ? (
        <form onSubmit={handleEmail} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[0.8125rem] font-medium text-[#52525b]" htmlFor="email">Email address</label>
            <input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="h-10 px-3 rounded-md border border-[#E5E7EB] bg-white text-sm text-[#27272a] outline-none focus:border-[#3a3a8c] focus:ring-2 focus:ring-[#3a3a8c]/10 transition" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[0.8125rem] font-medium text-[#52525b]" htmlFor="password">Password</label>
            <input id="password" type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="h-10 px-3 rounded-md border border-[#E5E7EB] bg-white text-sm text-[#27272a] outline-none focus:border-[#3a3a8c] focus:ring-2 focus:ring-[#3a3a8c]/10 transition" />
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <button type="submit" disabled={disabled}
            className="h-10 px-3 rounded-md bg-[#3a3a8c] text-white text-sm font-semibold cursor-pointer hover:bg-[#2e2e70] disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            Continue with email
          </button>
        </form>
      ) : (
        <form onSubmit={handleCode} className="flex flex-col gap-4">
          <p className="text-xs text-[#71717a]">We sent a verification code to your email.</p>
          <div className="flex gap-2">
            <input type="text" required inputMode="numeric" value={code} onChange={(e) => setCode(e.target.value)}
              placeholder="Verification code"
              className="flex-1 h-10 px-3 rounded-md border border-[#E5E7EB] bg-white text-sm text-[#27272a] outline-none focus:border-[#3a3a8c] focus:ring-2 focus:ring-[#3a3a8c]/10 transition" />
            <button type="submit" disabled={disabled}
              className="h-10 px-4 rounded-md bg-[#3a3a8c] text-white text-sm font-semibold cursor-pointer hover:bg-[#2e2e70] disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap">
              Verify
            </button>
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
        </form>
      )}

      <p className="text-xs text-[#71717a] text-center leading-relaxed">
        By signing in I agree to the{" "}
        <a href="https://www.parseable.com/csa" target="_blank" rel="noopener noreferrer" className="text-[#3a3a8c] hover:text-[#2e2e70] no-underline">Cloud Service Agreement</a>,{" "}
        <a href="https://www.parseable.com/tos" target="_blank" rel="noopener noreferrer" className="text-[#3a3a8c] hover:text-[#2e2e70] no-underline">Terms of Service</a>,{" "}
        <a href="https://www.parseable.com/dpa" target="_blank" rel="noopener noreferrer" className="text-[#3a3a8c] hover:text-[#2e2e70] no-underline">Data Processing Terms</a>.
      </p>
    </>
  );
}

export function LoginPage() {
  const { publishableKey, publicBaseUrl } = useConfig();
  const [params] = useSearchParams();
  const flowToken = params.get("flow_token") ?? sessionStorage.getItem("parseable_mcp_flow_token") ?? "";

  return (
    <ClerkProvider publishableKey={publishableKey} signInUrl="/login" signUpUrl="/login" signInForceRedirectUrl={`${publicBaseUrl.replace(/\/+$/, "")}/post-auth`}>
      <TwoColumnCard>
        <LoginForm flowToken={flowToken} publicBaseUrl={publicBaseUrl} />
      </TwoColumnCard>
    </ClerkProvider>
  );
}
