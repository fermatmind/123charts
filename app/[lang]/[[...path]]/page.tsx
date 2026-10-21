import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { bootstrap, adminDb, checked } from "@/lib/charts/server";
import ChartsApp from "@/components/charts/app";
export const dynamic = "force-dynamic";
type Props = {
  params: Promise<{ lang: string; path?: string[] }>;
  searchParams: Promise<Record<string, string | undefined>>;
};
const labels: Record<string, [string, string]> = {
  charts: ["Monthly website charts", "网站月度访问量榜"],
  projects: ["Project library", "项目研究库"],
  categories: ["Explore categories", "探索分类"],
  submit: ["Free project enrollment", "免费项目入驻"],
  dashboard: ["Your workspace", "你的工作台"],
  following: ["Saved & following", "收藏与关注"],
  login: ["Sign in", "登录"],
  admin: ["Review console", "审核工作台"],
  reports: ["Your peer observation group", "你的同行观察组"],
  shared: ["Shared peer observation group", "分享的同行观察组"],
  methodology: ["Data & methodology", "数据与方法"],
};
export async function generateMetadata({
  params,
  searchParams,
}: Props): Promise<Metadata> {
  const { lang, path = [] } = await params,
    query = await searchParams,
    route = path.join("/");
  const zh = lang === "zh";
  let title =
    labels[path[0]]?.[zh ? 1 : 0] ??
    (zh ? "看清网站，发现项目。" : "Discover. Compare. Decide.");
  let description = zh
    ? "发现项目，通过有来源、有期间的数据比较网站。"
    : "Discover projects and compare websites with explicit sources and periods.";
  if (path[0] === "projects" && path[1]) {
    try {
      const p = checked(
        await adminDb()
          .from("charts_projects")
          .select("name,description_en,description_zh")
          .eq("slug", path[1])
          .eq("publication", "published")
          .maybeSingle(),
      );
      if (p) {
        title = p.name;
        description = zh ? p.description_zh : p.description_en;
      }
    } catch {
      /* Local setup page remains available without a database. */
    }
  }
  const canonical = `/${lang}${route ? "/" + route : ""}`;
  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        en: `/en${route ? "/" + route : ""}`,
        zh: `/zh${route ? "/" + route : ""}`,
      },
    },
    robots: {
      index: false,
      follow: ![
        "admin",
        "dashboard",
        "submit",
        "login",
        "reports",
        "shared",
      ].includes(path[0]),
    },
    openGraph: {
      title: `${title} | 123Charts`,
      description,
      url: canonical,
      siteName: "123Charts",
      locale: zh ? "zh_CN" : "en_US",
    },
    other: { "123charts-dataset": query.dataset === "real" ? "real" : "demo" },
  };
}
export default async function Page({ params, searchParams }: Props) {
  const { lang, path = [] } = await params;
  if (!["en", "zh"].includes(lang)) notFound();
  const first = path[0];
  if (
    path.length > 2 ||
    (first && !labels[first]) ||
    (path.length === 2 &&
      !["projects", "categories", "dashboard", "reports", "shared"].includes(
        first,
      )) ||
    (first === "dashboard" && path[1] && path[1] !== "notifications")
  )
    notFound();
  const query = await searchParams,
    dataset = query.dataset === "real" ? "real" : "demo",
    initial = await bootstrap(dataset);
  if (
    initial.configured &&
    first === "projects" &&
    path[1] &&
    !initial.projects.some((p) => p.slug === path[1])
  )
    notFound();
  if (
    initial.configured &&
    first === "categories" &&
    path[1] &&
    !initial.categories.some((p) => p.slug === path[1])
  )
    notFound();
  return (
    <ChartsApp
      initial={initial}
      locale={lang as "en" | "zh"}
      path={path}
      dataset={dataset}
    />
  );
}
