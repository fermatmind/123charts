import fs from "node:fs";
import path from "node:path";

export const FOUNDER_INTENT_REPORT_SLUG =
  "early-ai-project-machine-readability-2026";
export const FOUNDER_INTENT_REPORT_PATH = `/reports/${FOUNDER_INTENT_REPORT_SLUG}`;
export const FOUNDER_INTENT_REPORT_TITLE =
  "Early AI Project Machine-Readability Report 2026";
export const FOUNDER_INTENT_REPORT_SUBTITLE =
  "A restrained Seed 100 snapshot of crawler-readable metadata, structured data, and public profile readiness.";

const DATASET_DIR = path.join(
  process.cwd(),
  "data",
  "audits",
  "seed-100-readiness"
);
const SUMMARY_PATH = path.join(DATASET_DIR, "summary.json");
const ITEMS_PATH = path.join(DATASET_DIR, "items.ndjson");

interface AuditSummary {
  total_projects: number;
  audited_projects: number;
  outcome_counts: Record<string, number>;
  category_counts: Record<string, number>;
  jsonld_present_count: number;
  software_application_schema_present_count: number;
  canonical_present_count: number;
  meta_description_present_count: number;
  robots_available_count: number;
  sitemap_available_count: number;
  html_fetch_failure_count: number;
  top_issue_codes: { code: string; count: number }[];
  generated_at: string;
  data_repo_commit: string;
  main_repo_commit: string;
}

interface AuditItem {
  audit_outcome: string;
  issue_codes: string[];
}

export interface ReportMetric {
  label: string;
  value: string;
  note: string;
}

export interface IssueRow {
  code: string;
  label: string;
  count: number;
  note: string;
}

export interface MethodologyPoint {
  label: string;
  body: string;
}

export interface FounderStep {
  label: string;
  body: string;
  href?: string;
}

export interface Seed100ReadinessReport {
  title: string;
  subtitle: string;
  slug: string;
  path: string;
  canonicalUrl: string;
  generatedAt: string;
  generatedDateLabel: string;
  corpusSize: number;
  auditedProjects: number;
  okProjects: number;
  websiteFailures: number;
  summary: AuditSummary;
  metrics: ReportMetric[];
  issueRows: IssueRow[];
  failureRows: IssueRow[];
  methodology: MethodologyPoint[];
  founderSteps: FounderStep[];
  dataRepoCommit: string;
  mainRepoCommit: string;
}

function readSummary(): AuditSummary {
  return JSON.parse(fs.readFileSync(SUMMARY_PATH, "utf8")) as AuditSummary;
}

function readItems(): AuditItem[] {
  return fs
    .readFileSync(ITEMS_PATH, "utf8")
    .trim()
    .split(/\n+/)
    .filter(Boolean)
    .map((line) => JSON.parse(line) as AuditItem);
}

function countIssue(items: AuditItem[], code: string): number {
  return items.filter((item) => item.issue_codes.includes(code)).length;
}

function countOutcome(items: AuditItem[], outcomes: string[]): number {
  const allowed = new Set(outcomes);
  return items.filter((item) => allowed.has(item.audit_outcome)).length;
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    timeZone: "UTC",
  }).format(new Date(value));
}

function topIssueRows(summary: AuditSummary): IssueRow[] {
  const notes: Record<string, string> = {
    missing_jsonld: "No JSON-LD block was detected in the bounded HTML sample.",
    missing_canonical: "No canonical metadata marker was detected.",
    sitemap_unavailable: "Same-origin sitemap check did not return an available response.",
    missing_open_graph: "Open Graph metadata was not detected.",
    low_readable_text: "Readable text bucket was below the report threshold.",
    http_4xx: "Official website fetch returned a client-side status class.",
    robots_unavailable: "Same-origin robots check did not return an available response.",
    missing_meta_description: "Meta description marker was not detected.",
    redirect_limit: "Redirect chain exceeded the bounded redirect policy.",
    dns_error: "Host lookup did not resolve during the bounded fetch.",
    missing_title: "HTML title marker was not detected.",
  };

  return summary.top_issue_codes.map((item) => ({
    code: item.code,
    label: item.code.replaceAll("_", " "),
    count: item.count,
    note: notes[item.code] ?? "Dataset issue code recorded by PR33.",
  }));
}

