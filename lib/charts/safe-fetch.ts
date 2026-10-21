import { lookup } from "node:dns/promises";
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
  let dnsTimer: ReturnType<typeof setTimeout> | undefined;
  const addresses = (await Promise.race([
    lookup(url.hostname, { all: true }),
    new Promise<Awaited<ReturnType<typeof lookup>>>((_, reject) => {
      dnsTimer = setTimeout(
        () => reject(new Error("Website DNS lookup timed out.")),
        8000,
      );
    }),
  ]).finally(() => {
    if (dnsTimer) clearTimeout(dnsTimer);
  })) as { address: string; family: number }[];
  if (!addresses.length || addresses.some((a) => !publicAddress(a.address)))
    throw new Error("Private or reserved network destinations are blocked.");
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
            req.destroy(new Error("Website response exceeds 512 KB."));
          } else chunks.push(chunk);
        });
        response.on("end", () =>
          resolve({
            html: Buffer.concat(chunks).toString("utf8"),
            url: url.toString(),
          }),
        );
        response.on("error", reject);
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
  const title = clean(
    html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "",
  ).slice(0, 200);
  const tags = html.match(/<meta\b[^>]*>/gi) ?? [];
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
  return {
    name: title.split(/\s[|—–]\s/)[0],
    description: description.slice(0, 1000),
  };
}
