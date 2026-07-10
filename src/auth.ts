import { isIP } from "node:net";

export interface RequestCreds {
  url: string;
  apiKey: string;
}

export class AuthError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "AuthError";
  }
}

function header(
  headers: Headers | Record<string, string | string[] | undefined>,
  name: string,
): string | undefined {
  if (headers instanceof Headers) {
    return headers.get(name) ?? undefined;
  }
  const v = headers[name.toLowerCase()] ?? headers[name];
  if (Array.isArray(v)) return v[0];
  return v;
}

export function parseAuthHeaders(
  headers: Headers | Record<string, string | string[] | undefined>,
): RequestCreds {
  const url = header(headers, "X-Parseable-URL");
  const apiKey = header(headers, "X-API-Key");

  const missing: string[] = [];
  if (!url) missing.push("X-Parseable-URL");
  if (!apiKey) missing.push("X-API-Key");

  if (missing.length) {
    throw new AuthError(
      401,
      `Missing required header(s): ${missing.join(", ")}. Set X-Parseable-URL and X-API-Key on your MCP connector.`,
    );
  }

  let parsed: URL;
  try {
    parsed = new URL(url as string);
  } catch {
    throw new AuthError(400, `Invalid X-Parseable-URL: not a valid URL.`);
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new AuthError(400, `X-Parseable-URL must use http:// or https://`);
  }

  return {
    url: (url as string).replace(/\/+$/, ""),
    apiKey: apiKey as string,
  };
}

const PRIVATE_IPV4_RANGES: ReadonlyArray<readonly [bigint, bigint]> = [
  // 10.0.0.0/8
  [ipv4ToBigInt("10.0.0.0"), ipv4ToBigInt("10.255.255.255")],
  // 127.0.0.0/8
  [ipv4ToBigInt("127.0.0.0"), ipv4ToBigInt("127.255.255.255")],
  // 169.254.0.0/16 (link-local)
  [ipv4ToBigInt("169.254.0.0"), ipv4ToBigInt("169.254.255.255")],
  // 172.16.0.0/12
  [ipv4ToBigInt("172.16.0.0"), ipv4ToBigInt("172.31.255.255")],
  // 192.168.0.0/16
  [ipv4ToBigInt("192.168.0.0"), ipv4ToBigInt("192.168.255.255")],
  // 0.0.0.0/8
  [ipv4ToBigInt("0.0.0.0"), ipv4ToBigInt("0.255.255.255")],
];

function ipv4ToBigInt(ip: string): bigint {
  const [a, b, c, d] = ip.split(".").map((p) => Number.parseInt(p, 10));
  return (BigInt(a) << 24n) | (BigInt(b) << 16n) | (BigInt(c) << 8n) | BigInt(d);
}

function isPrivateIpv4(ip: string): boolean {
  const v = ipv4ToBigInt(ip);
  return PRIVATE_IPV4_RANGES.some(([lo, hi]) => v >= lo && v <= hi);
}

const PRIVATE_HOSTNAME_SUFFIXES = new Set(["localhost", "local"]);

export function assertNotPrivateUrl(rawUrl: string): void {
  if (process.env.PARSEABLE_MCP_ALLOW_PRIVATE === "true") return;

  const hostname = new URL(rawUrl).hostname.toLowerCase().replace(/^\[|\]$/g, "");

  if (PRIVATE_HOSTNAME_SUFFIXES.has(hostname) || hostname.endsWith(".local")) {
    throw new AuthError(
      400,
      `X-Parseable-URL points to a private hostname (${hostname}). Set PARSEABLE_MCP_ALLOW_PRIVATE=true on the server to allow.`,
    );
  }

  const ipVersion = isIP(hostname);
  if (ipVersion === 4) {
    if (isPrivateIpv4(hostname)) {
      throw new AuthError(
        400,
        `X-Parseable-URL points to a private IPv4 address (${hostname}). Set PARSEABLE_MCP_ALLOW_PRIVATE=true on the server to allow.`,
      );
    }
  } else if (ipVersion === 6) {
    if (
      hostname === "::1" ||
      hostname.startsWith("fc") ||
      hostname.startsWith("fd") ||
      hostname.startsWith("fe80")
    ) {
      throw new AuthError(
        400,
        `X-Parseable-URL points to a private IPv6 address (${hostname}). Set PARSEABLE_MCP_ALLOW_PRIVATE=true on the server to allow.`,
      );
    }
  }
}
