import { jwtVerify, SignJWT } from "jose";

const ALG = "HS256";

let secretKey: Uint8Array | null = null;

function getSecret(): Uint8Array {
  if (secretKey) return secretKey;
  const raw = process.env.MCP_JWT_SECRET;
  if (!raw || raw.length < 32) {
    throw new Error(
      "MCP_JWT_SECRET env var required (>=32 chars). Generate with: openssl rand -base64 48",
    );
  }
  secretKey = new TextEncoder().encode(raw);
  return secretKey;
}

export interface AccessTokenClaims {
  sub: string; // clerk user_id
  sid: string; // clerk session_id
  wid: string; // workspace_id
  url: string; // prism_url
  scope?: string;
}

export interface FlowTokenClaims {
  redirect_uri: string;
  state: string;
  client_id: string;
  code_challenge?: string;
  code_challenge_method?: string;
}

export interface AuthCodeClaims extends AccessTokenClaims {
  redirect_uri: string;
  code_challenge?: string;
  code_challenge_method?: string;
}

export async function signAccessToken(
  claims: AccessTokenClaims,
  ttlSeconds = 3600,
): Promise<string> {
  return await new SignJWT({ ...claims })
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime(`${ttlSeconds}s`)
    .setIssuer("parseable-mcp-server")
    .setAudience("mcp")
    .sign(getSecret());
}

export async function verifyAccessToken(token: string): Promise<AccessTokenClaims> {
  const { payload } = await jwtVerify(token, getSecret(), {
    issuer: "parseable-mcp-server",
    audience: "mcp",
  });
  return payload as unknown as AccessTokenClaims;
}

export async function signFlowToken(claims: FlowTokenClaims): Promise<string> {
  return await new SignJWT({ ...claims })
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime("10m")
    .setIssuer("parseable-mcp-server")
    .setAudience("flow")
    .sign(getSecret());
}

export async function verifyFlowToken(token: string): Promise<FlowTokenClaims> {
  const { payload } = await jwtVerify(token, getSecret(), {
    issuer: "parseable-mcp-server",
    audience: "flow",
  });
  return payload as unknown as FlowTokenClaims;
}

export async function signAuthCode(claims: AuthCodeClaims): Promise<string> {
  return await new SignJWT({ ...claims })
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime("60s")
    .setIssuer("parseable-mcp-server")
    .setAudience("authcode")
    .sign(getSecret());
}

export async function verifyAuthCode(token: string): Promise<AuthCodeClaims> {
  const { payload } = await jwtVerify(token, getSecret(), {
    issuer: "parseable-mcp-server",
    audience: "authcode",
  });
  return payload as unknown as AuthCodeClaims;
}
