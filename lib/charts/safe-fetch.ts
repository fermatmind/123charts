import dns from "node:dns/promises";
import http from "node:http";
import https from "node:https";
import { BlockList, isIP } from "node:net";
const blocked = new BlockList();
for (const [ip, bits] of [
  ["0.0.0.0", 8],
  ["10.0.0.0", 8],
  ["127.0.0.0", 8],
  ["169.254.0.0", 16],
  ["172.16.0.0", 12],
  ["192.168.0.0", 16],
  ["100.64.0.0", 10],
  ["192.0.0.0", 24],
  ["192.0.2.0", 24],
  ["198.18.0.0", 15],
  ["198.51.100.0", 24],
  ["203.0.113.0", 24],
  ["224.0.0.0", 4],
  ["240.0.0.0", 4],
] as [string, number][])
  blocked.addSubnet(ip, bits, "ipv4");
export function publicAddress(ip: string) {
  if (isIP(ip) === 4) return !blocked.check(ip, "ipv4");
  if (isIP(ip) !== 6) return false;
  const x = ip.toLowerCase();
  return /^[23]/.test(x) && !/^(2001:(?:0:|0000:|0?db8:)|2002:)/.test(x);
}
type Address = { address: string; family: number };
function checkedAddresses(addresses: Address[]): Address[] {
  if (!addresses.length || addresses.some((a) => !publicAddress(a.address)))
    throw new Error("Private or reserved network destinations are blocked.");
  return addresses;
}
const proxyDNS = new BlockList();
proxyDNS.addSubnet("198.18.0.0", 15, "ipv4");

