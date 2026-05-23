function esc(v: string): string {
  return String(v)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Login page styled after Prism's LoginCloud.tsx — social buttons (LinkedIn,
 * Google, GitHub) + email/password fallback. Uses Clerk JS browser SDK to drive
 * the actual sign-in flow.
 */
export function renderLoginPage(opts: {
  publishableKey: string;
  flowToken: string;
  publicBaseUrl: string;
}): string {
  const flowToken = esc(opts.flowToken);
  const pk = esc(opts.publishableKey);
  const ssoCallback = `${opts.publicBaseUrl.replace(/\/+$/, "")}/sso-callback`;
  const postAuth = `${opts.publicBaseUrl.replace(/\/+$/, "")}/post-auth`;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Sign in to Parseable</title>
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
          coolGray: { 200: "#e5e7eb", 600: "#4b5563", 800: "#1f2937", 900: "#111827" },
          parseableBlue: { 600: "#5760d9", 700: "#3a3a8c", 800: "#2e2e6f" }
        },
        fontFamily: { sans: ["DM Sans", "ui-sans-serif", "system-ui", "sans-serif"] }
      }
    }
  };
</script>
<style>
  body { font-family: "DM Sans", ui-sans-serif, system-ui, sans-serif; }
  .social-btn { display:flex; align-items:center; justify-content:center; gap:0.625rem; width:100%; padding:0.625rem 0.75rem; border-radius:0.5rem; background:#F5F6F7; color:#111827; font-weight:500; font-size:0.875rem; transition:opacity 120ms; }
  .social-btn:hover { opacity:0.9; }
  .social-btn:disabled { opacity:0.5; cursor:not-allowed; }
  .last-used { position:absolute; top:0; right:-1rem; transform:translateY(-50%); background:#3a3a8c; color:#fff; border:1px solid #2e2e6f; padding:0.125rem 0.5rem; border-radius:0.375rem; font-size:0.625rem; font-weight:600; pointer-events:none; }
  .field { width:100%; padding:0.625rem 0.75rem; border-radius:0.5rem; background:#1f2937; color:#e5e7eb; border:1px solid #374151; font-size:0.875rem; }
  .field:focus { outline:none; border-color:#3a3a8c; }
  .primary-btn { width:100%; padding:0.625rem 0.75rem; border-radius:0.5rem; background:#3a3a8c; color:#fff; font-weight:600; font-size:0.875rem; }
  .primary-btn:hover { background:#2e2e6f; }
  .primary-btn:disabled { opacity:0.5; cursor:not-allowed; }
</style>
</head>
<body class="bg-slate-950 text-coolGray-200 min-h-screen flex items-center justify-center p-6">
<div class="w-full max-w-md p-8 sm:p-10 rounded-2xl bg-slate-900 shadow-xl">
  <div class="text-center mb-8">
    <h1 class="text-xl font-semibold text-coolGray-200">Log in to your account</h1>
  </div>

  <div class="flex flex-col gap-3">
    <div class="relative w-full">
      <button id="btn-linkedin" class="social-btn">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="#0A66C2" xmlns="http://www.w3.org/2000/svg"><path d="M20.452 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.357V9h3.414v1.561h.046c.477-.9 1.637-1.852 3.37-1.852 3.601 0 4.268 2.37 4.268 5.456v6.287zM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124zM7.119 20.452H3.554V9H7.12v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.226.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
        Continue with LinkedIn
      </button>
      <span class="last-used" id="last-used-linkedin" style="display:none">Last used</span>
    </div>

    <div class="relative w-full">
      <button id="btn-google" class="social-btn">
        <svg width="20" height="20" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/><path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/><path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/><path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/></svg>
        Continue with Google
      </button>
      <span class="last-used" id="last-used-google" style="display:none">Last used</span>
    </div>

    <div class="relative w-full">
      <button id="btn-github" class="social-btn">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="#000" xmlns="http://www.w3.org/2000/svg"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
        Continue with GitHub
      </button>
      <span class="last-used" id="last-used-github" style="display:none">Last used</span>
    </div>
  </div>

  <div class="mt-7 flex items-center gap-4">
    <div class="h-px flex-1 bg-coolGray-900"></div>
    <span class="text-xs text-coolGray-600 uppercase tracking-wide">OR WITH EMAIL</span>
    <div class="h-px flex-1 bg-coolGray-900"></div>
  </div>

  <form id="email-form" class="mt-6 flex flex-col gap-3">
    <input type="email" id="email" name="email" placeholder="Email address" required autocomplete="email" class="field" />
    <input type="password" id="password" name="password" placeholder="Password" required autocomplete="current-password" class="field" />
    <button type="submit" id="email-submit" class="primary-btn">Continue with email</button>
    <p id="email-error" class="text-xs text-red-400 mt-1 hidden"></p>
  </form>

  <div id="code-form-wrap" class="mt-4 hidden">
    <p class="text-xs text-coolGray-600 mb-2">We sent a verification code to your email.</p>
    <form id="code-form" class="flex gap-2">
      <input type="text" id="code" name="code" placeholder="Verification code" required inputmode="numeric" class="field" />
      <button type="submit" class="primary-btn" style="width:auto; padding-left:1rem; padding-right:1rem;">Verify</button>
    </form>
  </div>

  <div class="mt-6 text-center text-xs text-coolGray-600">
    By signing in I agree to the
    <a href="https://www.parseable.com/csa" class="text-parseableBlue-600 hover:text-parseableBlue-700">Cloud Service Agreement</a>
    and
    <a href="https://www.parseable.com/privacy" class="text-parseableBlue-600 hover:text-parseableBlue-700">Privacy Policy</a>.
  </div>
</div>

<script>
  // Preserve flow_token across Clerk's OAuth redirects.
  try { sessionStorage.setItem("parseable_mcp_flow_token", "${flowToken}"); } catch (e) {}
  window.__CLERK_PUBLISHABLE_KEY = "${pk}";
  window.__SSO_CALLBACK = "${esc(ssoCallback)}";
  window.__POST_AUTH = "${esc(postAuth)}";
</script>
<script src="https://cdn.jsdelivr.net/npm/@clerk/clerk-js@5/dist/clerk.browser.js" data-clerk-publishable-key="${pk}" async crossorigin="anonymous"></script>
<script>
  function showError(msg) {
    var el = document.getElementById("email-error");
    el.textContent = msg;
    el.classList.remove("hidden");
  }
  function clearError() {
    var el = document.getElementById("email-error");
    el.textContent = "";
    el.classList.add("hidden");
  }
  function disableButtons(disabled) {
    ["btn-linkedin", "btn-google", "btn-github", "email-submit"].forEach(function(id){
      var el = document.getElementById(id);
      if (el) el.disabled = disabled;
    });
  }
  function markLastUsed(clerk) {
    try {
      var strategy = clerk.client && clerk.client.lastAuthenticationStrategy;
      if (!strategy || !strategy.indexOf || strategy.indexOf("oauth_") !== 0) return;
      var map = { "oauth_linkedin_oidc": "linkedin", "oauth_google": "google", "oauth_github": "github" };
      var key = map[strategy];
      if (key) {
        var el = document.getElementById("last-used-" + key);
        if (el) el.style.display = "block";
      }
    } catch (e) {}
  }
  function waitForClerk(cb) {
    if (window.Clerk) cb(window.Clerk);
    else setTimeout(function(){ waitForClerk(cb); }, 50);
  }
  function startSocial(clerk, provider) {
    clerk.client.signIn.authenticateWithRedirect({
      strategy: provider,
      redirectUrl: window.__SSO_CALLBACK,
      redirectUrlComplete: window.__POST_AUTH,
    }).catch(function(err){ showError(err && err.message ? err.message : "Sign-in failed"); });
  }
  waitForClerk(function(clerk){
    clerk.load({
      publishableKey: window.__CLERK_PUBLISHABLE_KEY,
      signInUrl: "/login",
      signUpUrl: "/login",
      signInForceRedirectUrl: window.__POST_AUTH,
      signUpForceRedirectUrl: window.__POST_AUTH,
      signInFallbackRedirectUrl: window.__POST_AUTH,
      signUpFallbackRedirectUrl: window.__POST_AUTH,
    }).then(function(){
      disableButtons(false);
      markLastUsed(clerk);

      document.getElementById("btn-linkedin").addEventListener("click", function(){ startSocial(clerk, "oauth_linkedin_oidc"); });
      document.getElementById("btn-google").addEventListener("click", function(){ startSocial(clerk, "oauth_google"); });
      document.getElementById("btn-github").addEventListener("click", function(){ startSocial(clerk, "oauth_github"); });

      var lastEmailCodeAddressId = null;

      document.getElementById("email-form").addEventListener("submit", async function(e){
        e.preventDefault();
        clearError();
        disableButtons(true);
        var email = document.getElementById("email").value.trim();
        var password = document.getElementById("password").value;
        try {
          var si = await clerk.client.signIn.create({ identifier: email });
          var factors = si.supportedFirstFactors || [];
          var supportsPassword = factors.some(function(f){ return f && f.strategy === "password"; });
          if (supportsPassword) {
            var attempt = await si.attemptFirstFactor({ strategy: "password", password: password });
            if (attempt.status === "complete") {
              await clerk.setActive({ session: attempt.createdSessionId });
              window.location.href = window.__POST_AUTH;
              return;
            }
            showError("Could not complete sign in.");
            disableButtons(false);
            return;
          }
          var emailCode = factors.find(function(f){ return f && f.strategy === "email_code" && f.emailAddressId; });
          if (!emailCode) {
            showError("This account cannot sign in with password. Use the original sign-in method.");
            disableButtons(false);
            return;
          }
          lastEmailCodeAddressId = emailCode.emailAddressId;
          await si.prepareFirstFactor({ strategy: "email_code", emailAddressId: emailCode.emailAddressId });
          document.getElementById("code-form-wrap").classList.remove("hidden");
          disableButtons(false);
        } catch (err) {
          showError(err && err.message ? err.message : "Sign in failed");
          disableButtons(false);
        }
      });

      document.getElementById("code-form").addEventListener("submit", async function(e){
        e.preventDefault();
        clearError();
        var code = document.getElementById("code").value.trim();
        try {
          var attempt = await clerk.client.signIn.attemptFirstFactor({ strategy: "email_code", code: code });
          if (attempt.status === "complete") {
            await clerk.setActive({ session: attempt.createdSessionId });
            window.location.href = window.__POST_AUTH;
            return;
          }
          showError("Verification failed.");
        } catch (err) {
          showError(err && err.message ? err.message : "Verification failed");
        }
      });
    });
  });
  disableButtons(true);
</script>
</body>
</html>`;
}

/**
 * Page Clerk redirects to after social OAuth dance finishes.
 * Calls handleRedirectCallback() then sends user to /post-auth.
 */
export function renderSsoCallbackPage(opts: {
  publishableKey: string;
  publicBaseUrl: string;
}): string {
  const pk = esc(opts.publishableKey);
  const postAuth = `${opts.publicBaseUrl.replace(/\/+$/, "")}/post-auth`;
  return `<!doctype html>
<html lang="en"><head><meta charset="UTF-8"><title>Signing you in…</title>
<style>body{background:#020617;color:#e5e7eb;font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;}</style>
</head><body>
<div>Signing you in…</div>
<script src="https://cdn.jsdelivr.net/npm/@clerk/clerk-js@5/dist/clerk.browser.js" data-clerk-publishable-key="${pk}" async crossorigin="anonymous"></script>
<script>
  function waitForClerk(cb){ if(window.Clerk) cb(window.Clerk); else setTimeout(function(){waitForClerk(cb);},50); }
  waitForClerk(function(clerk){
    clerk.load({
      publishableKey: "${pk}",
      signInUrl: "/login",
      signUpUrl: "/login",
      signInForceRedirectUrl: "${esc(postAuth)}",
      signUpForceRedirectUrl: "${esc(postAuth)}",
      signInFallbackRedirectUrl: "${esc(postAuth)}",
      signUpFallbackRedirectUrl: "${esc(postAuth)}",
    }).then(function(){
      // Clerk v5 sometimes consumes the handshake without navigating; force redirect.
      Promise.resolve(clerk.handleRedirectCallback({ redirectUrl: "${esc(postAuth)}" }))
        .catch(function(err){ console.error("handleRedirectCallback:", err); })
        .finally(function(){ window.location.replace("${esc(postAuth)}"); });
    });
  });
</script>
</body></html>`;
}

/**
 * Page that runs after Clerk auth completes. Reads flow_token from sessionStorage
 * and redirects to /oauth/callback?flow_token=... to continue MCP OAuth flow.
 */
export function renderPostAuthPage(opts: { publicBaseUrl: string }): string {
  const callback = `${opts.publicBaseUrl.replace(/\/+$/, "")}/oauth/callback`;
  return `<!doctype html>
<html lang="en"><head><meta charset="UTF-8"><title>Finishing sign-in…</title>
<style>body{background:#020617;color:#e5e7eb;font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;}</style>
</head><body>
<div>Finishing sign-in…</div>
<script>
  try {
    var token = sessionStorage.getItem("parseable_mcp_flow_token");
    if (!token) {
      document.body.innerHTML = "<pre style='color:#f87171;padding:1rem'>Missing flow_token — restart the connector from Claude.</pre>";
    } else {
      window.location.href = "${esc(callback)}?flow_token=" + encodeURIComponent(token);
    }
  } catch (e) {
    document.body.innerHTML = "<pre style='color:#f87171;padding:1rem'>" + e.message + "</pre>";
  }
</script>
</body></html>`;
}
