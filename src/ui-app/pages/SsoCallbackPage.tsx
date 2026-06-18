import { useEffect } from "react";
import { ClerkProvider, useClerk } from "@clerk/clerk-react";
import { CenteredCard } from "../components/Card";
import { Spinner } from "../components/Spinner";
import { useConfig } from "../ConfigProvider";

function Callback({ postAuth }: { postAuth: string }) {
  const { handleRedirectCallback } = useClerk();

  useEffect(() => {
    Promise.resolve(handleRedirectCallback({ redirectUrl: postAuth }))
      .catch(console.error)
      .finally(() => { window.location.replace(postAuth); });
  }, [handleRedirectCallback, postAuth]);

  return (
    <div className="flex flex-col items-center gap-3">
      <Spinner />
      <p className="text-sm text-[#52525b]">Signing you in…</p>
    </div>
  );
}

export function SsoCallbackPage() {
  const { publishableKey, publicBaseUrl } = useConfig();
  const postAuth = `${publicBaseUrl.replace(/\/+$/, "")}/post-auth`;

  return (
    <ClerkProvider publishableKey={publishableKey} signInUrl="/login" signUpUrl="/login">
      <CenteredCard>
        <Callback postAuth={postAuth} />
      </CenteredCard>
    </ClerkProvider>
  );
}
