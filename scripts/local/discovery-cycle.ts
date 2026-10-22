import { createHash } from "node:crypto";
import { profileReady } from "../../lib/charts/discovery";
export async function ensureDiscoveryCycle(db: any, demo: boolean) {
  const day = new Date().toISOString().slice(0, 10);
  const old = await db
    .from("charts_discovery_cycles")
    .select("pool")
    .eq("day", day)
    .eq("demo", demo)
    .maybeSingle();
  if (old.error) throw old.error;
  if (old.data?.pool?.length) return old.data.pool;
  const { data: all, error } = await db
    .from("charts_projects")
    .select("*")
    .eq("publication", "published")
    .eq("demo", demo);
  if (error) throw error;
  const since = new Date(Date.parse(day) - 7 * 86400000).toISOString();
  const [events, contributions] = await Promise.all([
    db
      .from("charts_events")
      .select("project_id")
      .eq("kind", "impression")
      .eq("excluded", false)
      .gte("created_at", since)
      .lt("created_at", day)
      .limit(50000),
    db
      .from("charts_contributions")
      .select("project_id")
      .eq("eligible", true)
      .eq("demo", demo)
      .gte(
        "adopted_at",
        new Date(Date.parse(day) - 30 * 86400000).toISOString(),
      )
      .lt("adopted_at", day),
  ]);
  if (events.error || contributions.error)
    throw events.error || contributions.error;
  const counts = new Map<string, number>();
  for (const e of events.data)
    counts.set(e.project_id, (counts.get(e.project_id) || 0) + 1);
  const hash = (s: string) => createHash("sha256").update(s).digest("hex");
  const pool = all.filter(profileReady).map((p: any) => ({
    id: p.id,
    group: hash(p.controller_id || p.domain),
    exposure: counts.get(p.id) || 0,
    fresh:
      !p.first_publication_inferred &&
      Date.parse(p.first_published_at) > Date.parse(day) - 30 * 86400000,
    contributor: contributions.data.some((c: any) => c.project_id === p.id),
    tie: hash(day + p.id),
  }));
  const save = await db
    .from("charts_discovery_cycles")
    .upsert(
      { day, demo, pool },
      { onConflict: "day,demo", ignoreDuplicates: true },
    );
  if (save.error) throw save.error;
  if (old.data && pool.length) {
    const fill = await db
      .from("charts_discovery_cycles")
      .update({ pool })
      .eq("day", day)
      .eq("demo", demo)
      .eq("pool", JSON.stringify([]));
    if (fill.error) throw fill.error;
  }

  const result = await db
    .from("charts_discovery_cycles")
    .select("pool")
    .eq("day", day)
    .eq("demo", demo)
    .single();
  if (result.error) throw result.error;
  return result.data.pool;
}
