import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  Route,
  ShieldCheck,
  Terminal,
} from "lucide-react";
import { ReportJsonLd } from "@/components/seo/report-json-ld";
import {
  SUBMISSION_CHANNELS_REPORT_PATH,
  SUBMISSION_CHANNELS_REPORT_SUBTITLE,
  SUBMISSION_CHANNELS_REPORT_TITLE,
  submissionChannelSteps,
  submissionChannels,
  submissionChannelsMethodology,
} from "@/lib/reports/submission-channels-report";
import { siteDescription, siteTitle } from "@/lib/seo";
import type { Metadata } from "next";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: siteTitle(SUBMISSION_CHANNELS_REPORT_TITLE),
  description: siteDescription(SUBMISSION_CHANNELS_REPORT_SUBTITLE),
  alternates: {
    canonical: `https://123charts.com${SUBMISSION_CHANNELS_REPORT_PATH}`,
  },
  robots: { index: true, follow: true },
};

export default function SubmissionChannelsReportPage() {
  const canonicalUrl = `https://123charts.com${SUBMISSION_CHANNELS_REPORT_PATH}`;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <ReportJsonLd
        url={canonicalUrl}
        headline={SUBMISSION_CHANNELS_REPORT_TITLE}
        description={SUBMISSION_CHANNELS_REPORT_SUBTITLE}
        datePublished="2026-06-18"
      />

      <header className="mb-10 border-b border-terminal-border pb-8">
        <div className="mb-3 flex items-center gap-2">
          <FileText className="h-4 w-4 text-terminal-muted" />
          <span className="text-[10px] font-mono uppercase tracking-widest text-terminal-dim">
            Founder Field Report
          </span>
        </div>
        <h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-terminal-fg sm:text-4xl">
          {SUBMISSION_CHANNELS_REPORT_TITLE}
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-terminal-dim">
          {SUBMISSION_CHANNELS_REPORT_SUBTITLE}
        </p>
        <div className="mt-5 flex flex-wrap gap-3 text-[11px] font-mono uppercase tracking-widest text-terminal-dim">
          <span>Mode: curated guidance</span>
          <span>Audience: founders</span>
          <span>Boundary: reviewed surfaces only</span>
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
              Early AI project submissions work best when founders prepare
              clear source material, choose reviewed channels, and keep every
              public claim auditable. This report maps practical submission
              surfaces without treating distribution as a shortcut or a paid
              placement mechanism.
            </p>
          </div>
        </section>

        <section>
          <div className="mb-4 flex items-center gap-2">
            <Route className="h-4 w-4 text-terminal-muted" />
            <h2 className="text-sm font-semibold text-terminal-fg">
              Channel Map
            </h2>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            {submissionChannels.map((channel) => (
              <article
                key={channel.name}
                className="rounded-md border border-terminal-border bg-terminal-surface p-5"
              >
                <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="mb-1 text-[10px] font-mono uppercase tracking-widest text-terminal-dim">
                      {channel.category}
                    </div>
                    <h3 className="text-sm font-semibold text-terminal-fg">
                      {channel.name}
                    </h3>
                  </div>
                </div>
                <p className="text-xs leading-relaxed text-terminal-dim">
                  {channel.useCase}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {channel.readinessSignals.map((signal) => (
                    <span
                      key={signal}
                      className="rounded-md border border-terminal-border px-2 py-0.5 text-[10px] font-mono text-terminal-muted"
                    >
                      {signal}
                    </span>
                  ))}
                </div>
                <p className="mt-4 border-t border-terminal-border pt-3 text-[11px] leading-relaxed text-terminal-dim">
                  {channel.boundary}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-4 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-terminal-muted" />
            <h2 className="text-sm font-semibold text-terminal-fg">
              Recommended Founder Sequence
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {submissionChannelSteps.map((step, index) => (
              <div
                key={step.title}
                className="rounded-md border border-terminal-border bg-terminal-surface p-4"
              >
                <div className="mb-2 text-[10px] font-mono uppercase tracking-widest text-terminal-dim">
                  Step {index + 1}
                </div>
                <h3 className="text-xs font-semibold text-terminal-fg">
                  {step.title}
                </h3>
                <p className="mt-2 text-[11px] leading-relaxed text-terminal-dim">
                  {step.body}
                </p>
                {step.href && (
                  <Link
                    href={step.href}
                    className="mt-3 inline-flex items-center gap-1 text-[11px] font-medium text-terminal-muted hover:text-terminal-fg"
                  >
                    Open flow
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                )}
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-4 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-terminal-muted" />
            <h2 className="text-sm font-semibold text-terminal-fg">
              Methodology And Boundaries
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {submissionChannelsMethodology.map((point) => (
              <div
                key={point}
                className="rounded-md border border-terminal-border bg-terminal-surface p-4"
              >
                <p className="text-xs leading-relaxed text-terminal-dim">
                  {point}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-md border border-terminal-border bg-terminal-elevated p-5">
          <h2 className="text-sm font-semibold text-terminal-fg">
            Continue On 123Charts
          </h2>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/submit"
              className="rounded-md border border-terminal-ring px-3 py-2 text-xs text-terminal-fg transition-colors hover:bg-terminal-surface"
            >
              Submit a Project
            </Link>
            <Link
              href="/geo-checker"
              className="rounded-md border border-terminal-ring px-3 py-2 text-xs text-terminal-fg transition-colors hover:bg-terminal-surface"
            >
              Run AI Search Readiness Checker
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
