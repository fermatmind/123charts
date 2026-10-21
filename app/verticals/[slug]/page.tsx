import { notFound } from "next/navigation";
import ProjectCard from "@/components/project-card";
import {
  getProjectsForVerticalAssetGrid,
  getPublishedVerticalAssetGrids,
  getVerticalAssetGridBySlug,
} from "@/lib/verticals/vertical-asset-grids";
import { collectionPageJSONLD } from "@/lib/structured-data";
import { siteDescription, siteTitle } from "@/lib/seo";
import { Compass, Filter, ShieldCheck, CalendarCheck } from "lucide-react";
import type { Metadata } from "next";

interface VerticalAssetGridPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getPublishedVerticalAssetGrids().map((grid) => ({
    slug: grid.slug,
  }));
}

export async function generateMetadata(props: VerticalAssetGridPageProps): Promise<Metadata> {
  const params = await props.params;
  const grid = getVerticalAssetGridBySlug(params.slug);
  const projects = grid ? getProjectsForVerticalAssetGrid(grid) : [];

  if (
    !grid ||
    grid.status !== "published" ||
    !grid.sitemapEligible ||
    projects.length < grid.minimumPublishedProjects
  ) {
    return {
      title: "Not Found",
      robots: { index: false, follow: false },
    };
  }

  return {
    title: siteTitle(grid.title),
    description: siteDescription(grid.summary),
    robots: { index: true, follow: true },
  };
}

export default async function VerticalAssetGridPage(props: VerticalAssetGridPageProps) {
  const params = await props.params;
  const grid = getVerticalAssetGridBySlug(params.slug);

  if (!grid || grid.status !== "published" || !grid.sitemapEligible) {
    notFound();
  }

  const projects = getProjectsForVerticalAssetGrid(grid);

  if (projects.length < grid.minimumPublishedProjects) {
    notFound();
  }

  const baseUrl = process.env.APP_URL ?? "http://localhost:3000";
  const pageUrl = `${baseUrl}/verticals/${grid.slug}`;
  const gridLD = collectionPageJSONLD(
    pageUrl,
    grid.title,
    grid.summary,
    projects.map((project) => ({
      url: `${baseUrl}/projects/${project.slug}`,
      name: project.name,
    }))
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(gridLD) }}
      />

      <section className="mb-10">
        <div className="mb-2 flex items-center gap-2">
          <Compass className="h-4 w-4 text-terminal-muted" />
          <span className="text-[10px] font-mono uppercase tracking-widest text-terminal-dim">
            Vertical Asset Grid
          </span>
        </div>
        <h1 className="mb-4 text-2xl font-bold tracking-tight text-terminal-fg">
          {grid.title}
        </h1>
        <p className="max-w-3xl text-sm leading-relaxed text-terminal-muted">
          {grid.summary}
        </p>
      </section>

      <div className="mb-10 grid gap-6 sm:grid-cols-2">
        <section className="rounded-lg border border-terminal-border bg-terminal-surface p-5">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-terminal-fg">
            <Filter className="h-4 w-4 text-terminal-muted" />
            Inclusion Criteria
          </h2>
          <p className="text-xs leading-relaxed text-terminal-dim">
            {grid.inclusionCriteria}
          </p>
        </section>

        <section className="rounded-lg border border-terminal-border bg-terminal-surface p-5">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-terminal-fg">
            <ShieldCheck className="h-4 w-4 text-terminal-muted" />
            Boundary
          </h2>
          <p className="text-xs leading-relaxed text-terminal-dim">
            {grid.boundaryNote}
          </p>
        </section>
      </div>

      <section className="mb-10">
        <h2 className="mb-4 text-sm font-semibold text-terminal-fg">
          Published Projects in This Vertical
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      </section>

      <section className="mb-10 rounded-lg border border-terminal-border bg-terminal-surface p-5">
        <h2 className="mb-2 text-sm font-semibold text-terminal-fg">
          Why These Projects Are Included
        </h2>
        <p className="text-xs leading-relaxed text-terminal-dim">
          {grid.whyIncluded}
        </p>
      </section>

      <div className="mb-6 flex items-center gap-2 rounded-lg border border-terminal-border bg-terminal-surface p-4">
        <CalendarCheck className="h-4 w-4 shrink-0 text-terminal-dim" />
        <p className="text-xs text-terminal-dim">
          Last reviewed: {grid.lastReviewed}
        </p>
      </div>

      <section className="rounded-lg border border-terminal-border bg-terminal-surface p-5">
        <h2 className="mb-2 text-sm font-semibold text-terminal-fg">
          Methodology
        </h2>
        <p className="text-xs leading-relaxed text-terminal-dim">
          {grid.methodologyNote}
        </p>
      </section>
    </div>
  );
}
