import { notFound } from "next/navigation";
import {
  getPublishedProjectBySlug,
  getPublishedProjectProjections,
} from "@/lib/projects/published-projection";
import { isProjectSitemapEligible } from "@/lib/projects/search-index";
import { getPublishedCuratedAlternatives } from "@/lib/alternatives/curated-alternatives";
import { siteTitle } from "@/lib/seo";
import {
  DiscoveryShell,
  EntityScopePanel,
  EvidencePanel,
  ProjectDetailHero,
  ProjectOfficialLinks,
  ProjectSignalPill,
  PublicSignalChecklist,
  formatModel,
  formatReviewDate,
} from "@/components/public-ui";
import Link from "next/link";
import { ArrowRight, BookOpen, GitBranch, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";

interface ProjectPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getPublishedProjectProjections().map((project) => ({
    slug: project.slug,
  }));
}

export async function generateMetadata(props: ProjectPageProps): Promise<Metadata> {
  const params = await props.params;
  const project = getPublishedProjectBySlug(params.slug);
  if (!project) return { title: "Not Found" };

  return {
    title: siteTitle(project.project_name),
    description: project.original_summary,
    alternates: {
      canonical: `/projects/${project.slug}`,
    },
    robots: isProjectSitemapEligible(project)
      ? { index: true, follow: true }
      : { index: false, follow: true },
  };
}

export default async function ProjectPage(props: ProjectPageProps) {
  const params = await props.params;
  const project = getPublishedProjectBySlug(params.slug);
  if (!project) notFound();

  const reviewedAlternatives = getPublishedCuratedAlternatives().filter(
    (entry) =>
      entry.leftProjectSlug === project.slug ||
      entry.rightProjectSlug === project.slug
  );

  return (
    <DiscoveryShell className="space-y-8">
      <ProjectDetailHero project={project} />

      <div className="grid gap-4 lg:grid-cols-3">
        <EntityScopePanel
          rows={[
            { label: "Profile", value: "Published projection" },
            { label: "Lifecycle", value: project.lifecycle_status },
            { label: "Category", value: project.primary_category },
            {
              label: "Model",
              value: formatModel(project.open_source_or_commercial),
            },
            {
              label: "Last reviewed",
              value: formatReviewDate(project.last_reviewed_at),
            },
          ]}
        />

        <EvidencePanel
          title="Source links"
          icon={<GitBranch className="h-4 w-4 text-slate-500" />}
        >
          <ProjectOfficialLinks project={project} />
        </EvidencePanel>

        <PublicSignalChecklist project={project} />
      </div>

      <EvidencePanel
        title="Detail page content structure"
        icon={<BookOpen className="h-4 w-4 text-slate-500" />}
      >
        <div className="mb-5 flex flex-wrap gap-2">
          {[
            "Overview",
            "Source links",
            "Public signals",
            "Collections",
            "Alternatives",
            "Correction path",
          ].map((label) => (
            <ProjectSignalPill key={label} label={label} tone="slate" />
          ))}
        </div>
        <ol className="grid gap-2 text-sm leading-6 text-slate-600">
          <li>1. Neutral summary: original public profile text.</li>
          <li>2. Entity scope: project category, lifecycle, and model.</li>
          <li>3. Source links: official site, docs, and public repository when available.</li>
          <li>4. Collections: finite reviewed discovery paths.</li>
          <li>5. Alternatives: curated and evidence-bounded when available.</li>
        </ol>
      </EvidencePanel>

      <div className="grid gap-4 lg:grid-cols-2">
        <EvidencePanel title="Collections">
          {project.collection_tags.length === 0 ? (
            <p className="text-sm leading-6 text-slate-500">
              No public collection membership is attached to this profile.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {project.collection_tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/collections/${tag}`}
                  className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-semibold text-slate-600 transition-colors hover:border-sky-300 hover:text-slate-950"
                >
                  {tag}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              ))}
            </div>
          )}
          <p className="mt-4 text-xs leading-5 text-slate-400">
            Collections are finite discovery paths, not broad generated pages.
          </p>
        </EvidencePanel>

        <EvidencePanel title="Reviewed alternatives">
          {reviewedAlternatives.length === 0 ? (
            <p className="text-sm leading-6 text-slate-500">
              No reviewed alternatives entry is attached to this projection.
            </p>
          ) : (
            <ul className="grid gap-2">
              {reviewedAlternatives.map((entry) => (
                <li key={entry.canonicalSlug}>
                  <Link
                    href={entry.canonicalPath}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 transition-colors hover:text-slate-950"
                  >
                    {entry.title}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-4 text-xs leading-5 text-slate-400">
            Alternatives are neutral references, not subjective rankings.
          </p>
        </EvidencePanel>
      </div>

      <EvidencePanel
        title="Correction path"
        icon={<ShieldCheck className="h-4 w-4 text-slate-500" />}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-2xl text-sm leading-6 text-slate-600">
            Founders can request public profile corrections after a claim
            review. Claim review stays separate from public indexing and does
            not expose non-public workspace material.
          </p>
          <Link
            href={`/claim/${project.slug}`}
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition-colors hover:border-sky-300 hover:text-slate-950"
          >
            <ShieldCheck className="h-4 w-4" />
            Claim project
          </Link>
        </div>
      </EvidencePanel>
    </DiscoveryShell>
  );
}
