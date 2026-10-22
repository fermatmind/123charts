import {
  CollectionCard,
  ConsolePageHeader,
  DiscoveryShell,
  EmptyState,
  EvidenceStat,
} from "@/components/public-ui";
import {
  getProjectsForCuratedCollection,
  getPublishedCuratedCollections,
} from "@/lib/collections/curated-collections";
import { siteDescription, siteTitle } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: siteTitle("Collections"),
  description: siteDescription(
    "Browse finite 123Charts collections assembled from reviewed published project projections."
  ),
};

export default function CollectionsPage() {
  const collections = getPublishedCuratedCollections();
  const collectionProjectCounts = collections.map((collection) =>
    getProjectsForCuratedCollection(collection).length
  );
  const totalProfiles = collectionProjectCounts.reduce(
    (sum, count) => sum + count,
    0
  );

  return (
    <DiscoveryShell className="space-y-8">
      <ConsolePageHeader
        eyebrow="Finite collection navigation"
        title="Collections"
        description="Collections group reviewed public profiles by explicit inclusion criteria. They support focused browsing without broad faceted page generation."
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <EvidenceStat
          label="Public collections"
          value={String(collections.length)}
          detail="Published and sitemap eligible"
        />
        <EvidenceStat
          label="Profile memberships"
          value={String(totalProfiles)}
          detail="Finite reviewed membership"
        />
        <EvidenceStat
          label="Page model"
          value="Curated"
          detail="No generated query pages"
        />
      </div>

      {collections.length === 0 ? (
        <EmptyState
          title="No public collections"
          body="Collections appear here only after they are published and sitemap eligible."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {collections.map((collection, index) => {
            const collectionProjects = getProjectsForCuratedCollection(collection);
            const accents = [
              "bg-sky-400",
              "bg-violet-500",
              "bg-emerald-500",
              "bg-amber-500",
            ];

            return (
              <CollectionCard
                key={collection.slug}
                collection={collection}
                projectCount={collectionProjects.length}
                representativeProjects={collectionProjects}
                accentClassName={accents[index % accents.length]}
                className="rounded-[1.25rem] border-slate-200"
              />
            );
          })}
        </div>
      )}
    </DiscoveryShell>
  );
}
