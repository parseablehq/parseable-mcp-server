import { createClerkClient, verifyToken } from "@clerk/backend";

let cachedClient: ReturnType<typeof createClerkClient> | null = null;

export interface ClerkConfig {
  publishableKey: string;
  secretKey: string;
}

// Parseable Cloud staging Clerk app — publishable + secret keys.
// pk_test_* is designed to be public.
// sk_test_* is a staging secret. MUST be removed before any public/OSS release.
// Set CLERK_PUBLISHABLE_KEY / CLERK_SECRET_KEY env vars to override.
const DEFAULT_PUBLISHABLE_KEY = "pk_test_bW92ZWQtcGlyYW5oYS02My5jbGVyay5hY2NvdW50cy5kZXYk";
const DEFAULT_SECRET_KEY = "sk_test_mkyU3i8UHIFoQyHKO4cNxNpQ2io90UaLnkvSepnt7c";

let warnedSecretFallback = false;

export function getClerkConfig(): ClerkConfig {
  const publishableKey = process.env.CLERK_PUBLISHABLE_KEY ?? DEFAULT_PUBLISHABLE_KEY;
  const secretKey = process.env.CLERK_SECRET_KEY ?? DEFAULT_SECRET_KEY;
  if (secretKey === DEFAULT_SECRET_KEY && !warnedSecretFallback) {
    warnedSecretFallback = true;
    console.error(
      "[parseable-mcp] WARNING: using embedded staging CLERK_SECRET_KEY. Set CLERK_SECRET_KEY env var for production.",
    );
  }
  return { publishableKey, secretKey };
}

export function getClerkClient(): ReturnType<typeof createClerkClient> {
  if (cachedClient) return cachedClient;
  const cfg = getClerkConfig();
  cachedClient = createClerkClient({
    publishableKey: cfg.publishableKey,
    secretKey: cfg.secretKey,
  });
  return cachedClient;
}

export interface ClerkSession {
  userId: string;
  sessionId: string;
}

/**
 * Verify a Clerk session token (JWT from Clerk) and return user + session IDs.
 * Used in /oauth/callback to confirm the incoming request belongs to a logged-in user.
 */
export async function verifyClerkSessionJwt(jwt: string): Promise<ClerkSession> {
  const cfg = getClerkConfig();
  const payload = await verifyToken(jwt, {
    secretKey: cfg.secretKey,
    // Tolerate small clock skew between this host and Clerk's auth server.
    clockSkewInMs: 60_000,
  });
  if (!payload.sub || !payload.sid) {
    throw new Error("Clerk session JWT missing sub or sid");
  }
  return { userId: payload.sub, sessionId: payload.sid as string };
}

/**
 * Mint a fresh Clerk session JWT server-side from a known session ID.
 * Used per /mcp request to forward an unexpired token to the user's Parseable instance.
 */
export async function mintClerkSessionToken(sessionId: string): Promise<string> {
  const client = getClerkClient();
  const result = await client.sessions.getToken(sessionId, "");
  return result.jwt;
}
