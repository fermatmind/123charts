import { notFound } from "next/navigation";
import { getReportBySlug, demoReports } from "@/lib/demo-reports";
import { techArticleJSONLD } from "@/lib/structured-data";
import { MethodologyBlock } from "@/components/methodology-block";
import { siteTitle, siteDescription } from "@/lib/seo";
import {
  FileText,
  TrendingUp,
  UserPlus,
  Zap,
  BarChart3,
  Search,
  ShieldAlert,
  Info,
  Calendar,
} from "lucide-react";
import type { Metadata } from "next";

interface ReportPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return demoReports.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata(props: ReportPageProps): Promise<Metadata> {
  const params = await props.params;
  const report = getReportBySlug(params.slug);
  if (!report) return { title: "Not Found" };

  return {
    title: siteTitle(report.title),
    description: siteDescription(report.executiveSummary.slice(0, 150)),
    robots: { index: true, follow: true },
  };
}

export default async function ReportPage(props: ReportPageProps) {
  const params = await props.params;
  const report = getReportBySlug(params.slug);
  if (!report) notFound();

  const baseUrl =
    process.env.APP_URL ?? "http://localhost:3000";
  const pageUrl = `${baseUrl}/reports/${report.slug}`;

  const articleLD = techArticleJSONLD(
    pageUrl,
    report.title,
    report.executiveSummary,
    report.date
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLD) }}
      />

      <div className="mb-10">
        <div className="mb-2 flex items-center gap-2">
          <FileText className="h-4 w-4 text-terminal-muted" />
          <span className="text-[10px] font-mono uppercase tracking-widest text-terminal-dim">
            Report
          </span>
        </div>
        <h1 className="mb-2 text-2xl font-bold tracking-tight text-terminal-fg">
          {report.title}
        </h1>
        <div className="flex items-center gap-1.5 text-xs text-terminal-dim">
          <Calendar className="h-3.5 w-3.5" />
          <span>{report.date}</span>
        </div>
      </div>

      <div className="space-y-10">
        <section className="rounded-lg border border-terminal-border bg-terminal-surface p-6">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-terminal-fg">
            <Info className="h-4 w-4 text-terminal-muted" />
            Executive Summary
          </h2>
          <p className="text-xs text-terminal-dim leading-relaxed">
            {report.executiveSummary}
          </p>
        </section>

        <section className="rounded-lg border border-terminal-border bg-terminal-surface p-6">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-terminal-fg">
            <TrendingUp className="h-4 w-4 text-emerald-500" />
            Top Movers
          </h2>
          <div className="space-y-3">
            {report.topMovers.map((mover) => (
              <div
                key={mover.name}
                className="rounded-md border border-terminal-border bg-terminal-bg p-3"
              >
                <h3 className="text-xs font-semibold text-terminal-fg">
                  {mover.name}
                </h3>
                <p className="mt-0.5 text-[11px] text-terminal-dim leading-relaxed">
                  {mover.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-terminal-border bg-terminal-surface p-6">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-terminal-fg">
            <UserPlus className="h-4 w-4 text-terminal-muted" />
            Newly Claimed Projects
          </h2>
          <div className="space-y-3">
            {report.newlyClaimed.map((item) => (
              <div
                key={item.name}
                className="rounded-md border border-terminal-border bg-terminal-bg p-3"
              >
                <h3 className="text-xs font-semibold text-terminal-fg">
                  {item.name}
                </h3>
                <p className="mt-0.5 text-[11px] text-terminal-dim leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-terminal-border bg-terminal-surface p-6">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-terminal-fg">
            <Zap className="h-4 w-4 text-amber-500" />
            Fastest Dev Momentum
          </h2>
          <div className="space-y-3">
            {report.fastestDevMomentum.map((item) => (
              <div
                key={item.name}
                className="rounded-md border border-terminal-border bg-terminal-bg p-3"
              >
                <h3 className="text-xs font-semibold text-terminal-fg">
                  {item.name}
                </h3>
                <p className="mt-0.5 text-[11px] text-terminal-dim leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-terminal-border bg-terminal-surface p-6">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-terminal-fg">
            <BarChart3 className="h-4 w-4 text-terminal-muted" />
            Commercial Readiness Watch
          </h2>
          <div className="space-y-3">
            {report.commercialReadinessWatch.map((item) => (
              <div
                key={item.name}
                className="rounded-md border border-terminal-border bg-terminal-bg p-3"
              >
                <h3 className="text-xs font-semibold text-terminal-fg">
                  {item.name}
                </h3>
                <p className="mt-0.5 text-[11px] text-terminal-dim leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-terminal-border bg-terminal-surface p-6">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-terminal-fg">
            <Search className="h-4 w-4 text-terminal-muted" />
            SEO Gap Patterns
          </h2>
          <p className="text-xs text-terminal-dim leading-relaxed">
            {report.seoGapPatterns}
          </p>
        </section>

        <section className="rounded-lg border border-terminal-border bg-terminal-surface p-6">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-terminal-fg">
            <ShieldAlert className="h-4 w-4 text-terminal-muted" />
            Source Confidence
          </h2>
          <p className="text-xs text-terminal-dim leading-relaxed">
            {report.sourceConfidence}
          </p>
        </section>

        <MethodologyBlock methodologyNote={report.methodology} />

        <section className="rounded-lg border border-terminal-border bg-terminal-surface p-6">
          <h2 className="mb-3 text-sm font-semibold text-terminal-fg">
            Report Notes
          </h2>
          <p className="text-xs text-terminal-dim leading-relaxed">
            {report.reportNotes}
          </p>
        </section>
      </div>
    </div>
  );
}
