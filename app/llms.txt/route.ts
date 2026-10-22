import { publicCatalog } from "@/lib/charts/catalog";
import { profileReady, indexableAlternative } from "@/lib/charts/discovery";
export const dynamic = "force-dynamic";
export async function GET() {
  const data = await publicCatalog("real");
  const lines = [
    "# 123Charts",
    "> Discover websites and task-specific alternatives. Public facts, source references, pricing conditions and maintained relationships.",
    "",
    "## Browse",
    "- [Categories](https://123charts.com/en/categories)",
    "- [Free websites](https://123charts.com/en/free)",
    "- [Open source](https://123charts.com/en/open-source)",
    "- [Rules](https://123charts.com/en/how-it-works)",
    "",
    "## Reviewed projects",
    ...data.projects
      .filter(profileReady)
      .map(
        (p) =>
          `- [${p.name}](https://123charts.com/en/products/${p.slug}): ${p.task}`,
      ),
    "",
    "## Task-specific alternatives",
    ...data.projects
      .filter((p) => indexableAlternative(p, data.projects, data.relations))
      .map(
        (p) =>
          `- [Alternatives to ${p.name}](https://123charts.com/en/alternatives/${p.slug})`,
      ),
    "",
    "Local preview is noindex. Listing and comparison are not guarantees of quality, ranking, visits or AI citation.",
  ];
  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Robots-Tag": "noindex",
    },
  });
}