// The resolver itself has a fixed public IP and retains hostname/SNI TLS checks.
// Never connect to the proxy's synthetic benchmark addresses or delegate target
// resolution to an HTTP proxy: the final website socket stays IP-pinned below.
async function publicDNS(hostname: string, type: 1 | 28): Promise<Address[]> {
  const url = new URL("https://dns.google/resolve");
  url.search = new URLSearchParams({
    name: hostname,
    type: String(type),
    edns_client_subnet: "0.0.0.0/0",
  }).toString();
  const answer = await new Promise<any>((resolve, reject) => {
    const req = https.get(
      url,
      {
        headers: { Accept: "application/dns-json" },
        lookup: ((_host: unknown, options: any, cb: any) =>
          options?.all
            ? cb(null, [{ address: "8.8.8.8", family: 4 }])
            : cb(null, "8.8.8.8", 4)) as any,
      },
      (response) => {
        // Resolver redirects are never followed, even if they appear public.
        if (
          response.statusCode !== 200 ||
          !response.headers["content-type"]?.includes("json")
        ) {
          response.resume();
          return reject(new Error("Public DNS did not return a JSON answer."));
        }
        const chunks: Buffer[] = [];
        let bytes = 0;
        response.on("data", (chunk: Buffer) => {
          bytes += chunk.length;
          if (bytes > 65536) {
            const error = new Error("Public DNS response exceeds 64 KB.");
            reject(error);
            req.destroy(error);
          } else chunks.push(chunk);
        });
        response.on("error", reject);
        response.on("aborted", () =>
          reject(new Error("Public DNS response was interrupted.")),
        );
        response.on("end", () => {
          try {
            resolve(JSON.parse(Buffer.concat(chunks).toString("utf8")));
          } catch {
            reject(new Error("Invalid public DNS response."));
          }
        });
      },
    );
    req.setTimeout(8000, () =>
      req.destroy(new Error("Public DNS lookup timed out.")),
    );
    req.on("error", reject);
  });
  const question = answer?.Question?.[0];
  if (
    answer?.Status !== 0 ||
    answer.TC ||
    question?.type !== type ||
    question?.name?.replace(/\.$/, "").toLowerCase() !==
      hostname.replace(/\.$/, "").toLowerCase() ||
    (answer.Answer !== undefined && !Array.isArray(answer.Answer))
  )
    throw new Error("Public DNS could not resolve this website.");
  return (answer.Answer || [])
    .filter((a: any) => a.type === type)
    .map((a: any) => {
      const family = type === 1 ? 4 : 6;
      if (typeof a.data !== "string" || isIP(a.data) !== family)
        throw new Error("Invalid public DNS address.");
      return { address: a.data, family };
    });
}
export async function metadataAddresses(hostname: string): Promise<Address[]> {
  if (isIP(hostname))
    return checkedAddresses([{ address: hostname, family: isIP(hostname) }]);
  let dnsTimer: ReturnType<typeof setTimeout> | undefined;
  const addresses = await Promise.race([
    dns.lookup(hostname, { all: true }),
    new Promise<Address[]>((_, reject) => {
      dnsTimer = setTimeout(
        () => reject(new Error("Website DNS lookup timed out.")),
        8000,
      );
    }),
  ]).finally(() => {
    if (dnsTimer) clearTimeout(dnsTimer);
  });
  // Only the benchmark-only proxy result gets a second resolution. Private,
  // mixed public/private and mapped IPv6 answers still fail closed immediately.
  if (
    addresses.length &&
    addresses.every((a) => a.family === 4 && proxyDNS.check(a.address, "ipv4"))
  ) {
    const resolved = await Promise.all([
      publicDNS(hostname, 1),
      publicDNS(hostname, 28),
    ]);
    return checkedAddresses(resolved.flat());
  }
  return checkedAddresses(addresses);
}
export async function safeHtml(
  raw: string,
  redirects = 0,
): Promise<{ html: string; url: string }> {
  if (redirects > 3) throw new Error("Too many redirects.");
  const url = new URL(raw);
  if (
    !["https:", "http:"].includes(url.protocol) ||
    url.username ||
    url.password ||
    url.port ||
    url.hostname === "localhost"
  )
    throw new Error("Unsupported website URL.");
  const hostname = url.hostname.replace(/^\[|\]$/g, "");
  const addresses = await metadataAddresses(hostname);
  const address = addresses[0];
  return new Promise((resolve, reject) => {
    const req = (url.protocol === "https:" ? https : http).get(
      url,
      {
        headers: {
          "User-Agent": "123Charts-Metadata/1.0",
          Accept: "text/html",
        },
        lookup: ((_host: unknown, options: any, cb: any) =>
          options?.all
            ? cb(null, [address])
            : cb(null, address.address, address.family)) as any,
      },
      (response) => {
        if (
          response.statusCode &&
          [301, 302, 303, 307, 308].includes(response.statusCode)
        ) {
          response.resume();
          if (!response.headers.location)
            return reject(new Error("Redirect without location."));
          safeHtml(
            new URL(response.headers.location, url).toString(),
            redirects + 1,
          ).then(resolve, reject);
          return;
        }
        if (!response.statusCode || response.statusCode >= 400) {
          response.resume();
          return reject(
            new Error(
              `Website returned HTTP ${response.statusCode}; review manually.`,
            ),
          );
        }
        if (!response.headers["content-type"]?.includes("text/html")) {
          response.resume();
          return reject(new Error("The website did not return HTML."));
        }
        let bytes = 0;
        const chunks: Buffer[] = [];
        response.on("data", (chunk) => {
          bytes += chunk.length;
          if (bytes > 524288) {
            const error = new Error("Website response exceeds 512 KB.");
            reject(error);
            req.destroy(error);
          } else chunks.push(chunk);
        });
        response.on("end", () =>
          resolve({
            html: Buffer.concat(chunks).toString("utf8"),
            url: url.toString(),
          }),
        );
        response.on("error", reject);
        response.on("aborted", () =>
          reject(new Error("Website response was interrupted.")),
        );
      },
    );
    req.setTimeout(8000, () =>
      req.destroy(
        new Error("Website lookup timed out; manual entry is available."),
      ),
    );
    req.on("error", reject);
  });
}
export function extractMetadata(html: string) {
  const clean = (s: string) =>
    s
      .replace(/<[^>]*>/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, " ")
      .trim();
  const readable = html.replace(
    /<!--[\s\S]*?-->|<(script|style|noscript|template)\b[^>]*>[\s\S]*?<\/\1\s*>/gi,
    "",
  );
  const title = clean(
    readable.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "",
  ).slice(0, 200);
  const tags = readable.match(/<meta\b[^>]*>/gi) ?? [];
  let description = "";
  for (const tag of tags)
    if (
      /(?:name|property)\s*=\s*["'](?:description|og:description)["']/i.test(
        tag,
      )
    ) {
      description = clean(
        tag.match(/content\s*=\s*["']([^"']*)["']/i)?.[1] ?? "",
      );
      if (description) break;
    }
  const fromMeta = !!description;
  if (!description) {
    // Some sites (including Aider) omit description meta tags. Use only an
    // actual introductory paragraph after H1; never invent missing content.
    const intro = readable
      .split(/<\/h1\s*>/i)[1]
      ?.split(/<(?:h[1-6]|footer|nav)\b/i)[0];
    description = clean(intro?.match(/<p\b[^>]*>([\s\S]*?)<\/p>/i)?.[1] || "");
  }
  return {
    name: title.split(/\s[|—–-]\s/)[0],
    description: description.slice(0, 1000),
    description_source: fromMeta
      ? "meta"
      : description
        ? "page_intro"
        : "missing",
  };
}
