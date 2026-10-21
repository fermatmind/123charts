import { createHash } from "node:crypto";
import { isIP } from "node:net";
import { getDomain } from "tldts";
import { z } from "zod";
import type { Draft, Peer, TrafficFields } from "./types";
export const SCOPE = "worldwide-all-devices-domain";
export const categories = [
  "ai-coding",
  "workflow-automation",
  "knowledge-search",
] as const;
export const priceTypes = [
  "free",
  "freemium",
  "trial",
  "paid",
  "unknown",
] as const;
export function normalizeWebsite(input: string, allowDemo = false) {
  const raw = input.trim();
  const url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
  if (
    !["http:", "https:"].includes(url.protocol) ||
    url.username ||
    url.password ||
    url.port
  )
    throw new Error(
      "Use a public HTTP(S) website without credentials or a custom port.",
    );
  const domain = url.hostname
    .toLowerCase()
    .replace(/^www\./, "")
    .replace(/\.$/, "");
  if (
    isIP(domain) ||
    !domain.includes(".") ||
    domain.endsWith(".local") ||
    domain.endsWith(".localhost") ||
    domain === "localhost"
  )
    throw new Error("A public website domain is required.");
  if (!allowDemo && /\.(example|invalid|test|internal|lan|home)$/.test(domain))
    throw new Error(
      "Reserved demonstration domains cannot be submitted as real websites.",
    );
  const identity = getDomain(domain, { allowPrivateDomains: true });
  if (!identity) throw new Error("A registrable public domain is required.");
  if (["github.com", "gitlab.com"].includes(domain) && url.pathname !== "/")
    throw new Error(
      "Repository URLs are supplementary alternatives, not independent peer websites.",
    );
  // A domain alias cannot fill a second peer slot. Subdomain product exceptions require review.

  return { domain, website_url: `https://${domain}`, identity };
}
export function slugify(value: string) {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 70) ||
    `project-${createHash("sha256").update(value).digest("hex").slice(0, 10)}`
  );
}
export const peerSchema = z.object({
  domain: z.string().max(253),
  name: z.string().min(1).max(200),
  task: z.string().max(300),
  rationale: z.string().max(1000),
});
export const draftSchema = z.object({
  name: z.string().max(200),
  slug: z.string().max(80),
  website_url: z.string().max(500),
  domain: z.string().max(253),
  category: z.enum(categories),
  price_type: z.enum(priceTypes),
  description_en: z.string().max(2000),
  description_zh: z.string().max(2000),
  task: z.string().max(300).default(""),
  supported_languages: z.array(z.string().min(2).max(50)).max(30).default([]),
  differentiator: z.string().max(700).default(""),
  conditions: z.string().max(1200).default(""),
  is_open_source: z.boolean().default(false),
  open_source_url: z
    .string()
    .max(500)
    .refine(
      (value) => {
        if (!value) return true;
        try {
          return ["https:", "http:"].includes(new URL(value).protocol);
        } catch {
          return false;
        }
      },
      { message: "Use an HTTP(S) license source URL" },
    )
    .default(""),
  peer_exception_reason: z.string().max(2000).default(""),
  supplementary_alternatives: z.string().max(2000).default(""),
  replace_peer_group: z.boolean().default(false),
  peers: z.array(peerSchema).max(5),
});
export function validatePeers(
  peers: Peer[],
  ownDomain: string,
  complete = true,
  demo = false,
) {
  const normalized = peers.map((p) => ({
    ...p,
    domain: normalizeWebsite(p.domain, demo).domain,
  }));
  if (complete && (normalized.length < 3 || normalized.length > 5))
    throw new Error("Provide three to five relevant peer websites.");
  if (
    new Set(normalized.map((p) => normalizeWebsite(p.domain, demo).identity))
      .size !== normalized.length
  )
    throw new Error(
      "Duplicate domains or aliases cannot count as different peers.",
    );
  if (
    ownDomain &&
    normalized.some(
      (p) =>
        normalizeWebsite(p.domain, demo).identity ===
        normalizeWebsite(ownDomain, demo).identity,
    )
  )
    throw new Error("Your own website cannot count as a peer.");
  return normalized;
}
export function validateSubmission(draft: Draft, demo = false) {
  if (
    !draft.name.trim() ||
    (!draft.description_en.trim() && !draft.description_zh.trim())
  )
    throw new Error("Project name and a factual description are required.");
  if (
    draft.peers.some(
      (p) => p.task.trim().length < 3 || p.rationale.trim().length < 5,
    )
  )
    throw new Error("Explain the common task and relevance for each peer.");
  if (
    !draft.task?.trim() ||
    !draft.differentiator?.trim() ||
    !draft.supported_languages?.length
  )
    throw new Error(
      "Confirm the task, supported languages and distinguishing conditions.",
    );
  const exception =
    draft.peers.length < 3 &&
    (draft.peer_exception_reason?.trim().length ?? 0) >= 20 &&
    (draft.supplementary_alternatives?.trim().length ?? 0) >= 10;
  const site = normalizeWebsite(draft.website_url, demo);
  return {
    ...draft,
    ...site,
    slug: slugify(draft.name),
    peers: validatePeers(draft.peers, site.domain, !exception, demo),
  };
}
export function parseTraffic(text: string): TrafficFields {
  const domain =
    text
      .match(
        /\b(?:www\.)?([a-z0-9][a-z0-9-]*(?:\.[a-z0-9-]+)*\.[a-z]{2,})\b/i,
      )?.[1]
      ?.toLowerCase() ?? "";
  const month = text.match(/\b(20\d{2})[-/.年\s]+(0?[1-9]|1[0-2])(?:月|\b)/);
  const named = text.match(
    /\b(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+(20\d{2})\b/i,
  );
  const names = [
    "jan",
    "feb",
    "mar",
    "apr",
    "may",
    "jun",
    "jul",
    "aug",
    "sep",
    "oct",
    "nov",
    "dec",
  ];
  const period = month
    ? `${month[1]}-${month[2].padStart(2, "0")}`
    : named
      ? `${named[2]}-${String(names.indexOf(named[1].slice(0, 3).toLowerCase()) + 1).padStart(2, "0")}`
      : "";
  const number = text.match(
    /(?:total\s+visits|monthly\s+visits|visits|月访问量|总访问量|访问量)\s*[:：]?\s*([\d,.]+)\s*([KMB万亿])?/i,
  );
  const unit = number?.[2]?.toUpperCase() ?? "";
  const multiplier: Record<string, number> = {
    K: 1e3,
    M: 1e6,
    B: 1e9,
    万: 1e4,
    亿: 1e8,
  };
  const value = number
    ? Number(number[1].replace(/,/g, "")) * (multiplier[unit] ?? 1)
    : null;
  return {
    domain,
    source: /AITDK/i.test(text) ? "AITDK" : "",
    month: period,
    metric: number ? "visits" : "",
    scope: /worldwide/i.test(text) && /all\s+devices/i.test(text) ? SCOPE : "",
    value: Number.isFinite(value) ? value : null,
    unit: unit || "visits",
    raw_display: number ? number[1] + unit : null,
    precision_step: number
      ? (multiplier[unit] ?? 1) / 10 ** (number[1].split(".")[1]?.length ?? 0)
      : 1,
  };
}
export function evidenceFieldsComplete(f: TrafficFields, domain: string) {
  return (
    f.domain === domain &&
    f.source === "AITDK" &&
    /^20\d{2}-\d{2}$/.test(f.month) &&
    f.metric === "visits" &&
    f.scope === SCOPE &&
    f.value !== null &&
    f.value >= 0
  );
}
export function comparableChange(
  current: TrafficFields | undefined,
  previous: TrafficFields | undefined,
) {
  if (
    !current ||
    !previous ||
    current.value == null ||
    previous.value == null ||
    previous.value <= 0
  )
    return null;
  if (
    ["domain", "source", "metric", "scope"].some(
      (k) =>
        current[k as keyof TrafficFields] !==
        previous[k as keyof TrafficFields],
    )
  )
    return null;
  const a = new Date(`${current.month}-01T00:00:00Z`),
    b = new Date(`${previous.month}-01T00:00:00Z`);
  b.setUTCMonth(b.getUTCMonth() + 1);
  if (a.getTime() !== b.getTime()) return null;
  return ((current.value - previous.value) / previous.value) * 100;
}
export function trafficFingerprint(f: TrafficFields, demo: boolean) {
  return [
    f.domain,
    f.source,
    f.month,
    f.metric,
    f.scope,
    demo ? "demo" : "real",
  ].join(":");
}

// Suggestions are explicitly confirmed by a person; they never publish a relationship.
export function suggestCategory(text: string) {
  const scores = [
    [
      "ai-coding",
      /\b(code editor|code completion|coding assistant|debugging|code generation)\b/gi,
    ],
    [
      "workflow-automation",
      /\b(workflow automation|automate workflows|app integrations|automation platform)\b/gi,
    ],
    [
      "knowledge-search",
      /\b(knowledge search|retrieval|enterprise search|RAG|document search)\b/gi,
    ],
  ] as const;
  const ranked = scores
    .map(([slug, re]) => ({ slug, score: [...text.matchAll(re)].length }))
    .sort((a, b) => b.score - a.score);
  return ranked[0].score > 0 && ranked[0].score > ranked[1].score
    ? ranked[0].slug
    : null;
}
