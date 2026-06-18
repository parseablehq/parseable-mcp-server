import { createClerkClient, verifyToken } from "@clerk/backend";

let cachedClient: ReturnType<typeof createClerkClient> | null = null;

export interface ClerkConfig {
  publishableKey: string;
  secretKey: string;
}

export function getClerkConfig(): ClerkConfig {
  const publishableKey = process.env.CLERK_PUBLISHABLE_KEY;
  const secretKey = process.env.CLERK_SECRET_KEY;

  if (!publishableKey?.startsWith("pk_")) {
    throw new Error(
      "CLERK_PUBLISHABLE_KEY env var required (must start with pk_). " +
        "Find it in Clerk Dashboard → API Keys.",
    );
  }
  if (!secretKey?.startsWith("sk_")) {
    throw new Error(
      "CLERK_SECRET_KEY env var required (must start with sk_). " +
        "Find it in Clerk Dashboard → API Keys.",
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
