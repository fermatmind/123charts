export const FORBIDDEN_PAYLOAD_FIELDS = new Set([
  "stripe_session_id",
  "stripe_customer_id",
  "stripe_price_id",
  "stripe_checkout_session_id",
  "checkout_session_id",
  "payment_link",
  "payment_status",
  "is_premium_tier",
  "premium",
  "paid_plan",
  "plan",
  "price_id",
  "accelerator",
  "priority_payment",
  "feature_flag_override",
]);

export function checkForbiddenFields(
  body: unknown,
  endpoint: string
): string | null {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return null;
  }

  const keys = Object.keys(body as Record<string, unknown>);
  const found: string[] = [];

  for (const key of keys) {
    if (FORBIDDEN_PAYLOAD_FIELDS.has(key)) {
      found.push(key);
    }
  }

  if (found.length > 0) {
    return `Request contains disallowed fields for ${endpoint}: ${found.join(", ")}. 123Charts does not accept monetization, payment, or commercial-tier fields.`;
  }

  return null;
}

// ---- Honeypot fields ----

export const SUBMISSION_HONEYPOT_FIELDS = [
  "company_homepage",
  "fax_number",
] as const;

export const CLAIM_HONEYPOT_FIELDS = [
  "contact_company",
  "website_confirm",
] as const;

export function checkHoneypotFields(
  body: unknown,
  honeypotFields: readonly string[]
): string | null {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return null;
  }
  const obj = body as Record<string, unknown>;
  for (const field of honeypotFields) {
    const val = obj[field];
    if (val !== undefined && val !== null && val !== "") {
      return "Invalid submission";
    }
  }
  return null;
}

// ---- URL protocol guard ----

const BLOCKED_URL_PREFIXES = [
  "http://",
  "javascript:",
  "data:",
  "file:",
  "ftp:",
  "chrome:",
  "about:",
];

const BLOCKED_HOSTS = new Set([
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "::1",
]);

export function validateUrlField(
  value: string | undefined | null,
  fieldName: string
): string | null {
  if (!value || value.trim() === "") return null;
  const url = value.trim();

  const lower = url.toLowerCase();
  for (const prefix of BLOCKED_URL_PREFIXES) {
    if (lower.startsWith(prefix)) {
      return `URL field "${fieldName}" must use https:// protocol. Received: ${prefix}...`;
    }
  }

  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") {
      return `URL field "${fieldName}" must use https:// protocol.`;
    }
    if (BLOCKED_HOSTS.has(parsed.hostname.toLowerCase())) {
      return `URL field "${fieldName}" contains a blocked host.`;
    }
  } catch {
    return `URL field "${fieldName}" is not a valid URL.`;
  }

  return null;
}

// ---- Suspicious keyword scan ----

const SUSPICIOUS_KEYWORDS = [
  "c a s i n o",
  "g a m b l",
  "b e t t i n g",
  "w a g e r",
  "p o k e r",
  "s l o t",
  "l o t t e r",
  "c r y p t o",
  "b u y",
  "f o l l o w e r s",
  "t r a f f i c",
  "b o o s t",
  "r a n k i n g",
  "l o a n",
  "l e n d i n g",
  "f i n a n c i n g",
  "c r e d i t",
  "p h a r m a",
  "v i a g r a",
  "p i l l s",
  "d r u g",
  "a d u l t",
  "e s c o r t",
  "p o r n",
  "h a c k i n g",
  "c r a c k e d",
  "w a r e z",
  "n f t",
  "t o k e n",
  "a i r d r o p",
].map((k) => k.replace(/\s+/g, ""));

export function scanSuspiciousContent(
  fields: Record<string, string | undefined | null>
): string | null {
  const text = Object.values(fields)
    .filter((v): v is string => typeof v === "string" && v.length > 0)
    .join(" ")
    .toLowerCase()
    .replace(/\s+/g, "");

  for (const kw of SUSPICIOUS_KEYWORDS) {
    if (text.includes(kw)) {
      return "The submission contains unsupported promotional or high-risk content.";
    }
  }

  return null;
}

// ---- Category slug allowlist ----

export const ALLOWED_CATEGORY_SLUGS = new Set([
  "ai-agents",
  "ai-coding",
  "open-source-ai",
  "local-llm",
  "rag-tools",
  "ai-seo-tools",
  "ai-video-tools",
  "ai-design-tools",
  "ai-microsaas",
  "chinese-ai-builders",
]);

export function validateCategorySlug(slug: string | undefined | null): string | null {
  if (!slug) return null;
  if (!ALLOWED_CATEGORY_SLUGS.has(slug)) {
    return `Category slug "${slug}" is not in the allowed category list.`;
  }
  return null;
}

// ---- Body size constants ----

export const MAX_BODY_SIZE_BYTES = 64 * 1024; // 64KB
