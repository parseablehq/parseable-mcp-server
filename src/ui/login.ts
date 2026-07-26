function esc(v: string): string {
  return String(v)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const HEAD = `
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Inter, ui-sans-serif, system-ui, sans-serif; background: #F3F4F6; color: #27272a; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 2.5rem 1rem; }

  /* card */
  .card { width: 100%; max-width: 72rem; border-radius: 28px; box-shadow: 0 24px 60px rgba(0,0,0,0.14); overflow: hidden; background: #fff; display: grid; grid-template-columns: 1fr; }
  @media (min-width: 1024px) { .card { grid-template-columns: 1fr 1fr; } }

  /* left panel */
  .left {
    position: relative; padding: 2.5rem; min-height: 26rem; overflow: hidden;
    background-color: #E8EBFF;
    background-image: url("data:image/svg+xml,%3Csvg%20width%3D%2728%27%20height%3D%2728%27%20viewBox%3D%270%200%2028%2028%27%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%3E%3Cg%20stroke%3D%27%233B4AA4%27%20stroke-opacity%3D%270.10%27%20stroke-width%3D%271%27%20stroke-linecap%3D%27round%27%3E%3Cpath%20d%3D%27M14%2011.5v5%27%2F%3E%3Cpath%20d%3D%27M11.5%2014h5%27%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E");
    background-repeat: repeat; background-size: 28px 28px;
    display: flex; flex-direction: column;
  }
  .left-logo { display: flex; align-items: center; gap: 0.75rem; text-decoration: none; }
  .left-logo svg { width: 160px; height: auto; }
  .left-headline { margin-top: 2.5rem; display: flex; flex-direction: column; line-height: 1.05; }
  .left-headline .h1 { font-size: 2.5rem; font-weight: 700; color: #27272a; }
  .left-headline .h1-blue { font-size: 2.5rem; font-weight: 700; color: #3a3a8c; }
  .left-sub { margin-top: 0.75rem; font-size: 0.9375rem; color: #52525b; }
  .features { margin-top: 2rem; display: flex; flex-direction: column; gap: 1rem; }
  .feature { display: flex; align-items: center; gap: 0.75rem; }
  .feature-icon { width: 36px; height: 36px; border-radius: 12px; background: #fff; border: 1px solid rgba(0,0,0,0.05); box-shadow: 0 1px 3px rgba(0,0,0,0.08); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .feature-icon svg { width: 18px; height: 18px; }
  .feature-text { font-size: 0.9375rem; color: #27272a; }
  .left-footer { margin-top: auto; padding-top: 2rem; }
  .left-footer-line { height: 1px; background: rgba(0,0,0,0.05); margin-bottom: 0.5rem; }
  .left-footer-links { display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap; }
  .left-footer-links a { font-size: 0.8125rem; color: #52525b; text-decoration: none; }
  .left-footer-links a:hover { color: #3a3a8c; }
  .left-footer-links .sep { font-size: 0.75rem; color: #71717a; }

  /* right panel */
  .right { padding: 2rem 2.5rem; display: flex; flex-direction: column; justify-content: center; min-height: 26rem; }
  @media (min-width: 640px) { .right { padding: 2.5rem 3rem; } }
  .right-inner { max-width: 28rem; width: 100%; margin: 0 auto; display: flex; flex-direction: column; gap: 2rem; }

  /* social buttons */
  .social-group { display: flex; flex-direction: column; gap: 0.75rem; }
  .social-btn {
    position: relative; display: flex; align-items: center; justify-content: center; gap: 0.625rem;
    width: 100%; height: 2.5rem; padding: 0 0.75rem;
    border-radius: 6px; background: #F5F6F7; color: #27272a;
    font-weight: 500; font-size: 0.875rem; font-family: inherit;
    border: 1px solid #E5E7EB; cursor: pointer; transition: background 120ms;
  }
  .social-btn:hover { background: #ECEDF0; }
  .social-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .social-btn img { width: 20px; height: 20px; }
  .last-used-badge {
    position: absolute; top: 0; right: -0.75rem; transform: translateY(-50%);
    background: #3a3a8c; color: #fff; border: 1px solid #2e2e70;
    padding: 0.1rem 0.4rem; border-radius: 4px; font-size: 0.625rem; font-weight: 600;
    pointer-events: none; white-space: nowrap;
  }

  /* divider */
  .divider { display: flex; align-items: center; gap: 0.75rem; }
  .divider-line { height: 1px; flex: 1; background: #E5E7EB; }
  .divider-text { font-size: 0.6875rem; color: #71717a; text-transform: uppercase; letter-spacing: 0.05em; white-space: nowrap; }

  /* form */
  .form-group { display: flex; flex-direction: column; gap: 1rem; }
  .field-wrap { display: flex; flex-direction: column; gap: 0.375rem; }
  .field-label { font-size: 0.8125rem; font-weight: 500; color: #52525b; }
  .field {
    width: 100%; height: 2.5rem; padding: 0 0.75rem;
    border-radius: 6px; border: 1px solid #E5E7EB; background: #fff;
    font-size: 0.875rem; color: #27272a; font-family: inherit;
    outline: none; transition: border-color 120ms;
  }
  .field:focus { border-color: #3a3a8c; box-shadow: 0 0 0 3px rgba(58,58,140,0.12); }
  .primary-btn {
    width: 100%; height: 2.5rem; padding: 0 0.75rem;
    border-radius: 6px; background: #3a3a8c; color: #fff;
    font-weight: 600; font-size: 0.875rem; font-family: inherit;
    border: none; cursor: pointer; transition: background 120ms;
  }
  .primary-btn:hover { background: #2e2e70; }
  .primary-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  /* misc */
  .error-text { font-size: 0.75rem; color: #ef4444; margin-top: 0.25rem; }
  .hidden { display: none !important; }
  .helper-text { font-size: 0.75rem; color: #71717a; }
  .legal { font-size: 0.75rem; color: #71717a; text-align: center; line-height: 1.5; }
  .legal a { color: #3a3a8c; text-decoration: none; }
  .legal a:hover { color: #2e2e70; }
  .page-title { font-size: 1.125rem; font-weight: 600; color: #18181b; text-align: center; }
</style>
`;

const FEATURES = [
  {
    color: "#15a0a2",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>`,
    text: "Petascale ingestion",
  },
  {
    color: "#7C3AED",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a10 10 0 1 0 10 10"/><path d="M12 6v6l4 2"/></svg>`,
    text: "Natural language interface",
  },
  {
    color: "#22C55E",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>`,
    text: "Native OpenTelemetry support",
  },
  {
    color: "#F59E0B",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
    text: "Blazing fast query engine",
  },
  {
    color: "#6E6EBA",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>`,
    text: "Up to 90% compression",
  },
];

function leftPanel(): string {
  const featureItems = FEATURES.map(
    (f) => `
    <div class="feature">
      <div class="feature-icon"><svg viewBox="0 0 24 24" fill="none" stroke="${f.color}" stroke-width="2" width="18" height="18">${f.icon.replace(/<svg[^>]*>/, "").replace("</svg>", "")}</svg></div>
      <span class="feature-text">${f.text}</span>
    </div>`,
  ).join("");

  return `<div class="left">
  <a class="left-logo" href="https://www.parseable.com" target="_blank" rel="noopener noreferrer" aria-label="Parseable">
    <svg width="160" height="40" viewBox="0 0 600 120" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="10" width="60" height="60" rx="8" fill="#3a3a8c"/>
      <rect x="12" y="22" width="36" height="36" rx="5" fill="#E8EBFF"/>
      <rect x="24" y="34" width="12" height="12" rx="2" fill="#3a3a8c"/>
      <text x="75" y="63" font-family="Inter,sans-serif" font-weight="700" font-size="46" fill="#18181b">parseable</text>
    </svg>
  </a>
  <div class="left-headline">
    <span class="h1">Observability</span>
    <span class="h1-blue">Simplified.</span>
  </div>
  <p class="left-sub">AI Native observability datalake.</p>
  <div class="features">${featureItems}</div>
  <div class="left-footer">
    <div class="left-footer-line"></div>
    <div class="left-footer-links">
      <a href="https://www.parseable.com/docs/" target="_blank">Documentation</a>
      <span class="sep">|</span>
      <a href="https://logg.ing/quick-chat" target="_blank">Help</a>
      <span class="sep">|</span>
      <a href="https://www.parseable.com/policy/" target="_blank">Privacy</a>
    </div>
  </div>
</div>`;
}

const LINKEDIN_SVG = `<svg width="20" height="20" viewBox="0 0 24 24" fill="#0A66C2"><path d="M20.452 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.357V9h3.414v1.561h.046c.477-.9 1.637-1.852 3.37-1.852 3.601 0 4.268 2.37 4.268 5.456v6.287zM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124zM7.119 20.452H3.554V9H7.12v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.226.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>`;
const GOOGLE_SVG = `<svg width="20" height="20" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/><path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/><path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/><path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/></svg>`;
const GITHUB_SVG = `<svg width="20" height="20" viewBox="0 0 24 24" fill="#24292F"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>`;

export function renderLoginPage(opts: {
  publishableKey: string;
  flowToken: string;
  publicBaseUrl: string;
}): string {
  const flowToken = esc(opts.flowToken);
  const pk = esc(opts.publishableKey);
  const base = opts.publicBaseUrl.replace(/\/+$/, "");
  const ssoCallback = esc(`${base}/sso-callback`);
  const postAuth = esc(`${base}/post-auth`);

  return `<!doctype html>
<html lang="en">
<head>${HEAD}<title>Sign in to Parseable</title></head>
<body>
<div class="card">
  ${leftPanel()}
  <div class="right">
    <div class="right-inner">
      <p class="page-title">Log in to your account</p>

      <div class="social-group">
        <div style="position:relative;width:100%">
          <button id="btn-linkedin" class="social-btn" disabled>${LINKEDIN_SVG} Continue with LinkedIn
            <span class="last-used-badge hidden" id="last-used-linkedin">Last used</span>
          </button>
        </div>
        <div style="position:relative;width:100%">
          <button id="btn-google" class="social-btn" disabled>${GOOGLE_SVG} Continue with Google
            <span class="last-used-badge hidden" id="last-used-google">Last used</span>
          </button>
        </div>
        <div style="position:relative;width:100%">
          <button id="btn-github" class="social-btn" disabled>${GITHUB_SVG} Continue with GitHub
            <span class="last-used-badge hidden" id="last-used-github">Last used</span>
          </button>
        </div>
      </div>

      <div class="divider">
        <div class="divider-line"></div>
        <span class="divider-text">OR WITH EMAIL</span>
        <div class="divider-line"></div>
      </div>

      <form id="email-form" class="form-group">
        <div class="field-wrap">
          <label class="field-label" for="email">Email address</label>
          <input class="field" type="email" id="email" name="email" placeholder="you@company.com" required autocomplete="email" />
        </div>
        <div class="field-wrap">
          <label class="field-label" for="password">Password</label>
          <input class="field" type="password" id="password" name="password" placeholder="••••••••" required autocomplete="current-password" />
        </div>
        <button type="submit" id="email-submit" class="primary-btn" disabled>Continue with email</button>
        <p id="email-error" class="error-text hidden"></p>
      </form>

      <div id="code-form-wrap" class="hidden form-group">
        <p class="helper-text">We sent a verification code to your email.</p>
        <form id="code-form" style="display:flex;gap:0.5rem">
          <input class="field" type="text" id="code" name="code" placeholder="Verification code" required inputmode="numeric" style="flex:1" />
          <button type="submit" class="primary-btn" style="width:auto;white-space:nowrap;padding:0 1rem">Verify</button>
        </form>
      </div>

      <p class="legal">
        By signing in I agree to the
        <a href="https://www.parseable.com/csa" target="_blank" rel="noopener noreferrer">Cloud Service Agreement</a>,
        <a href="https://www.parseable.com/tos" target="_blank" rel="noopener noreferrer">Terms of Service</a>,
        <a href="https://www.parseable.com/dpa" target="_blank" rel="noopener noreferrer">Data Processing Terms</a>.
      </p>
    </div>
  </div>
</div>

<script>
  try { sessionStorage.setItem("parseable_mcp_flow_token", "${flowToken}"); } catch (e) {}
  window.__CLERK_PUBLISHABLE_KEY = "${pk}";
  window.__SSO_CALLBACK = "${ssoCallback}";
  window.__POST_AUTH = "${postAuth}";
</script>
<script src="https://cdn.jsdelivr.net/npm/@clerk/clerk-js@5/dist/clerk.browser.js" data-clerk-publishable-key="${pk}" async crossorigin="anonymous"></script>
<script>
  function showError(msg) {
    var el = document.getElementById("email-error");
    el.textContent = msg; el.classList.remove("hidden");
  }
  function clearError() {
    var el = document.getElementById("email-error");
    el.textContent = ""; el.classList.add("hidden");
  }
  function disableButtons(disabled) {
    ["btn-linkedin","btn-google","btn-github","email-submit"].forEach(function(id){
      var el = document.getElementById(id); if (el) el.disabled = disabled;
    });
  }
  function markLastUsed(clerk) {
    try {
      var strategy = clerk.client && clerk.client.lastAuthenticationStrategy;
      if (!strategy || strategy.indexOf("oauth_") !== 0) return;
      var map = {"oauth_linkedin_oidc":"linkedin","oauth_google":"google","oauth_github":"github"};
      var key = map[strategy];
      if (key) { var el = document.getElementById("last-used-"+key); if (el) el.classList.remove("hidden"); }
    } catch (e) {}
  }
  function waitForClerk(cb) {
    if (window.Clerk) cb(window.Clerk); else setTimeout(function(){ waitForClerk(cb); }, 50);
  }
  function startSocial(clerk, provider) {
    clerk.client.signIn.authenticateWithRedirect({
      strategy: provider, redirectUrl: window.__SSO_CALLBACK, redirectUrlComplete: window.__POST_AUTH,
    }).catch(function(err){ showError(err && err.message ? err.message : "Sign-in failed"); });
  }
  waitForClerk(function(clerk){
    clerk.load({
      publishableKey: window.__CLERK_PUBLISHABLE_KEY,
      signInUrl: "/login", signUpUrl: "/login",
      signInForceRedirectUrl: window.__POST_AUTH, signUpForceRedirectUrl: window.__POST_AUTH,
      signInFallbackRedirectUrl: window.__POST_AUTH, signUpFallbackRedirectUrl: window.__POST_AUTH,
    }).then(function(){
      disableButtons(false);
      markLastUsed(clerk);
      document.getElementById("btn-linkedin").addEventListener("click", function(){ startSocial(clerk, "oauth_linkedin_oidc"); });
      document.getElementById("btn-google").addEventListener("click", function(){ startSocial(clerk, "oauth_google"); });
      document.getElementById("btn-github").addEventListener("click", function(){ startSocial(clerk, "oauth_github"); });

      var lastEmailCodeAddressId = null;
      document.getElementById("email-form").addEventListener("submit", async function(e){
        e.preventDefault(); clearError(); disableButtons(true);
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
              window.location.href = window.__POST_AUTH; return;
            }
            showError("Could not complete sign in."); disableButtons(false); return;
          }
          var emailCode = factors.find(function(f){ return f && f.strategy === "email_code" && f.emailAddressId; });
          if (!emailCode) {
            showError("This account cannot sign in with password. Use the original sign-in method.");
            disableButtons(false); return;
          }
          lastEmailCodeAddressId = emailCode.emailAddressId;
          await si.prepareFirstFactor({ strategy: "email_code", emailAddressId: emailCode.emailAddressId });
          document.getElementById("code-form-wrap").classList.remove("hidden");
          disableButtons(false);
        } catch (err) {
          showError(err && err.message ? err.message : "Sign in failed"); disableButtons(false);
        }
      });
      document.getElementById("code-form").addEventListener("submit", async function(e){
        e.preventDefault(); clearError();
        var code = document.getElementById("code").value.trim();
        try {
          var attempt = await clerk.client.signIn.attemptFirstFactor({ strategy: "email_code", code: code });
          if (attempt.status === "complete") {
            await clerk.setActive({ session: attempt.createdSessionId });
            window.location.href = window.__POST_AUTH; return;
          }
          showError("Verification failed.");
        } catch (err) { showError(err && err.message ? err.message : "Verification failed"); }
      });
    });
  });
  disableButtons(true);
</script>
</body>
</html>`;
}

export function renderSsoCallbackPage(opts: {
  publishableKey: string;
  publicBaseUrl: string;
}): string {
  const pk = esc(opts.publishableKey);
  const postAuth = esc(`${opts.publicBaseUrl.replace(/\/+$/, "")}/post-auth`);
  return `<!doctype html>
<html lang="en">
<head>${HEAD}<title>Signing you in…</title></head>
<body>
<div class="card" style="max-width:36rem;min-height:auto">
  <div class="right" style="min-height:12rem;align-items:center">
    <div style="text-align:center;display:flex;flex-direction:column;gap:1rem;align-items:center">
      <div style="width:40px;height:40px;border-radius:50%;border:3px solid #3a3a8c;border-top-color:transparent;animation:spin 0.8s linear infinite"></div>
      <p style="color:#52525b;font-size:0.9375rem">Signing you in…</p>
    </div>
  </div>
</div>
<style>@keyframes spin{to{transform:rotate(360deg)}}</style>
<script src="https://cdn.jsdelivr.net/npm/@clerk/clerk-js@5/dist/clerk.browser.js" data-clerk-publishable-key="${pk}" async crossorigin="anonymous"></script>
<script>
  function waitForClerk(cb){ if(window.Clerk) cb(window.Clerk); else setTimeout(function(){waitForClerk(cb);},50); }
  waitForClerk(function(clerk){
    clerk.load({
      publishableKey: "${pk}", signInUrl: "/login", signUpUrl: "/login",
      signInForceRedirectUrl: "${postAuth}", signUpForceRedirectUrl: "${postAuth}",
      signInFallbackRedirectUrl: "${postAuth}", signUpFallbackRedirectUrl: "${postAuth}",
    }).then(function(){
      Promise.resolve(clerk.handleRedirectCallback({ redirectUrl: "${postAuth}" }))
        .catch(function(err){ console.error("handleRedirectCallback:", err); })
        .finally(function(){ window.location.replace("${postAuth}"); });
    });
  });
</script>
</body></html>`;
}

export function renderPostAuthPage(opts: {
  publishableKey: string;
  publicBaseUrl: string;
}): string {
  const pk = esc(opts.publishableKey);
  const callback = esc(`${opts.publicBaseUrl.replace(/\/+$/, "")}/oauth/callback`);
  return `<!doctype html>
<html lang="en">
<head>${HEAD}<title>Finishing sign-in…</title></head>
<body>
<div class="card" style="max-width:36rem;min-height:auto">
  <div class="right" style="min-height:12rem;align-items:center">
    <div style="text-align:center;display:flex;flex-direction:column;gap:1rem;align-items:center">
      <div style="width:40px;height:40px;border-radius:50%;border:3px solid #3a3a8c;border-top-color:transparent;animation:spin 0.8s linear infinite"></div>
      <p style="color:#52525b;font-size:0.9375rem">Finishing sign-in…</p>
    </div>
  </div>
</div>
<style>@keyframes spin{to{transform:rotate(360deg)}}</style>
<script src="https://cdn.jsdelivr.net/npm/@clerk/clerk-js@5/dist/clerk.browser.js" data-clerk-publishable-key="${pk}" async crossorigin="anonymous"></script>
<script>
  function waitForClerk(cb){ if(window.Clerk) cb(window.Clerk); else setTimeout(function(){waitForClerk(cb);},50); }
  function go() {
    try {
      var token = sessionStorage.getItem("parseable_mcp_flow_token");
      if (!token) {
        document.body.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;min-height:100vh"><div style="background:#fff;border-radius:12px;padding:2rem;text-align:center;max-width:24rem"><p style="color:#ef4444;font-size:0.875rem">Missing flow_token - restart the connector from Claude.</p></div></div>';
        return;
      }
      window.location.replace("${callback}?flow_token=" + encodeURIComponent(token));
    } catch (e) {
      document.body.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;min-height:100vh"><pre style="color:#ef4444;padding:1rem">' + e.message + '</pre></div>';
    }
  }
  waitForClerk(function(clerk){
    clerk.load({ publishableKey: "${pk}", signInUrl: "/login" })
      .then(function(){
        var tries = 0;
        function check(){ tries++; if (clerk.session || tries > 40) { go(); return; } setTimeout(check, 100); }
        check();
      })
      .catch(function(err){ console.error("clerk.load:", err); go(); });
  });
</script>
</body></html>`;
}
