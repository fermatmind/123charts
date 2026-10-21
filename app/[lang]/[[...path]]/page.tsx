import { redirect } from "next/navigation";
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
  charts: ["Category traffic charts", "分类流量榜"],
  projects: ["Project library", "项目研究库"],
  categories: ["Explore categories", "探索分类"],
  submit: ["Free project enrollment", "免费项目入驻"],
  dashboard: ["Your workspace", "你的工作台"],
  following: ["Saved & following", "收藏与关注"],
  login: ["Sign in", "登录"],
  admin: ["Review console", "审核工作台"],
  reports: ["My peer comparison", "我的同行对比"],
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
  if (path[0] === "charts" && path[1]) {
    try {
      const c = checked(
        await adminDb()
          .from("charts_categories")
          .select("*")
          .eq("slug", path[1])
          .maybeSingle(),
      );
      if (c) {
        title = zh
          ? `${c.name_zh}网站流量榜`
          : `${c.name_en} website traffic chart`;
        description = zh ? c.description_zh : c.description_en;
      }
    } catch {}
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
      ![
        "projects",
        "categories",
        "charts",
        "dashboard",
        "reports",
        "shared",
      ].includes(first)) ||
    (first === "dashboard" && path[1] && path[1] !== "notifications")
  )
    notFound();
  const query = await searchParams;
  if (
    first === "categories" ||
    (first === "charts" && !path[1] && query.category)
  ) {
    const qs = new URLSearchParams(
      Object.entries(query).filter(
        ([k, v]) => k !== "category" && typeof v === "string",
      ) as [string, string][],
    );
    redirect(
      `/${lang}/charts${path[1] || query.category ? "/" + (path[1] || query.category) : ""}?${qs}`,
    );
  }
  const dataset = query.dataset === "real" ? "real" : "demo",
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
    first === "charts" &&
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
