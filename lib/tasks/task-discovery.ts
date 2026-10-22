import {
  getProjectBySlug,
  type DemoProject,
} from "@/lib/demo-projects";
import { INDEXABLE_STATES } from "@/lib/constants";

export const TASK_DISCOVERY_MINIMUM_PROJECTS = 3;

export const TASK_DISCOVERY_ROUTE_CAP_V0 = 1;

export const TASK_DISCOVERY_STATUSES = [
  "draft",
  "noindex",
  "published",
  "archived",
] as const;

export type TaskDiscoveryStatus =
  (typeof TASK_DISCOVERY_STATUSES)[number];

export interface TaskDiscoveryEntry {
  slug: string;
  title: string;
  summary: string;
  intent: string;
  status: TaskDiscoveryStatus;
  sitemapEligible: boolean;
  lastReviewed: string;
  minimumReviewedProjects: number;
  projectSlugs: string[];
  inclusionCriteria: string;
  whyIncluded: string;
  methodologyNote: string;
  boundaryNote: string;
  sourceNotes: string;
}

const taskDiscoveryEntries: TaskDiscoveryEntry[] = [
  {
    slug: "evaluate-ai-builder-infrastructure",
    title: "Evaluate AI Builder Infrastructure",
    summary:
      "Reviewed 123Charts projects that help builders evaluate AI development, model workflow, and infrastructure options from public signals.",
    intent:
      "Find source-linked AI projects relevant to builder infrastructure evaluation.",
    status: "published",
    sitemapEligible: true,
    lastReviewed: "2026-06-20",
    minimumReviewedProjects: TASK_DISCOVERY_MINIMUM_PROJECTS,
    projectSlugs: ["aurora-code", "nucleus-ml", "vectorbase"],
    inclusionCriteria:
      "Projects must be manually selected from reviewed local 123Charts records, use a public-safe lifecycle state, and include public source links relevant to builder infrastructure evaluation.",
    whyIncluded:
      "Aurora Code, Nucleus ML, and VectorBase are reviewed local records with public source links and builder-facing infrastructure context.",
    methodologyNote:
      "Task discovery pages are finite allowlisted routes backed by reviewed local project records. They are not generated from request inputs, remote source scans, broad templates, arbitrary tags, or paid placement.",
    boundaryNote:
      "This page is a discovery surface for reviewed public signals. It does not provide professional, legal, financial, medical, compliance, security, or procurement advice.",
    sourceNotes:
      "Project cards link to existing 123Charts public profiles. Public source links remain on the project profile pages.",
  },
  {
    slug: "review-model-search-infrastructure",
    title: "Review Model and Search Infrastructure",
    summary:
      "Deferred task candidate for model workflow, vector search, and infrastructure review.",
    intent:
      "Find source-linked projects connected to model workflow and semantic search.",
    status: "noindex",
    sitemapEligible: false,
    lastReviewed: "2026-06-20",
    minimumReviewedProjects: TASK_DISCOVERY_MINIMUM_PROJECTS,
    projectSlugs: ["nucleus-ml", "vectorbase"],
    inclusionCriteria:
      "Deferred until at least three reviewed public-safe project records are available.",
    whyIncluded:
      "Current reviewed sample count is below the first-wave task threshold.",
    methodologyNote:
      "Deferred candidates are retained only as implementation guardrails and are not exposed as public task pages.",
    boundaryNote:
      "Under-threshold candidates must remain absent from sitemap.",
    sourceNotes: "No public route is generated for this candidate.",
  },
  {
    slug: "review-analytics-operations-tools",
    title: "Review Analytics and Operations Tools",
    summary:
      "Deferred task candidate for analytics, operations, and readiness workflows.",
    intent:
      "Find source-linked projects connected to analytics and operations evaluation.",
    status: "noindex",
    sitemapEligible: false,
    lastReviewed: "2026-06-20",
    minimumReviewedProjects: TASK_DISCOVERY_MINIMUM_PROJECTS,
    projectSlugs: ["pulse-analytics", "complykit"],
    inclusionCriteria:
      "Deferred until at least three reviewed public-safe project records are available.",
    whyIncluded:
      "Current reviewed sample count is below the first-wave task threshold.",
    methodologyNote:
      "Deferred candidates are retained only as implementation guardrails and are not exposed as public task pages.",
    boundaryNote:
      "Under-threshold candidates must remain absent from sitemap.",
    sourceNotes: "No public route is generated for this candidate.",
  },
  {
    slug: "choose-local-on-device-productivity",
    title: "Choose Local and On-Device Productivity Tools",
    summary:
      "Deferred task candidate for local-first productivity project discovery.",
    intent:
      "Find source-linked projects connected to local or on-device productivity.",
    status: "noindex",
    sitemapEligible: false,
    lastReviewed: "2026-06-20",
    minimumReviewedProjects: TASK_DISCOVERY_MINIMUM_PROJECTS,
    projectSlugs: ["scribe-ai"],
    inclusionCriteria:
      "Deferred until at least three reviewed public-safe project records are available.",
    whyIncluded:
      "Current reviewed sample count is below the first-wave task threshold.",
    methodologyNote:
      "Deferred candidates are retained only as implementation guardrails and are not exposed as public task pages.",
    boundaryNote:
      "Under-threshold candidates must remain absent from sitemap.",
    sourceNotes: "No public route is generated for this candidate.",
  },
  {
    slug: "compare-open-source-ai-project-tooling",
    title: "Compare Open-Source AI Project Tooling",
    summary:
      "Deferred task candidate for source-linked AI project tooling review.",
    intent:
      "Find source-linked AI project tooling records for discovery and review.",
    status: "noindex",
    sitemapEligible: false,
    lastReviewed: "2026-06-20",
    minimumReviewedProjects: TASK_DISCOVERY_MINIMUM_PROJECTS,
    projectSlugs: ["aurora-code", "vectorbase"],
    inclusionCriteria:
      "Deferred until at least three reviewed public-safe project records are available.",
    whyIncluded:
      "Current reviewed sample count is below the first-wave task threshold.",
    methodologyNote:
      "Deferred candidates are retained only as implementation guardrails and are not exposed as public task pages.",
    boundaryNote:
      "Under-threshold candidates must remain absent from sitemap.",
    sourceNotes: "No public route is generated for this candidate.",
  },
];

export function getAllTaskDiscoveryEntries(): TaskDiscoveryEntry[] {
  return taskDiscoveryEntries;
}

export function getPublishedTaskDiscoveryEntries(): TaskDiscoveryEntry[] {
  return taskDiscoveryEntries.filter((entry) => {
    const projects = getProjectsForTaskDiscoveryEntry(entry);

    return (
      entry.status === "published" &&
      entry.sitemapEligible &&
      projects.length >= entry.minimumReviewedProjects
    );
  });
}

export function getTaskDiscoveryEntryBySlug(
  slug: string
): TaskDiscoveryEntry | undefined {
  return taskDiscoveryEntries.find((entry) => entry.slug === slug);
}

export function getProjectsForTaskDiscoveryEntry(
  entry: TaskDiscoveryEntry
): DemoProject[] {
  return entry.projectSlugs
    .map((slug) => getProjectBySlug(slug))
    .filter(
      (project): project is DemoProject =>
        project !== undefined && INDEXABLE_STATES.has(project.status)
    );
}
