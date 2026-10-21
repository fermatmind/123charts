export const SITE_NAME = "123Charts";
export const SITE_TAGLINE = "Discover. Compare. Decide.";
export const SITE_DESCRIPTION =
  "Discover projects and compare websites with source-aware monthly charts.";

export const NAV_LINKS = [
  { href: "/projects", label: "Projects" },
  { href: "/collections", label: "Collections" },
  { href: "/methodology", label: "Methodology" },
  { href: "/submit", label: "Submit" },
] as const;

export const SIGNAL_DIMENSIONS = [
  { key: "productReadiness", label: "Product Readiness" },
  { key: "devMomentum", label: "Dev Momentum" },
  { key: "marketPresence", label: "Market Presence" },
  { key: "commercialReadiness", label: "Commercial Readiness" },
  { key: "seoFoundation", label: "SEO Foundation" },
  { key: "trustConfidence", label: "Trust Confidence" },
] as const;

export type SignalDimension = (typeof SIGNAL_DIMENSIONS)[number]["key"];

export const LIFECYCLE_STATES = [
  "submitted",
  "pending_review",
  "approved",
  "published",
  "claimed",
  "owner_verified",
  "archived",
] as const;

export type LifecycleState = (typeof LIFECYCLE_STATES)[number];

export const SOURCE_CONFIDENCE_LEVELS = [
  "verified",
  "public_signals",
  "not_enough_data",
  "founder_not_claimed",
  "source_unavailable",
] as const;

export type SourceConfidenceLevel =
  (typeof SOURCE_CONFIDENCE_LEVELS)[number];

export const INDEXABLE_STATES: ReadonlySet<LifecycleState> = new Set([
  "published",
  "claimed",
  "owner_verified",
]);

export const CLAIM_METHODS = [
  {
    title: "Domain Email Verification",
    description:
      "Send a confirmation code to an address at the project's official domain.",
  },
  {
    title: "DNS TXT Record",
    description:
      "Add a verification TXT record to your domain DNS configuration.",
  },
  {
    title: "GitHub Repository Ownership",
    description:
      "Prove ownership by adding a verification file to the project's public repository.",
  },
  {
    title: "Manual Review",
    description:
      "Contact the 88CN team for manual identity verification and claim review.",
  },
] as const;
