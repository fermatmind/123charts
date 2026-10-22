import { publicIndexing } from "@/lib/charts/runtime-config";
import type { MetadataRoute } from "next";
import { bootstrap } from "@/lib/charts/server";
import {
  profileReady,
  indexableAlternative,
  discoveryPageEligible,
} from "@/lib/charts/discovery";
export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!publicIndexing(process.env)) return [];
  const data = await bootstrap("real", "public");
  const base = new URL(process.env.APP_URL || "https://123charts.com").origin;
  const paths = [
    "",
    "/categories",
    "/alternatives",
    "/free",
    "/open-source",
    "/new",
    "/how-it-works",
    ...data.categories.map((c) => "/categories/" + c.slug),
    ...data.projects.filter(profileReady).map((p) => "/products/" + p.slug),
    ...data.projects
      .filter((p) => indexableAlternative(p, data.projects, data.relations))
      .map((p) => "/alternatives/" + p.slug),
  ];
  return paths
    .filter((path) =>
      discoveryPageEligible(
        path.split("/").filter(Boolean),
        data.projects,
        data.relations,
      ),
    )
    .flatMap((path) =>
      ["en", "zh"].map((lang) => ({
        url: base + "/" + lang + path,
        alternates: {
          languages: { en: base + "/en" + path, zh: base + "/zh" + path },
        },
      })),
    );
}
