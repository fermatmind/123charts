import type { Project, Relation } from "./types";
export const prices = {
  free: ["Free to use", "免费使用"],
  freemium: ["Free plan", "提供免费方案"],
  trial: ["Free trial", "免费试用"],
  paid: ["Paid", "付费使用"],
  unknown: ["Unconfirmed", "待确认"],
} as const;
export function priceLabel(
  p: Pick<Project, "price_type" | "price_verified">,
  zh = false,
) {
  return prices[p.price_verified ? p.price_type : "unknown"][zh ? 1 : 0];
}
export function profileReady(p: Project) {
  return (
    p.publication === "published" &&
    !!p.task?.trim() &&
    !!p.differentiator?.trim() &&
    !!p.supported_languages?.length &&
    !!p.description_en &&
    !!p.description_zh
  );
}
export function sustainedFree(p: Project) {
  return (
    p.price_verified === true &&
    ["free", "freemium"].includes(p.price_type) &&
    !!p.conditions?.trim()
  );
}
export interface CycleEntry {
  id: string;
  group: string;
  exposure: number;
  fresh: boolean;
  contributor: boolean;
  tie: string;
}
export function discover(projects: Project[], cycle: CycleEntry[], limit = 6) {
  const candidates = projects.filter(profileReady);
  const map = new Map(candidates.map((p) => [p.id, p]));
  const pool = cycle.filter((e) => map.has(e.id));
  const used = new Set<string>();
  const selected: { project: Project; reason: string }[] = [];
  const pick = (entries: CycleEntry[], reason: string) => {
    const e = entries
      .filter(
        (e) =>
          !used.has(e.group) && !selected.some((x) => x.project.id === e.id),
      )
      .sort((a, b) => a.exposure - b.exposure || a.tie.localeCompare(b.tie))[0];
    if (e) {
      used.add(e.group);
      selected.push({ project: map.get(e.id)!, reason });
    }
  };
  pick(
    pool.filter((e) => e.fresh),
    "newly_listed",
  );
  pick(
    pool.filter((e) => e.contributor),
    "adopted_contribution",
  );
  while (selected.length < limit) {
    const n = selected.length;
    pick(pool, "rotation");
    if (n === selected.length) break;
  }
  return selected;
}
export function alternatives(
  target: Project,
  projects: Project[],
  relations: Relation[],
  task = "",
) {
  const edges = relations.filter(
    (r) =>
      r.status === "approved" &&
      r.public !== false &&
      !r.withdrawn_at &&
      (!task || r.task === task),
  );
  const result: { project: Project; task: string; rationale: string }[] = [];
  for (const r of edges) {
    const source = projects.find((p) => p.id === r.project_id);
    const peer = projects.find((p) => p.domain === r.peer_domain);
    if (!source || !peer || source.demo !== peer.demo) continue;
    const candidate =
      peer.id === target.id ? source : source.id === target.id ? peer : null;
    if (
      candidate &&
      profileReady(candidate) &&
      !result.some((x) => x.project.id === candidate.id && x.task === r.task)
    )
      result.push({ project: candidate, task: r.task, rationale: r.rationale });
  }
  return result;
}
export function indexableAlternative(
  target: Project,
  projects: Project[],
  relations: Relation[],
) {
  return (
    !target.demo &&
    profileReady(target) &&
    alternatives(target, projects, relations).length > 0
  );
}
/** Future production publication eligibility; local preview adds its own global noindex. */
export function discoveryPageEligible(
  path: string[],
  projects: Project[],
  relations: Relation[],
  categoryExists = true,
) {
  const ready = projects.filter((p) => !p.demo && profileReady(p));
  const [route, slug] = path;
  if (!route) return true;
  if (route === "projects")
    return slug ? ready.some((p) => p.slug === slug) : ready.length > 0;
  if (route === "categories")
    return (
      categoryExists &&
      (slug ? ready.some((p) => p.category === slug) : ready.length > 0)
    );
  if (route === "alternatives")
    return ready.some(
      (p) =>
        (!slug || p.slug === slug) && indexableAlternative(p, ready, relations),
    );
  if (route === "free") return ready.some(sustainedFree);
  if (route === "new") return ready.length > 0;
  return ["methodology", "how-it-works"].includes(route);
}
