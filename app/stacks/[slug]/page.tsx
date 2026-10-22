import { notFound } from "next/navigation";
import ProjectCard from "@/components/project-card";
import {
  getProjectsForStackCluster,
  getPublishedStackClusters,
  getStackClusterBySlug,
} from "@/lib/stacks/tech-stack-clusters";
import { collectionPageJSONLD } from "@/lib/structured-data";
import { siteDescription, siteTitle } from "@/lib/seo";
import { Boxes, CalendarCheck, Filter, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";

interface StackClusterPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getPublishedStackClusters().map((cluster) => ({
    slug: cluster.slug,
  }));
}

export async function generateMetadata(props: StackClusterPageProps): Promise<Metadata> {
  const params = await props.params;
  const cluster = getStackClusterBySlug(params.slug);

  const projects = cluster ? getProjectsForStackCluster(cluster) : [];

  if (
    !cluster ||
    cluster.status !== "published" ||
    !cluster.sitemapEligible ||
    projects.length === 0
  ) {
    return {
      title: "Not Found",
      robots: { index: false, follow: false },
    };
  }

  return {
    title: siteTitle(cluster.title),
    description: siteDescription(cluster.summary),
    robots: { index: true, follow: true },
  };
}

export default async function StackClusterPage(props: StackClusterPageProps) {
  const params = await props.params;
  const cluster = getStackClusterBySlug(params.slug);

  if (!cluster || cluster.status !== "published" || !cluster.sitemapEligible) {
    notFound();
  }

  const projects = getProjectsForStackCluster(cluster);

  if (projects.length === 0) {
    notFound();
  }

  const baseUrl = process.env.APP_URL ?? "http://localhost:3000";
  const pageUrl = `${baseUrl}/stacks/${cluster.slug}`;
  const clusterLD = collectionPageJSONLD(
    pageUrl,
    cluster.title,
    cluster.summary,
    projects.map((project) => ({
      url: `${baseUrl}/projects/${project.slug}`,
      name: project.name,
    }))
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(clusterLD) }}
      />

      <section className="mb-10">
        <div className="mb-2 flex items-center gap-2">
          <Boxes className="h-4 w-4 text-terminal-muted" />
          <span className="text-[10px] font-mono uppercase tracking-widest text-terminal-dim">
            Tech Stack Cluster
          </span>
        </div>
        <h1 className="mb-4 text-2xl font-bold tracking-tight text-terminal-fg">
          {cluster.title}
        </h1>
        <p className="max-w-3xl text-sm leading-relaxed text-terminal-muted">
          {cluster.summary}
        </p>
      </section>

      <div className="mb-10 grid gap-6 sm:grid-cols-2">
        <section className="rounded-lg border border-terminal-border bg-terminal-surface p-5">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-terminal-fg">
            <Filter className="h-4 w-4 text-terminal-muted" />
            Inclusion Criteria
          </h2>
          <p className="text-xs leading-relaxed text-terminal-dim">
            {cluster.inclusionCriteria}
          </p>
        </section>

        <section className="rounded-lg border border-terminal-border bg-terminal-surface p-5">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-terminal-fg">
            <ShieldCheck className="h-4 w-4 text-terminal-muted" />
            Why These Projects Are Included
          </h2>
          <p className="text-xs leading-relaxed text-terminal-dim">
            {cluster.whyIncluded}
          </p>
        </section>
      </div>

      <section className="mb-10">
        <h2 className="mb-4 text-sm font-semibold text-terminal-fg">
          Published Projects in This Stack
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      </section>

      <div className="mb-6 flex items-center gap-2 rounded-lg border border-terminal-border bg-terminal-surface p-4">
        <CalendarCheck className="h-4 w-4 shrink-0 text-terminal-dim" />
        <p className="text-xs text-terminal-dim">
          Last reviewed: {cluster.lastReviewed}
        </p>
      </div>

      <section className="rounded-lg border border-terminal-border bg-terminal-surface p-5">
        <h2 className="mb-2 text-sm font-semibold text-terminal-fg">
          Methodology
        </h2>
        <p className="text-xs leading-relaxed text-terminal-dim">
          {cluster.methodologyNote}
        </p>
      </section>
    </div>
  );
}
