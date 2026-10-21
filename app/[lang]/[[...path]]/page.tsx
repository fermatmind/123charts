import { redirect, notFound } from "next/navigation";
import type { Metadata } from "next";
import { bootstrap } from "@/lib/charts/server";
import ChartsApp from "@/components/charts/app";
import {
  discoveryPageEligible,
  indexableAlternative,
  profileReady,
  alternatives,
} from "@/lib/charts/discovery";
export const dynamic = "force-dynamic";
type Props = {
  params: Promise<{ lang: string; path?: string[] }>;
  searchParams: Promise<Record<string, string | undefined>>;
};
const labels: Record<string, [string, string]> = {
  projects: ["Discover websites", "发现网站"],
  products: ["Website profile", "网站档案"],
  categories: ["Category discovery charts", "分类发现榜"],
  alternatives: ["Find alternatives", "找替代方案"],
  free: ["Free to use", "免费可用榜"],
  new: ["Newly listed", "新收录榜"],
  submit: ["Submit for free", "免费提交"],
  dashboard: ["Your workspace", "你的工作台"],
  following: ["Saved & following", "收藏与关注"],
  login: ["Sign in", "登录"],
  admin: ["Review console", "审核工作台"],
  reports: ["Comparison shortlist", "同类对照清单"],
  shared: ["Shared comparison", "分享的对照清单"],
  methodology: ["How discovery works", "收录与发现规则"],
  "how-it-works": ["How discovery works", "收录与发现规则"],
  charts: ["Historical traffic charts", "历史流量榜"],
};
export async function generateMetadata({
  params,
  searchParams,
}: Props): Promise<Metadata> {
  const { lang, path = [] } = await params,
    query = await searchParams,
    zh = lang === "zh";
  const data = await bootstrap(query.dataset === "demo" ? "demo" : "real");
  const project = data.projects.find((p) => p.slug === path[1]),
    category = data.categories.find((c) => c.slug === path[1]);
  let title =
    labels[path[0]]?.[zh ? 1 : 0] ||
    (zh
      ? "发现好网站，找到更合适的替代方案。"
      : "Discover Websites, Explore Alternatives.");
  let description = zh
    ? "按用途、价格、语言和实际条件比较网站。免费浏览，免费提交。"
    : "Compare websites by purpose, pricing, language and conditions. Free to explore. Free to submit.";
  if (project && ["projects", "products", "alternatives"].includes(path[0])) {
    title =
      path[0] === "alternatives"
        ? zh
          ? project.name + " 替代方案：按用途、价格和语言比较"
          : "Alternatives to " +
            project.name +
            ": compare purpose, price and language"
        : project.name;
    description = zh ? project.description_zh : project.description_en;
  }
  if (category && path[0] === "categories") {
    title = zh
      ? category.name_zh + "分类发现榜"
      : category.name_en + " discovery chart";
    description = zh ? category.description_zh : category.description_en;
  }
  const route = path.join("/");
  const canonical = `/${lang}${route ? "/" + route : ""}`;
  const local = process.env.CHARTS_LOCAL_PREVIEW !== "false";
  const publicPath =
    !path[0] ||
    [
      "projects",
      "categories",
      "alternatives",
      "free",
      "new",
      "methodology",
      "how-it-works",
    ].includes(path[0]);
  const eligible =
    query.dataset !== "demo" &&
    discoveryPageEligible(
      path,
      data.projects,
      data.relations,
      !!category || !path[1],
    );
  const filtered = Object.keys(query).some((k) => !["dataset"].includes(k));
  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        en: canonical.replace(/^\/[^/]*/, "/en"),
        zh: canonical.replace(/^\/[^/]*/, "/zh"),
      },
    },
    robots: { index: !local && eligible && !filtered, follow: publicPath },
    openGraph: {
      title: title + " | 123Charts",
      description,
      url: canonical,
      siteName: "123Charts",
      locale: zh ? "zh_CN" : "en_US",
    },
    other: {
      "123charts-publish-eligible": String(eligible),
      "123charts-dataset": query.dataset === "demo" ? "demo" : "real",
    },
  };
}
export default async function Page({ params, searchParams }: Props) {
  const { lang, path = [] } = await params,
    query = await searchParams;
  if (!["en", "zh"].includes(lang)) notFound();
  const first = path[0];
  if (
    path.length > 2 ||
    (first && !labels[first]) ||
    (path.length === 2 &&
      ![
        "projects",
        "products",
        "categories",
        "alternatives",
        "charts",
        "dashboard",
        "reports",
        "shared",
      ].includes(first)) ||
    (first === "dashboard" && path[1] && path[1] !== "notifications")
  )
    notFound();
  if (first === "charts" || first === "products") {
    const qs = new URLSearchParams(
      Object.entries(query).filter(([, v]) => typeof v === "string") as [
        string,
        string,
      ][],
    );
    redirect(
      `/${lang}/${first === "charts" ? "categories" : "projects"}${path[1] ? "/" + path[1] : query.category && first === "charts" ? "/" + query.category : ""}?${qs}`,
    );
  }
  const dataset = query.dataset === "demo" ? "demo" : "real",
    initial = await bootstrap(dataset);
  const project = initial.projects.find((p) => p.slug === path[1]);
  if (
    initial.configured &&
    ((["projects", "alternatives"].includes(first) && path[1] && !project) ||
      (first === "categories" &&
        path[1] &&
        !initial.categories.some((c) => c.slug === path[1])))
  )
    notFound();
  const url = "https://123charts.com/" + lang + "/" + path.join("/");
  const schema =
    project && ["projects", "alternatives"].includes(first)
      ? path[0] === "alternatives"
        ? {
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "Alternatives to " + project.name,
            url,
            itemListElement: alternatives(
              project,
              initial.projects,
              initial.relations,
            ).map((x, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: x.project.name,
              url: `https://123charts.com/${lang}/projects/${x.project.slug}`,
            })),
          }
        : {
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: project.name,
            url: project.website_url,
            description:
              lang === "zh" ? project.description_zh : project.description_en,
            dateModified: project.updated_at,
          }
      : null;
  return (
    <>
      {schema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
          }}
        />
      )}
      <ChartsApp
        initial={initial}
        locale={lang as "en" | "zh"}
        path={path}
        dataset={dataset}
      />
    </>
  );
}
