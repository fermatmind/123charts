import type { Project, Locale } from "./types";
/** Read the maintained bilingual fields without duplicating both languages in every row. */
export function localText(value: string | null | undefined, locale: Locale) {
  if (!value) return "";
  const parts = value.split(/\s+\/\s+|\s+·\s+/);
  const hasHan = (s: string) => /[\u3400-\u9fff]/.test(s);
  if (parts.length > 1 && parts.some(hasHan) && parts.some((s) => !hasHan(s)))
    return parts
      .filter((s) => (locale === "zh" ? hasHan(s) : !hasHan(s)))
      .join(locale === "zh" ? "；" : "; ");
  const first = value.search(/[\u3400-\u9fff]/);
  if (first > 20 && /[.!?]\s*$/.test(value.slice(0, first)))
    return locale === "zh" ? value.slice(first) : value.slice(0, first).trim();
  return value;
}
export function stableProjects(projects: Project[]) {
  return [...projects].sort(
    (a, b) =>
      a.name.toLowerCase().localeCompare(b.name.toLowerCase(), "en") ||
      a.id.localeCompare(b.id),
  );
}
export function searchScore(p: Project, query: string) {
  const q = query
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/$/, "");
  if (!q) return 1;
  if (p.name.toLowerCase() === q || p.domain.toLowerCase() === q) return 100;
  if (
    p.name.toLowerCase().startsWith(q) ||
    p.domain.toLowerCase().startsWith(q)
  )
    return 80;
  return [
    p.name,
    p.domain,
    p.task,
    p.description_en,
    p.description_zh,
    p.differentiator,
  ]
    .join(" ")
    .toLowerCase()
    .includes(q)
    ? 10
    : 0;
}
export function orderedIds(saved: string[], current: string[]) {
  return [
    ...new Set([...saved.filter((id) => current.includes(id)), ...current]),
  ];
}

/** Shared visible/JSON-LD order; no quality, popularity or traffic score. */
export function orderAlternativeChoices<
  T extends { project: Project; task: string },
>(choices: T[], task = "", order: "name" | "new" = "name"): T[] {
  return choices
    .filter((c) => !task || c.task === task)
    .sort(
      (a, b) =>
        (order === "new"
          ? (b.project.first_published_at || "").localeCompare(
              a.project.first_published_at || "",
            )
          : 0) ||
        a.project.name
          .toLowerCase()
          .localeCompare(b.project.name.toLowerCase(), "en") ||
        a.project.id.localeCompare(b.project.id) ||
        a.task.localeCompare(b.task),
    );
}
