import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight,
  Boxes,
  Compass,
  Database,
  FileText,
  GitBranch,
  Map,
  SearchCheck,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { getLandscapeSnapshot } from "@/lib/landscape/public-signal-landscape";
import { siteDescription, siteTitle } from "@/lib/seo";

export const metadata: Metadata = {
  title: siteTitle("AI Project Landscape"),
  description: siteDescription(
    "Explore reviewed AI projects by category, stack, source links, and public readiness signals."
  ),
  alternates: {
    canonical: "/landscape",
  },
  robots: { index: true, follow: true },
};

const audiences = [
  {
    title: "Builders / repo hunters",
    body: "Find active AI projects, source links, stacks, and approved alternatives from reviewed public profiles.",
    href: "/projects",
    linkLabel: "Browse projects",
    icon: GitBranch,
  },
  {
    title: "Potential AI founders",
    body: "Understand sectors, project density, competitors, and public readiness from finite reviewed surfaces.",
    href: "/reports",
    linkLabel: "Read reports",
    icon: Compass,
  },
  {
    title: "Researchers / data buyers",
    body: "Review public signal evidence and the future Alpha Feed boundary without private project data.",
    href: "/alpha-feed",
    linkLabel: "Review Alpha Feed boundary",
    icon: Database,
  },
  {
    title: "AI project founders / owners",
    body: "Submit or correct public project information through human review, then run a public readiness check.",
    href: "/submit",
    linkLabel: "Submit for review",
    icon: UserCheck,
  },
];

