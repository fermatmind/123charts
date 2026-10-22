import { demoReports } from "@/lib/demo-reports";
import ReportCard from "@/components/report-card";
import { itemListJSONLD } from "@/lib/structured-data";
import { siteTitle, siteDescription } from "@/lib/seo";
import { getPublishedReportListItems } from "@/lib/reports/published-reports";
import {
  FOUNDER_INTENT_REPORT_PATH,
  FOUNDER_INTENT_REPORT_SUBTITLE,
  FOUNDER_INTENT_REPORT_TITLE,
} from "@/lib/reports/seed-100-readiness-report";
import {
  SUBMISSION_CHANNELS_REPORT_PATH,
  SUBMISSION_CHANNELS_REPORT_SUBTITLE,
  SUBMISSION_CHANNELS_REPORT_TITLE,
} from "@/lib/reports/submission-channels-report";
import Link from "next/link";
import { FileText } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: siteTitle("Reports"),
  description: siteDescription(
    "123Charts data reports on AI project growth signals. Weekly snapshots, category momentum analysis, and editorial insights based on public signals."
  ),
  robots: { index: true, follow: true },
};

export default function ReportsPage() {
  const baseUrl =
    process.env.APP_URL ?? "http://localhost:3000";

  const reportsLD = itemListJSONLD(getPublishedReportListItems(baseUrl));

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(reportsLD) }}
      />

      <div className="mb-10">
        <div className="mb-2 flex items-center gap-2">
          <FileText className="h-4 w-4 text-terminal-muted" />
          <span className="text-[10px] font-mono uppercase tracking-widest text-terminal-dim">
            Data Reports
          </span>
        </div>
        <h1 className="mb-2 text-2xl font-bold tracking-tight text-terminal-fg">
          Reports
        </h1>
        <p className="text-sm text-terminal-dim">
          Data-driven snapshots of AI project growth signals. All reports are
          based on public signals from reviewed snapshots.
        </p>
      </div>

      <div className="mb-4 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-terminal-border bg-terminal-surface p-5">
        <div className="mb-2 text-[10px] font-mono uppercase tracking-widest text-terminal-dim">
          Latest report
        </div>
        <h2 className="text-sm font-semibold text-terminal-fg">
          <Link
            href={FOUNDER_INTENT_REPORT_PATH}
            className="hover:text-terminal-muted"
          >
            {FOUNDER_INTENT_REPORT_TITLE}
          </Link>
        </h2>
        <p className="mt-2 text-xs leading-relaxed text-terminal-dim">
          {FOUNDER_INTENT_REPORT_SUBTITLE}
        </p>
      </div>
        <div className="rounded-lg border border-terminal-border bg-terminal-surface p-5">
          <div className="mb-2 text-[10px] font-mono uppercase tracking-widest text-terminal-dim">
            Founder guide
          </div>
          <h2 className="text-sm font-semibold text-terminal-fg">
            <Link
              href={SUBMISSION_CHANNELS_REPORT_PATH}
              className="hover:text-terminal-muted"
            >
              {SUBMISSION_CHANNELS_REPORT_TITLE}
            </Link>
          </h2>
          <p className="mt-2 text-xs leading-relaxed text-terminal-dim">
            {SUBMISSION_CHANNELS_REPORT_SUBTITLE}
          </p>
        </div>
      </div>

      {demoReports.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-sm text-terminal-dim">No reports published yet.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {demoReports.map((report) => (
            <ReportCard key={report.slug} report={report} />
          ))}
        </div>
      )}
    </div>
  );
}
