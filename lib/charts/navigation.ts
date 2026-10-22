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

/** Translate language labels only; never infer supported languages. */
export function languageNames(languages: string[] | undefined, locale: Locale) {
  const names: Record<string, [string, string]> = {
    english: ["English", "英语"],
    chinese: ["Chinese", "中文"],
    spanish: ["Spanish", "西班牙语"],
    japanese: ["Japanese", "日语"],
    german: ["German", "德语"],
    french: ["French", "法语"],
    korean: ["Korean", "韩语"],
    portuguese: ["Portuguese", "葡萄牙语"],
  };
  return (
    languages
      ?.filter(
        (x) =>
          x.trim() &&
          !/^(unconfirmed|unknown|待确认|待补充)(?:\s|$)/i.test(x.trim()),
      )
      .map((x) => names[x.toLowerCase()]?.[locale === "zh" ? 1 : 0] || x)
      .join(" / ") || (locale === "zh" ? "待补充" : "Not recorded")
  );
}

/** Hide known placeholder copy in listings, without discarding factual text that mentions limits. */
export function maintainedText(
  value: string | null | undefined,
  locale: Locale,
) {
  const text = localText(value, locale).trim();
  const placeholders =
    /^(?:unknown|unconfirmed|not recorded|not yet confirmed|to be confirmed|待确认|待补充|尚未记录|详细使用条件尚未核实，请向官网确认价格、托管及使用限制[。]?|Detailed conditions have not been reviewed\. Confirm pricing, hosting and usage limits with the official website\.)$/i;
  return placeholders.test(text) ? "" : text;
}
