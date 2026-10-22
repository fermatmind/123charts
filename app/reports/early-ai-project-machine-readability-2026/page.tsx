import Link from "next/link";
import { FileText, Database, ShieldCheck, Terminal } from "lucide-react";
import { FounderNextSteps } from "@/components/reports/founder-next-steps";
import { IssueCodeTable } from "@/components/reports/issue-code-table";
import { ReportJsonLd } from "@/components/seo/report-json-ld";
import { ReportMetricGrid } from "@/components/reports/report-metric-grid";
import { ReportMethodologyBlock } from "@/components/reports/methodology-block";
import {
  FOUNDER_INTENT_REPORT_SUBTITLE,
  FOUNDER_INTENT_REPORT_TITLE,
  getSeed100ReadinessReport,
} from "@/lib/reports/seed-100-readiness-report";
import { siteDescription, siteTitle } from "@/lib/seo";
import type { Metadata } from "next";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: siteTitle(FOUNDER_INTENT_REPORT_TITLE),
  description: siteDescription(FOUNDER_INTENT_REPORT_SUBTITLE),
  alternates: {
    canonical:
      "https://123charts.com/reports/early-ai-project-machine-readability-2026",
  },
  robots: { index: true, follow: true },
};

export default function FounderIntentSignalReportPage() {
  const report = getSeed100ReadinessReport();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <ReportJsonLd
        url={report.canonicalUrl}
        headline={report.title}
        description={report.subtitle}
        datePublished={report.generatedAt}
      />

      <header className="mb-10 border-b border-terminal-border pb-8">
        <div className="mb-3 flex items-center gap-2">
          <FileText className="h-4 w-4 text-terminal-muted" />
          <span className="text-[10px] font-mono uppercase tracking-widest text-terminal-dim">
            Founder Intent Signal Report
          </span>
        </div>
        <h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-terminal-fg sm:text-4xl">
          {report.title}
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-terminal-dim">
          {report.subtitle}
        </p>
        <div className="mt-5 flex flex-wrap gap-3 text-[11px] font-mono uppercase tracking-widest text-terminal-dim">
          <span>Dataset date: {report.generatedDateLabel}</span>
          <span>Corpus: {report.corpusSize} projects</span>
          <span>Audit records: {report.auditedProjects}</span>
        </div>
      </header>

      <main className="space-y-12">
        <section>
          <div className="mb-4 flex items-center gap-2">
            <Terminal className="h-4 w-4 text-terminal-muted" />
            <h2 className="text-sm font-semibold text-terminal-fg">
              Executive Summary
            </h2>
          </div>
          <div className="rounded-md border border-terminal-border bg-terminal-surface p-5">
            <p className="text-sm leading-relaxed text-terminal-dim">
              The Seed 100 machine-readability dataset includes{" "}
              {report.summary.total_projects} early AI projects. The bounded
              audit found {report.okProjects} official websites with usable
              HTML responses and {report.websiteFailures} website-level
              failures. JSON-LD appeared on{" "}
              {report.summary.jsonld_present_count} pages, while{" "}
              {report.summary.software_application_schema_present_count} pages
              exposed SoftwareApplication schema. This report describes observed
              metadata readiness only. It does not predict external discovery
              outcomes or business performance.
            </p>
          </div>
        </section>

        <section>
          <div className="mb-4 flex items-center gap-2">
            <Database className="h-4 w-4 text-terminal-muted" />
            <h2 className="text-sm font-semibold text-terminal-fg">
              Key Findings
            </h2>
          </div>
          <ReportMetricGrid metrics={report.metrics} />
        </section>

        <section>
          <div className="mb-4 flex items-center gap-2">
            <Database className="h-4 w-4 text-terminal-muted" />
            <h2 className="text-sm font-semibold text-terminal-fg">
              Top Issue Codes
            </h2>
          </div>
          <IssueCodeTable rows={report.issueRows} />
        </section>

        <section>
          <div className="mb-4 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-terminal-muted" />
            <h2 className="text-sm font-semibold text-terminal-fg">
              Machine-Readability Failure Modes
            </h2>
          </div>
          <IssueCodeTable rows={report.failureRows} />
        </section>

        <section>
          <div className="mb-4 flex items-center gap-2">
            <Terminal className="h-4 w-4 text-terminal-muted" />
            <h2 className="text-sm font-semibold text-terminal-fg">
              Dataset Methodology
            </h2>
          </div>
          <ReportMethodologyBlock points={report.methodology} />
        </section>

        <section>
          <div className="mb-4 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-terminal-muted" />
            <h2 className="text-sm font-semibold text-terminal-fg">
              What Founders Can Do
            </h2>
          </div>
          <FounderNextSteps steps={report.founderSteps} />
        </section>

        <section className="rounded-md border border-terminal-border bg-terminal-surface p-5">
          <h2 className="text-sm font-semibold text-terminal-fg">
            123Charts Boundary Statement
          </h2>
          <div className="mt-3 space-y-3 text-xs leading-relaxed text-terminal-dim">
            <p>
              123Charts reports observed public machine-readability signals. It does
              not promise placement in external systems, third-party inclusion,
              or downstream discovery outcomes.
            </p>
            <p>
              123Charts does not sell machine-signal placement. If visual placement
              formats are introduced later, they remain separate from sitemap,
              API, MCP, Signal Score, and Source Confidence.
            </p>
          </div>
        </section>

        <section className="rounded-md border border-terminal-border bg-terminal-elevated p-5">
          <h2 className="text-sm font-semibold text-terminal-fg">
            Continue From This Report
          </h2>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/geo-checker"
              className="rounded-md border border-terminal-ring px-3 py-2 text-xs text-terminal-fg transition-colors hover:bg-terminal-surface"
            >
              Run AI Search Readiness Checker
            </Link>
            <Link
              href="/submit"
              className="rounded-md border border-terminal-ring px-3 py-2 text-xs text-terminal-fg transition-colors hover:bg-terminal-surface"
            >
              Submit a Project
            </Link>
            <Link
              href="/projects"
              className="rounded-md border border-terminal-ring px-3 py-2 text-xs text-terminal-fg transition-colors hover:bg-terminal-surface"
            >
              View Public Profiles
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
