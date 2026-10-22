import {
  ConsolePageHeader,
  DiscoveryShell,
  EmptyState,
  EvidenceStat,
  ProjectAssetCard,
} from "@/components/public-ui";
import { searchPublishedProjectProjections } from "@/lib/projects/published-projection";
import { siteDescription, siteTitle } from "@/lib/seo";
import { ArrowLeft, ArrowRight, Search } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: siteTitle("Projects"),
  description: siteDescription(
    "Browse reviewed AI project profiles on 123Charts with public source links and timestamped review signals."
  ),
};

interface ProjectsPageProps {
  searchParams?: Promise<{
    q?: string;
    category?: string;
    tag?: string;
    page?: string;
  }>;
}

export default async function ProjectsPage(props: ProjectsPageProps) {
  const searchParams = await props.searchParams;
  const result = searchPublishedProjectProjections({
    query: searchParams?.q,
    category: searchParams?.category,
    tag: searchParams?.tag,
    page: Number(searchParams?.page ?? "1"),
  });
  const activeQuery = searchParams?.q?.trim() ?? "";
  const activeCategory = searchParams?.category?.trim() ?? "";
  const activeTag = searchParams?.tag?.trim() ?? "";

  return (
    <DiscoveryShell className="space-y-8">
      <ConsolePageHeader
        eyebrow="Reviewed project discovery"
        title="Projects"
        description="Search reviewed public project profiles. Results come from the published projection layer, use finite filters, and avoid ranking claims."
        action={
          <Link
            href="/methodology"
            className="inline-flex h-11 items-center rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 shadow-sm transition-colors hover:border-sky-300 hover:text-slate-950"
          >
            Methodology
          </Link>
        }
      />

      <form
        action="/projects"
        className="grid gap-3 rounded-[1.25rem] border border-slate-200 bg-white p-4 shadow-sm lg:grid-cols-[minmax(0,1fr)_240px_200px_auto]"
      >
        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
            Search
          </span>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              name="q"
              defaultValue={activeQuery}
              placeholder="Search AI projects, tasks, source signals..."
              className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm font-medium text-slate-950 outline-none transition-colors placeholder:text-slate-400 focus:border-sky-300 focus:bg-white"
            />
          </div>
        </label>

        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
            Category
          </span>
          <select
            name="category"
            defaultValue={activeCategory}
            className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-700 outline-none transition-colors focus:border-sky-300 focus:bg-white"
          >
            <option value="">All categories</option>
            {result.filters.categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
            Collection
          </span>
          <select
            name="tag"
            defaultValue={activeTag}
            className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-700 outline-none transition-colors focus:border-sky-300 focus:bg-white"
          >
            <option value="">All collections</option>
            {result.filters.tags.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
        </label>

        <div className="flex items-end gap-2">
          <button
            type="submit"
            className="inline-flex h-12 items-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
          >
            <Search className="h-4 w-4" />
            Search
          </button>
          {(activeQuery || activeCategory || activeTag) && (
            <Link
              href="/projects"
              className="inline-flex h-12 items-center rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-600 transition-colors hover:border-sky-300 hover:text-slate-950"
            >
              Reset
            </Link>
          )}
        </div>
      </form>

      <div className="grid gap-3 sm:grid-cols-3">
        <EvidenceStat
          label="Visible profiles"
          value={String(result.total)}
          detail="Reviewed published projections"
        />
        <EvidenceStat
          label="Pagination"
          value={`${result.page}/${result.pageCount}`}
          detail={`${result.pageSize} profiles per page`}
        />
        <EvidenceStat
          label="Ordering"
          value="Neutral"
          detail="No ranking or paid boost"
        />
      </div>

      {result.items.length === 0 ? (
        <EmptyState
          title="No public profiles matched"
          body="Adjust the query or finite filters. Records outside the reviewed published projection are not shown."
          action={
            <Link
              href="/projects"
              className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:border-sky-300 hover:text-slate-950"
            >
              Reset search
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {result.items.map((project, index) => (
            <ProjectAssetCard
              key={project.slug}
              project={project}
              featured={index === 0 && result.page === 1}
            />
          ))}
        </div>
      )}

      {result.pageCount > 1 && (
        <nav className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-5 text-sm">
          <PaginationLink
            href={paginationHref(searchParams, result.page - 1)}
            disabled={result.page <= 1}
            label="Previous"
            icon="previous"
          />
          <span className="font-medium text-slate-500">
            Page {result.page} of {result.pageCount}
          </span>
          <PaginationLink
            href={paginationHref(searchParams, result.page + 1)}
            disabled={result.page >= result.pageCount}
            label="Next"
            icon="next"
          />
        </nav>
      )}
    </DiscoveryShell>
  );
}

function paginationHref(
  searchParams: Awaited<ProjectsPageProps["searchParams"]>,
  page: number
) {
  const params = new URLSearchParams();
  if (searchParams?.q) params.set("q", searchParams.q);
  if (searchParams?.category) params.set("category", searchParams.category);
  if (searchParams?.tag) params.set("tag", searchParams.tag);
  params.set("page", String(page));
  return `/projects?${params.toString()}`;
}

function PaginationLink({
  href,
  disabled,
  label,
  icon,
}: {
  href: string;
  disabled: boolean;
  label: string;
  icon: "previous" | "next";
}) {
  const content = (
    <>
      {icon === "previous" && <ArrowLeft className="h-4 w-4" />}
      {label}
      {icon === "next" && <ArrowRight className="h-4 w-4" />}
    </>
  );

  if (disabled) {
    return (
      <span className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-4 font-semibold text-slate-300">
        {content}
      </span>
    );
  }

  return (
    <Link
      href={href}
      className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 font-semibold text-slate-600 shadow-sm transition-colors hover:border-sky-300 hover:text-slate-950"
    >
      {content}
    </Link>
  );
}