export default function LandscapePage() {
  const snapshot = getLandscapeSnapshot();
  const featuredProjects = snapshot.projects.slice(0, 4);

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <section className="border-b border-terminal-border pb-10">
        <div className="mb-4 inline-flex items-center gap-2 rounded-md border border-terminal-border bg-terminal-surface px-3 py-2">
          <Compass className="h-4 w-4 text-terminal-muted" />
          <span className="font-mono text-[10px] uppercase tracking-widest text-terminal-dim">
            Public Signal Landscape
          </span>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
          <div>
            <h1 className="max-w-4xl text-3xl font-semibold tracking-tight text-terminal-fg sm:text-5xl">
              Explore reviewed AI projects by category, stack, source links,
              and public readiness signals.
            </h1>
            <p className="mt-5 max-w-3xl text-sm leading-relaxed text-terminal-dim sm:text-base">
              123Charts organizes a reviewed sample of public AI project signals.
              Counts are not global market estimates. Use this hub to move
              between project profiles, reports, machine-readability evidence,
              and founder review workflows.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/projects"
                className="inline-flex items-center gap-1 rounded-md border border-terminal-ring px-3 py-2 text-xs text-terminal-fg transition-colors hover:bg-terminal-surface"
              >
                Browse projects
                <ArrowRight className="h-3 w-3" />
              </Link>
              <Link
                href="/geo-checker"
                className="inline-flex items-center gap-1 rounded-md border border-terminal-border px-3 py-2 text-xs text-terminal-muted transition-colors hover:border-terminal-ring hover:text-terminal-fg"
              >
                Run geo-checker
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>

          <div className="rounded-md border border-terminal-border bg-terminal-surface p-5">
            <h2 className="text-sm font-semibold text-terminal-fg">
              Boundary
            </h2>
            <p className="mt-3 text-xs leading-relaxed text-terminal-dim">
              This page is not a ranking page, commercial placement surface,
              live endpoint, account enrollment flow, or generic directory
              clone.
              It links only to existing reviewed public surfaces.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 py-10 md:grid-cols-2 xl:grid-cols-4">
        {audiences.map((audience) => (
          <article
            key={audience.title}
            className="rounded-md border border-terminal-border bg-terminal-surface p-5"
          >
            <audience.icon className="mb-4 h-5 w-5 text-terminal-muted" />
            <h2 className="text-sm font-semibold text-terminal-fg">
              {audience.title}
            </h2>
            <p className="mt-3 text-xs leading-relaxed text-terminal-dim">
              {audience.body}
            </p>
            <Link
              href={audience.href}
              className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-terminal-muted hover:text-terminal-fg"
            >
              {audience.linkLabel}
              <ArrowRight className="h-3 w-3" />
            </Link>
          </article>
        ))}
      </section>

      <section className="grid gap-4 pb-10 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-md border border-terminal-border bg-terminal-surface p-5">
          <div className="mb-3 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-terminal-muted" />
            <h2 className="text-sm font-semibold text-terminal-fg">
              Public signal preview
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {snapshot.metrics.map((metric) => (
              <div
                key={metric.label}
                className="rounded-md border border-terminal-border px-3 py-3"
              >
                <div className="font-mono text-lg font-semibold text-terminal-fg">
                  {metric.value}
                </div>
                <div className="mt-1 text-xs font-medium text-terminal-muted">
                  {metric.label}
                </div>
                <p className="mt-2 text-[11px] leading-relaxed text-terminal-dim">
                  {metric.detail}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-md border border-terminal-border bg-terminal-surface p-5">
          <div className="mb-3 flex items-center gap-2">
            <Boxes className="h-4 w-4 text-terminal-muted" />
            <h2 className="text-sm font-semibold text-terminal-fg">
              Browse by reviewed surfaces
            </h2>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {snapshot.browseLinks.map((item) => (
              <Link
                key={`${item.href}-${item.label}`}
                href={item.href}
                className="rounded-md border border-terminal-border px-3 py-3 transition-colors hover:border-terminal-ring hover:bg-terminal-elevated"
              >
                <div className="text-xs font-semibold text-terminal-fg">
                  {item.label}
                </div>
                <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-terminal-dim">
                  {item.description}
                </p>
              </Link>
            ))}
          </div>
          <p className="mt-4 text-xs leading-relaxed text-terminal-dim">
            Future task and sector routes remain planned work. They are not
            generated or linked from this implementation.
          </p>
        </div>
      </section>

      <section className="pb-10">
        <div className="rounded-md border border-terminal-border bg-terminal-surface p-5">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <Map className="h-4 w-4 text-terminal-muted" />
                <h2 className="text-sm font-semibold text-terminal-fg">
                  Sector density map
                </h2>
              </div>
              <p className="max-w-3xl text-xs leading-relaxed text-terminal-dim">
                Sector groups are finite internal discovery aids built from
                reviewed local project records. Counts are reviewed sample
                counts, not global market estimates, and sparse sectors stay
                labeled as limited reviewed samples.
              </p>
            </div>
            <span className="rounded-sm border border-terminal-border px-2 py-1 font-mono text-[10px] uppercase text-terminal-dim">
              Module only
            </span>
          </div>

          <div className="grid gap-3 lg:grid-cols-2">
            {snapshot.sectorDensity.map((sector) => (
              <article
                key={sector.slug}
                className="rounded-md border border-terminal-border p-4"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-terminal-fg">
                      {sector.title}
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-terminal-dim">
                      {sector.summary}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-sm border border-terminal-border px-2 py-1 font-mono text-[10px] uppercase text-terminal-dim">
                    {sector.thresholdLabel}
                  </span>
                </div>

                <div className="mt-4 grid gap-2 sm:grid-cols-3">
                  <div className="rounded-md border border-terminal-border px-3 py-3">
                    <div className="font-mono text-lg font-semibold text-terminal-fg">
                      {sector.reviewedSampleCount}
                    </div>
                    <div className="mt-1 text-[11px] text-terminal-dim">
                      Reviewed sample count
                    </div>
                  </div>
                  {sector.sourceEvidence.map((metric) => (
                    <div
                      key={`${sector.slug}-${metric.label}`}
                      className="rounded-md border border-terminal-border px-3 py-3"
                    >
                      <div className="font-mono text-lg font-semibold text-terminal-fg">
                        {metric.value}
                      </div>
                      <div className="mt-1 text-[11px] text-terminal-dim">
                        {metric.label}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {sector.projectExamples.map((project) => (
                    <Link
                      key={`${sector.slug}-${project.slug}`}
                      href={`/projects/${project.slug}`}
                      className="rounded-sm border border-terminal-border px-2 py-1 text-[11px] text-terminal-muted transition-colors hover:border-terminal-ring hover:text-terminal-fg"
                    >
                      {project.name}
                    </Link>
                  ))}
                </div>

                <p className="mt-4 text-[11px] leading-relaxed text-terminal-dim">
                  {sector.statusNote}
                </p>
                <p className="mt-2 text-[11px] leading-relaxed text-terminal-dim">
                  {sector.methodologyNote}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 pb-10 lg:grid-cols-2">
        <div className="rounded-md border border-terminal-border bg-terminal-surface p-5">
          <div className="mb-3 flex items-center gap-2">
            <SearchCheck className="h-4 w-4 text-terminal-muted" />
            <h2 className="text-sm font-semibold text-terminal-fg">
              Machine-readability evidence
            </h2>
          </div>
          <div className="grid gap-2">
            {snapshot.machineSignals.map((signal) => (
              <div
                key={signal.label}
                className="rounded-md border border-terminal-border px-3 py-2"
              >
                <div className="text-xs font-semibold text-terminal-fg">
                  {signal.label}
                </div>
                <p className="mt-1 text-[11px] leading-relaxed text-terminal-dim">
                  {signal.description}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs leading-relaxed text-terminal-dim">
            These signals help humans inspect public readiness. They do not
            promise external search outcomes, model answers, traffic, exposure,
            customers, or commercial outcomes.
          </p>
        </div>

        <div className="rounded-md border border-terminal-border bg-terminal-surface p-5">
          <div className="mb-3 flex items-center gap-2">
            <FileText className="h-4 w-4 text-terminal-muted" />
            <h2 className="text-sm font-semibold text-terminal-fg">
              Reviewed project sample
            </h2>
          </div>
          <div className="grid gap-2">
            {featuredProjects.map((project) => (
              <Link
                key={project.slug}
                href={`/projects/${project.slug}`}
                className="rounded-md border border-terminal-border px-3 py-3 transition-colors hover:border-terminal-ring hover:bg-terminal-elevated"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs font-semibold text-terminal-fg">
                      {project.name}
                    </div>
                    <p className="mt-1 text-[11px] leading-relaxed text-terminal-dim">
                      {project.tagline}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-sm border border-terminal-border px-2 py-1 font-mono text-[10px] uppercase text-terminal-dim">
                    {project.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
          <p className="mt-4 text-xs leading-relaxed text-terminal-dim">
            Public profile fields come from reviewed local records and public
            sources. Missing fields are not invented.
          </p>
        </div>
      </section>

      <section className="grid gap-4 rounded-md border border-terminal-border bg-terminal-elevated p-5 lg:grid-cols-2">
        <div>
          <h2 className="text-sm font-semibold text-terminal-fg">
            Founder workflow
          </h2>
          <p className="mt-3 text-xs leading-relaxed text-terminal-dim">
            Submit or correct public project information through human review,
            then use the geo-checker to run a public readiness check.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/submit"
              className="inline-flex items-center gap-1 rounded-md border border-terminal-ring px-3 py-2 text-xs text-terminal-fg transition-colors hover:bg-terminal-surface"
            >
              Submit project
              <ArrowRight className="h-3 w-3" />
            </Link>
            <Link
              href="/founders"
              className="inline-flex items-center gap-1 rounded-md border border-terminal-ring px-3 py-2 text-xs text-terminal-fg transition-colors hover:bg-terminal-surface"
            >
              Claim or correct
              <ArrowRight className="h-3 w-3" />
            </Link>
            <Link
              href="/geo-checker"
              className="inline-flex items-center gap-1 rounded-md border border-terminal-ring px-3 py-2 text-xs text-terminal-fg transition-colors hover:bg-terminal-surface"
            >
              Run geo-checker
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-terminal-fg">
            Research workflow
          </h2>
          <p className="mt-3 text-xs leading-relaxed text-terminal-dim">
            Use reviewed reports and the Alpha Feed boundary to understand
            public signal evidence. This page does not provide feed delivery,
            account enrollment, payment paths, or non-public field capture.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/reports"
              className="inline-flex items-center gap-1 rounded-md border border-terminal-ring px-3 py-2 text-xs text-terminal-fg transition-colors hover:bg-terminal-surface"
            >
              View reports
              <ArrowRight className="h-3 w-3" />
            </Link>
            <Link
              href="/alpha-feed"
              className="inline-flex items-center gap-1 rounded-md border border-terminal-ring px-3 py-2 text-xs text-terminal-fg transition-colors hover:bg-terminal-surface"
            >
              Read Alpha Feed evidence
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