function failureRows(items: AuditItem[]): IssueRow[] {
  return [
    {
      code: "missing_jsonld",
      label: "missing JSON-LD",
      count: countIssue(items, "missing_jsonld"),
      note: "Structured machine-readable metadata was absent from the captured page.",
    },
    {
      code: "missing_canonical",
      label: "missing canonical",
      count: countIssue(items, "missing_canonical"),
      note: "Canonical metadata was not detected in the bounded sample.",
    },
    {
      code: "unreachable_homepage",
      label: "unreachable homepage",
      count: countOutcome(items, [
        "dns_error",
        "tls_error",
        "http_4xx",
        "http_5xx",
        "fetch_error",
      ]),
      note: "The official landing URL did not produce a usable HTML response.",
    },
    {
      code: "timeout",
      label: "timeout",
      count: countOutcome(items, ["timeout"]),
      note: "The request exceeded the fixed five-second limit.",
    },
    {
      code: "redirect_limit",
      label: "redirect limit",
      count: countOutcome(items, ["redirect_limit"]),
      note: "Redirect handling stopped at the configured limit.",
    },
    {
      code: "empty_html",
      label: "empty HTML",
      count: countOutcome(items, ["empty_html"]),
      note: "The response did not contain usable HTML text.",
    },
    {
      code: "missing_sitemap",
      label: "missing sitemap",
      count: countIssue(items, "sitemap_unavailable"),
      note: "Same-origin sitemap discovery was unavailable.",
    },
    {
      code: "missing_robots",
      label: "missing robots",
      count: countIssue(items, "robots_unavailable"),
      note: "Same-origin robots discovery was unavailable.",
    },
  ];
}

export function getSeed100ReadinessReport(): Seed100ReadinessReport {
  const summary = readSummary();
  const items = readItems();
  const baseUrl = process.env.APP_URL ?? "https://123charts.com";
  const okProjects = summary.outcome_counts.ok ?? 0;

  return {
    title: FOUNDER_INTENT_REPORT_TITLE,
    subtitle: FOUNDER_INTENT_REPORT_SUBTITLE,
    slug: FOUNDER_INTENT_REPORT_SLUG,
    path: FOUNDER_INTENT_REPORT_PATH,
    canonicalUrl: `${baseUrl}${FOUNDER_INTENT_REPORT_PATH}`,
    generatedAt: summary.generated_at,
    generatedDateLabel: formatDate(summary.generated_at),
    corpusSize: summary.total_projects,
    auditedProjects: items.length,
    okProjects,
    websiteFailures: summary.html_fetch_failure_count,
    summary,
    metrics: [
      {
        label: "Corpus",
        value: String(summary.total_projects),
        note: "Seed projects in the committed dataset.",
      },
      {
        label: "Usable HTML",
        value: String(okProjects),
        note: "Official sites with an ok bounded fetch outcome.",
      },
      {
        label: "Website-level failures",
        value: String(summary.html_fetch_failure_count),
        note: "Recorded as facts, not discarded.",
      },
      {
        label: "JSON-LD present",
        value: String(summary.jsonld_present_count),
        note: "Pages with at least one JSON-LD block.",
      },
      {
        label: "SoftwareApplication schema",
        value: String(summary.software_application_schema_present_count),
        note: "Pages with SoftwareApplication type detected.",
      },
      {
        label: "Canonical metadata",
        value: String(summary.canonical_present_count),
        note: "Pages with canonical marker present.",
      },
      {
        label: "Robots available",
        value: String(summary.robots_available_count),
        note: "Same-origin robots check available.",
      },
      {
        label: "Sitemap available",
        value: String(summary.sitemap_available_count),
        note: "Same-origin sitemap check available.",
      },
    ],
    issueRows: topIssueRows(summary),
    failureRows: failureRows(items),
    methodology: [
      {
        label: "Seed 100 input",
        body: "The report reads the committed PR33 Seed 100 audit dataset. It does not modify the source data repository.",
      },
      {
        label: "Bounded audit",
        body: "Each project uses the official website URL, same-origin robots file, and same-origin sitemap file with fixed limits.",
      },
      {
        label: "No JavaScript execution",
        body: "The audit uses static HTML fetches only. It does not execute scripts or run a browser.",
      },
      {
        label: "No LLM or paid APIs",
        body: "The dataset is deterministic and does not call model providers, search providers, or paid external services.",
      },
      {
        label: "Failures retained",
        body: "Website-level failures remain in the aggregate dataset so the report can show coverage limits honestly.",
      },
    ],
    founderSteps: [
      {
        label: "Run the AI Search Readiness Checker",
        body: "Use the public checker to inspect crawler-readable metadata on a project landing page.",
        href: "/geo-checker",
      },
      {
        label: "Submit a structured public profile",
        body: "Share official project details for editorial review using the public submission flow.",
        href: "/submit",
      },
      {
        label: "Review observed profiles",
        body: "Compare published project pages with official public sources and request corrections through the founder path.",
        href: "/projects",
      },
      {
        label: "Add structured metadata to your own site",
        body: "Keep title, meta description, canonical, JSON-LD, robots, and sitemap signals easy for crawlers to read.",
      },
    ],
    dataRepoCommit: summary.data_repo_commit,
    mainRepoCommit: summary.main_repo_commit,
  };
}
