import { notFound } from "next/navigation";
import ProjectCard from "@/components/project-card";
import {
  getProjectsForTaskDiscoveryEntry,
  getPublishedTaskDiscoveryEntries,
  getTaskDiscoveryEntryBySlug,
} from "@/lib/tasks/task-discovery";
import { collectionPageJSONLD } from "@/lib/structured-data";
import { siteDescription, siteTitle } from "@/lib/seo";
import { CalendarCheck, ClipboardList, Filter, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";

interface TaskDiscoveryPageProps {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

export async function generateStaticParams() {
  return getPublishedTaskDiscoveryEntries().map((entry) => ({
    slug: entry.slug,
  }));
}

export async function generateMetadata(props: TaskDiscoveryPageProps): Promise<Metadata> {
  const params = await props.params;
  const entry = getTaskDiscoveryEntryBySlug(params.slug);
  const projects = entry ? getProjectsForTaskDiscoveryEntry(entry) : [];

  if (
    !entry ||
    entry.status !== "published" ||
    !entry.sitemapEligible ||
    projects.length < entry.minimumReviewedProjects
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
      canonical: `/tasks/${entry.slug}`,
    },
    robots: { index: true, follow: true },
  };
}

export default async function TaskDiscoveryPage(props: TaskDiscoveryPageProps) {
  const params = await props.params;
  const entry = getTaskDiscoveryEntryBySlug(params.slug);

  if (!entry || entry.status !== "published" || !entry.sitemapEligible) {
    notFound();
  }

  const projects = getProjectsForTaskDiscoveryEntry(entry);

  if (projects.length < entry.minimumReviewedProjects) {
    notFound();
  }

  const baseUrl = process.env.APP_URL ?? "http://localhost:3000";
  const pageUrl = `${baseUrl}/tasks/${entry.slug}`;
  const taskLD = collectionPageJSONLD(
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(taskLD) }}
      />

      <section className="mb-10">
        <div className="mb-2 flex items-center gap-2">
          <ClipboardList className="h-4 w-4 text-terminal-muted" />
          <span className="text-[10px] font-mono uppercase tracking-widest text-terminal-dim">
            Task Discovery
          </span>
        </div>
        <h1 className="mb-4 text-2xl font-bold tracking-tight text-terminal-fg">
          {entry.title}
        </h1>
        <p className="max-w-3xl text-sm leading-relaxed text-terminal-muted">
          {entry.summary}
        </p>
      </section>

      <div className="mb-10 grid gap-6 sm:grid-cols-2">
        <section className="rounded-lg border border-terminal-border bg-terminal-surface p-5">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-terminal-fg">
            <Filter className="h-4 w-4 text-terminal-muted" />
            Inclusion Criteria
          </h2>
          <p className="text-xs leading-relaxed text-terminal-dim">
            {entry.inclusionCriteria}
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

      <section className="mb-10">
        <h2 className="mb-4 text-sm font-semibold text-terminal-fg">
          Reviewed Projects for This Task
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
          {entry.whyIncluded}
        </p>
      </section>

      <div className="mb-6 flex items-center gap-2 rounded-lg border border-terminal-border bg-terminal-surface p-4">
        <CalendarCheck className="h-4 w-4 shrink-0 text-terminal-dim" />
        <p className="text-xs text-terminal-dim">
          Last reviewed: {entry.lastReviewed}
        </p>
      </div>

      <section className="rounded-lg border border-terminal-border bg-terminal-surface p-5">
        <h2 className="mb-2 text-sm font-semibold text-terminal-fg">
          Methodology
        </h2>
        <p className="mb-3 text-xs leading-relaxed text-terminal-dim">
          {entry.methodologyNote}
        </p>
        <p className="text-xs leading-relaxed text-terminal-dim">
          {entry.sourceNotes}
        </p>
      </section>
    </div>
  );
}
