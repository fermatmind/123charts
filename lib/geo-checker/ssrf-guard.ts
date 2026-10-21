import { isIP } from "node:net";

const BLOCKED_HOSTS = new Set([
  "localhost",
  "0.0.0.0",
  "127.0.0.1",
  "::1",
]);

export type SsrfGuardResult = {
  ok: true;
  normalized_url: string;
} | {
  ok: false;
  error: string;
  status: number;
};

export function ssrfGuard(rawUrl: string): SsrfGuardResult {
  const urlStr = rawUrl.trim();

  let parsed: URL;
  try {
    parsed = new URL(urlStr);
  } catch {
    return { ok: false, error: "Invalid URL format.", status: 400 };
  }

  // Scheme check
  if (parsed.protocol !== "https:") {
    return { ok: false, error: "Only https:// URLs are accepted.", status: 400 };
  }

  // Reject credentials in URL before any network fetch.
  if (parsed.username || parsed.password) {
    return { ok: false, error: "URLs with credentials are not accepted.", status: 400 };
  }

  // Port check
  if (parsed.port && parsed.port !== "443") {
    return { ok: false, error: "Only default HTTPS port (443) is accepted.", status: 400 };
  }

  const hostname = normalizeHostname(parsed.hostname);

  // Blocked hostnames
  if (BLOCKED_HOSTS.has(hostname)) {
    return { ok: false, error: "This URL cannot be checked.", status: 400 };
  }

  if (
    hostname.endsWith(".localhost") ||
    hostname.endsWith(".local") ||
    hostname.endsWith(".internal") ||
    hostname === "test" ||
    hostname.endsWith(".test") ||
    hostname.endsWith(".example") ||
    hostname.endsWith(".invalid")
  ) {
    return { ok: false, error: "This URL cannot be checked.", status: 400 };
  }

  // IP literal check
  if (isIP(hostname)) {
    const ip = hostname;
    if (isPrivateOrReservedIP(ip)) {
      return { ok: false, error: "This URL cannot be checked.", status: 400 };
    }
  }

  // Remove hash and query for privacy
  parsed.hash = "";
  parsed.search = "";

  const normalized = parsed.toString().replace(/\/$/, "") || parsed.origin;

  return { ok: true, normalized_url: normalized };
}

function normalizeHostname(hostname: string): string {
  return hostname.toLowerCase().replace(/^\[|\]$/g, "");
}

function isPrivateOrReservedIP(ip: string): boolean {
  // IPv4 private/reserved ranges
  const ipv4Patterns = [
    /^10\./,                         // 10.0.0.0/8
    /^172\.(1[6-9]|2\d|3[01])\./,   // 172.16.0.0/12
    /^192\.168\./,                   // 192.168.0.0/16
    /^127\./,                        // 127.0.0.0/8
    /^169\.254\./,                   // 169.254.0.0/16
    /^100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\./, // 100.64.0.0/10
    /^0\./,                          // 0.0.0.0/8
    /^22[4-9]\./,                    // 224.0.0.0/4 multicast
    /^2[3-5]\d\./,                   // 224-255.x.x.x
  ];
  for (const p of ipv4Patterns) {
    if (p.test(ip)) return true;
  }

  // IPv6
  if (ip === "::1") return true;
  if (ip === "::") return true;
  if (ip.startsWith("fc") || ip.startsWith("fd")) return true; // fc00::/7
  if (ip.startsWith("fe80")) return true; // fe80::/10
  if (ip.startsWith("ff")) return true;    // multicast

  return false;
}
