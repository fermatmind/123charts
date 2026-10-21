import { notFound } from "next/navigation";
import ProjectCard from "@/components/project-card";
import {
  getCuratedAlternativesBySlug,
  getProjectsForCuratedAlternatives,
  getPublishedCuratedAlternatives,
} from "@/lib/alternatives/curated-alternatives";
import { collectionPageJSONLD } from "@/lib/structured-data";
import { siteDescription, siteTitle } from "@/lib/seo";
import { ArrowLeftRight, CalendarCheck, FileText, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";

interface CuratedAlternativesPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getPublishedCuratedAlternatives().map((entry) => ({
    slug: entry.canonicalSlug,
  }));
}

export async function generateMetadata(props: CuratedAlternativesPageProps): Promise<Metadata> {
  const params = await props.params;
  const entry = getCuratedAlternativesBySlug(params.slug);
  const projects = entry ? getProjectsForCuratedAlternatives(entry) : [];

  if (
    !entry ||
    entry.status !== "published" ||
    !entry.sitemapEligible ||
    projects.length !== 2
  ) {
    return {
      title: "Not Found",
      robots: { index: false, follow: false },
    };
  }

  return {
    title: siteTitle(entry.title),
    description: siteDescription(entry.summary),
    alternates: {
      canonical: entry.canonicalPath,
    },
    robots: { index: true, follow: true },
  };
}

export default async function CuratedAlternativesPage(props: CuratedAlternativesPageProps) {
  const params = await props.params;
  const entry = getCuratedAlternativesBySlug(params.slug);

  if (!entry || entry.status !== "published" || !entry.sitemapEligible) {
    notFound();
  }

  const projects = getProjectsForCuratedAlternatives(entry);

  if (projects.length !== 2) {
    notFound();
  }

  const baseUrl = process.env.APP_URL ?? "http://localhost:3000";
  const pageUrl = `${baseUrl}${entry.canonicalPath}`;
  const alternativesLD = collectionPageJSONLD(
    pageUrl,
    entry.title,
    entry.summary,
    projects.map((project) => ({
      url: `${baseUrl}/projects/${project.slug}`,
      name: project.name,
    }))
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(alternativesLD) }}
      />

      <section className="mb-10">
        <div className="mb-2 flex items-center gap-2">
          <ArrowLeftRight className="h-4 w-4 text-terminal-muted" />
          <span className="text-[10px] font-mono uppercase tracking-widest text-terminal-dim">
            Curated Alternatives
          </span>
        </div>
        <h1 className="mb-4 text-2xl font-bold tracking-tight text-terminal-fg">
          {entry.title}
        </h1>
        <p className="max-w-3xl text-sm leading-relaxed text-terminal-muted">
          {entry.summary}
        </p>
      </section>

      <section className="mb-10">
        <h2 className="mb-4 text-sm font-semibold text-terminal-fg">
          Published Projects in This Comparison
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {projects.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      </section>

      <div className="mb-10 grid gap-6 sm:grid-cols-2">
        <section className="rounded-lg border border-terminal-border bg-terminal-surface p-5">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-terminal-fg">
            <FileText className="h-4 w-4 text-terminal-muted" />
            Neutral Rationale
          </h2>
          <p className="text-xs leading-relaxed text-terminal-dim">
            {entry.neutralRationale}
          </p>
        </section>

        <section className="rounded-lg border border-terminal-border bg-terminal-surface p-5">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-terminal-fg">
            <ShieldCheck className="h-4 w-4 text-terminal-muted" />
            Boundary
          </h2>
          <p className="text-xs leading-relaxed text-terminal-dim">
            {entry.boundaryNote}
          </p>
        </section>
      </div>

      <div className="mb-6 flex items-center gap-2 rounded-lg border border-terminal-border bg-terminal-surface p-4">
        <CalendarCheck className="h-4 w-4 shrink-0 text-terminal-dim" />
        <p className="text-xs text-terminal-dim">
          Last reviewed: {entry.lastReviewed}
        </p>
      </div>

      <section className="rounded-lg border border-terminal-border bg-terminal-surface p-5">
        <h2 className="mb-2 text-sm font-semibold text-terminal-fg">
          Source Notes
        </h2>
        <p className="text-xs leading-relaxed text-terminal-dim">
          {entry.sourceNotes}
        </p>
      </section>
    </div>
  );
}
