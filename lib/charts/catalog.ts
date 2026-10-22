import "server-only";
import { unstable_cache, revalidateTag } from "next/cache";
import { adminDb, checked } from "./server";
import type { Dataset, Project, Relation } from "./types";
export const PUBLIC_TAGS = ["catalog:public", "public-index"];
const cachedCatalog = unstable_cache(
  async (dataset: Dataset, revision: number) => {
    void revision;
    const db = adminDb(),
      demo = dataset === "demo";
    const [products, categories, relations] = await Promise.all([
      db
        .from("products")
        .select("*")
        .eq("demo", demo)
        .order("name")
        .limit(1000),
      db.from("catalog_categories").select("*").order("slug"),
      db
        .from("competitor_relations")
        .select("*")
        .eq("demo", demo)
        .order("peer_domain")
        .limit(3000),
    ]);
    return {
      projects: checked(products) as Project[],
      categories: checked(categories),
      relations: checked(relations) as Relation[],
    };
  },
  ["123charts-public-catalog-v2"],
  { tags: PUBLIC_TAGS, revalidate: 30 },
);
export async function publicCatalog(dataset: Dataset) {
  const db = adminDb();
  // A committed revision also fences concurrent cache fills from before approval.
  const revisions = checked(
    await db
      .from("charts_cache_invalidations")
      .select("id")
      .order("id", { ascending: false })
      .limit(1),
  );
  const cached = await cachedCatalog(dataset, revisions[0]?.id ?? 0);
  // Uncached publication fences also protect removals while an invalidation is being retried.
  const live = checked(
    await db
      .from("products")
      .select("id")
      .eq("demo", dataset === "demo"),
  );
  const ids = new Set(live.map((p) => p.id));
  const relationIds = new Set(
    checked(
      await db
        .from("competitor_relations")
        .select("id")
        .eq("demo", dataset === "demo"),
    ).map((r) => r.id),
  );
  return {
    ...cached,
    projects: cached.projects.filter((p) => ids.has(p.id)),
    relations: cached.relations.filter(
      (r) => relationIds.has(r.id) && ids.has(r.project_id!),
    ),
  };
}
export async function flushCatalog() {
  const db = adminDb();
  const pending = checked(
    await db
      .from("charts_cache_invalidations")
      .select("id")
      .is("processed_at", null)
      .order("id")
      .limit(300),
  );
  try {
    for (const tag of PUBLIC_TAGS) revalidateTag(tag, { expire: 0 });
    if (pending.length)
      checked(
        await db
          .from("charts_cache_invalidations")
          .update({ processed_at: new Date().toISOString(), error: null })
          .in(
            "id",
            pending.map((r) => r.id),
          ),
      );
    return { refreshed: true };
  } catch (e) {
    if (pending.length)
      await db
        .from("charts_cache_invalidations")
        .update({ error: (e as Error).message.slice(0, 300) })
        .in(
          "id",
          pending.map((r) => r.id),
        );
    return { refreshed: false, pending: true };
  }
}
