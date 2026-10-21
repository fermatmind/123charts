import type { Project, Traffic, SnapshotEntry, Membership } from "./types";
export function check<T>(r: {
  data: T | null;
  error: { message: string } | null;
}): NonNullable<T> {
  if (r.error) throw new Error(r.error.message);
  return r.data as NonNullable<T>;
}
export function rankCategory(
  projects: Project[],
  members: Membership[],
  traffic: Traffic[],
) {
  const allowed = new Map(
    members
      .filter((m) => m.state === "confirmed")
      .map((m) => [m.project_id, m]),
  );
  const candidates = projects.filter((p) => allowed.has(p.id));
  candidates.sort((a, b) => a.id.localeCompare(b.id));
  const byDomain = new Map(
    traffic.filter((t) => t.state === "verified").map((t) => [t.domain, t]),
  );
  const conflicts = new Set(
    traffic.filter((t) => t.state === "conflict").map((t) => t.domain),
  );
  const exclusions = candidates.flatMap((p) => {
    const m = allowed.get(p.id)!;
    const reason =
      m.placement === "general"
        ? "general_platform"
        : m.placement === "scope_unknown"
          ? "scope_unknown"
          : conflicts.has(p.measurement_domain)
            ? "conflict"
            : !byDomain.has(p.measurement_domain)
              ? "missing_current_month"
              : null;
    return reason ? [{ project_id: p.id, reason }] : [];
  });
  const excluded = new Set(exclusions.map((e) => e.project_id));
  const seen = new Set<string>();
  let groupLower: number | null = null,
    rank = 0;
  const entries: SnapshotEntry[] = candidates
    .filter((p) => !excluded.has(p.id))
    .sort(
      (a, b) =>
        byDomain.get(b.measurement_domain)!.value -
          byDomain.get(a.measurement_domain)!.value ||
        a.domain.localeCompare(b.domain),
    )
    .filter((p) => {
      if (seen.has(p.measurement_domain)) return false;
      seen.add(p.measurement_domain);
      return true;
    })
    .map((p, i) => {
      const t = byDomain.get(p.measurement_domain)!;
      const step = Number(t.precision_step ?? 1),
        lower = t.value - (step > 1 ? step / 2 : 0),
        upper = t.value + (step > 1 ? step / 2 : 0);
      if (groupLower === null || upper < groupLower) {
        rank = i + 1;
        groupLower = lower;
      } else groupLower = Math.max(groupLower, lower);
      return {
        project_id: p.id,
        domain: p.measurement_domain,
        value: t.value,
        rank,
        traffic_id: t.id,
        data_version: t.version,
        raw_display: t.raw_display ?? String(t.value),
        precision_step: t.precision_step ?? 1,
      };
    });
  return {
    entries,
    exclusions,
    members: candidates.map((p) => p.id).sort(),
    coverage_count: entries.length,
    total_count: candidates.length,
  };
}
export async function publishCategory(
  db: any,
  category: string,
  month: string,
  demo: boolean,
  note: string,
  source = "AITDK",
) {
  const c = check<any>(
    await db
      .from("charts_categories")
      .select("*")
      .eq("slug", category)
      .single(),
  );
  const members = check<Membership[]>(
    await db.from("charts_memberships").select("*").eq("category", category),
  );
  const all = check<Project[]>(
    await db.from("charts_projects").select("*").eq("publication", "published"),
  );
  const traffic = check<Traffic[]>(
    await db
      .from("charts_traffic")
      .select("*")
      .eq("month", month)
      .eq("demo", demo)
      .eq("source", source)
      .eq("metric", "visits")
      .eq("scope", "worldwide-all-devices-domain")
      .in("state", ["verified", "conflict"]),
  );
  const ranked = rankCategory(
    all.filter((p) => demo || !p.demo),
    members,
    traffic,
  );
  // Empty coverage is publishable after a conflict; missing values never become zero.
  return check<any>(
    await db.rpc("charts_publish_category", {
      payload: {
        category,
        month,
        demo,
        source,
        metric: "visits",
        scope: "worldwide-all-devices-domain",
        rule_version: `purpose-visits-v2.c${c.rules_version}`,
        ...ranked,
        correction_note: note || "Initial category publication.",
      },
    }),
  );
}
