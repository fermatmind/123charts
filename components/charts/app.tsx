"use client";
import {
  DiscoveryHome,
  DiscoveryListing,
  DiscoveryCategories,
  AlternativesPage,
  DiscoveryDetail,
  DiscoveryReport,
  DiscoveryShared,
  DiscoveryMethod,
} from "./discovery-views";
import { DiscoverySubmit } from "./discovery-submit";
import { DiscoveryDashboard, DiscoveryFollowing } from "./discovery-workspace";
import { DiscoveryAdmin } from "./discovery-admin";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import {
  ArrowUpRight,
  ArrowRight,
  Search,
  ChartNoAxesCombined,
  Layers3,
  Compass,
  Bookmark,
  Plus,
  FileText,
  SlidersHorizontal,
  ShieldCheck,
  Globe2,
  Bell,
  LayoutDashboard,
  ExternalLink,
  X,
  Command,
  Inbox,
} from "lucide-react";
import type { Bootstrap, Dataset, Locale } from "@/lib/charts/types";
import { ChartsProvider, useCharts, Avatar, Empty } from "./context";
import { AuthPage } from "./workspace";
export default function ChartsApp({
  initial,
  locale,
  path,
  dataset,
}: {
  initial: Bootstrap;
  locale: Locale;
  path: string[];
  dataset: Dataset;
}) {
  return (
    <ChartsProvider initial={initial} locale={locale} dataset={dataset}>
      <Shell path={path} />
    </ChartsProvider>
  );
}
function Shell({ path }: { path: string[] }) {
  const { data, t, href, locale, dataset } = useCharts(),
    pathname = usePathname(),
    params = useSearchParams();
  const [searchOpen, setSearchOpen] = useState(false),
    [search, setSearch] = useState("");
  const route = path.join("/"),
    first = path[0] ?? "";
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);
  const switchLang = `/${locale === "en" ? "zh" : "en"}${path.length ? "/" + path.join("/") : ""}?${params}`;
  const switchDataset = new URLSearchParams(params.toString());
  switchDataset.set("dataset", dataset === "demo" ? "real" : "demo");
  const navigation = [
    ["/", t("Overview", "总览"), Compass],
    ["/categories", t("Category charts", "分类榜单"), ChartNoAxesCombined],
    ["/alternatives", t("Alternatives", "找替代方案"), Layers3],
    ["/free", t("Free / open source", "免费 / 开源"), Globe2],
    ["/new", t("Newly listed", "新收录"), Plus],
    ["/projects", t("All websites", "所有网站"), Globe2],
  ] as const;
  const userLinks = [
    ["/following", t("Saved & following", "收藏与关注"), Bookmark],
    ["/dashboard", t("My workspace", "我的工作台"), LayoutDashboard],
    ["/dashboard/notifications", t("Notifications", "通知"), Bell],
  ] as const;
  const isActive = (target: string) =>
    target === "/" ? !first : target.split("/")[1] === first;
  let view: React.ReactNode;
  if (!data.configured)
    view = (
      <Empty title={t("Local database is not ready", "本地数据库尚未就绪")}>
        <p>
          {t(
            "Run npm run local:setup, then npm run dev:local.",
            "运行 npm run local:setup，然后运行 npm run dev:local。",
          )}
        </p>
      </Empty>
    );
  else if (!first) view = <DiscoveryHome />;
  else if ((first === "projects" || first === "products") && path[1])
    view = <DiscoveryDetail slug={path[1]} />;
  else if (first === "categories" && path[1])
    view = <DiscoveryListing key={path[1]} category={path[1]} />;
  else if (first === "categories") view = <DiscoveryCategories />;
  else if (first === "alternatives") view = <AlternativesPage slug={path[1]} />;
  else if (first === "free") view = <DiscoveryListing mode="free" />;
  else if (first === "new") view = <DiscoveryListing mode="new" />;
  else if (first === "projects") view = <DiscoveryListing />;
  else if (first === "submit") view = <DiscoverySubmit />;
  else if (first === "dashboard")
    view = (
      <DiscoveryDashboard notificationsOnly={path[1] === "notifications"} />
    );
  else if (first === "following") view = <DiscoveryFollowing />;
  else if (first === "login") view = <AuthPage />;
  else if (first === "reports" && path[1])
    view = <DiscoveryReport id={path[1]} />;
  else if (first === "shared" && path[1])
    view = <DiscoveryShared token={path[1]} />;
  else if (first === "admin") view = <DiscoveryAdmin />;
  else if (first === "methodology" || first === "how-it-works")
    view = <DiscoveryMethod />;
  else
    view = (
      <Empty title={t("Page not found", "页面不存在")}>
        <Link className="button" href={href("/")}>
          {t("Back to discovery", "返回发现")}
        </Link>
      </Empty>
    );
  return (
    <>
      <header className="topbar">
        <Link className="brand" href={href("/")} aria-label="123Charts home">
          <span className="brand-mark">123</span>123Charts
          <span
            className="tag demo hide-mobile"
            style={{ fontSize: 8, marginLeft: 3, letterSpacing: 1 }}
          >
            BETA
          </span>
        </Link>
        <nav className="topnav">
          <Link className={isActive("/") ? "active" : ""} href={href("/")}>
            {t("Discover", "发现")}
          </Link>
          <Link
            className={isActive("/categories") ? "active" : ""}
            href={href("/categories")}
          >
            {t("Category charts", "分类榜单")}
          </Link>
          <Link href={href("/alternatives")}>
            {t("Alternatives", "找替代方案")}
          </Link>
          <Link href={href("/free")}>
            {t("Free / open source", "免费 / 开源")}
          </Link>
          <Link
            className={isActive("/submit") ? "active" : ""}
            href={href("/submit")}
          >
            {t("Submit for free", "免费提交")}
          </Link>
        </nav>
        <div className="top-actions">
          <button
            className="search-trigger"
            onClick={() => setSearchOpen(true)}
            aria-label={t("Search projects", "搜索项目")}
          >
            <span>
              <Search size={14} />
              <span className="search-label">
                {t("Search anything…", "搜索项目、分类…")}
              </span>
            </span>
            <kbd className="key">⌘ K</kbd>
          </button>
          <Link
            className="locale-switch"
            href={switchLang}
            lang={locale === "en" ? "zh" : "en"}
          >
            {locale === "en" ? "中" : "EN"}
          </Link>
          <Link
            href={href(data.user ? "/dashboard" : "/login")}
            className="button ghost user-label"
          >
            {data.user ? t("Workspace", "工作台") : t("Sign in", "登录")}
          </Link>
          <Link href={href("/submit")} className="button primary">
            <Plus size={13} />
            {t("Submit project", "免费入驻")}
          </Link>
        </div>
      </header>
      <div className="layout">
        <aside className="sidebar">
          <div>
            <p className="side-title">{t("Explore", "探索")}</p>
            <nav className="side-links">
              {navigation.map(([url, label, Icon]) => (
                <Link
                  key={url}
                  href={href(url)}
                  className={`side-link ${isActive(url) ? "active" : ""}`}
                >
                  <Icon size={15} />
                  {label}
                  {url === "/projects" && (
                    <span className="side-count">{data.projects.length}</span>
                  )}
                </Link>
              ))}
            </nav>
          </div>
          <div>
            <p className="side-title">{t("Industries", "行业分类")}</p>
            <nav className="side-links">
              {data.categories.map((c, i) => (
                <Link
                  key={c.slug}
                  href={href(`/categories/${c.slug}`)}
                  className={`side-link ${route === `categories/${c.slug}` ? "active" : ""}`}
                >
                  <span
                    className="mono"
                    style={{ color: "#54617a", fontSize: 10 }}
                  >
                    0{i + 1}
                  </span>
                  {locale === "zh" ? c.name_zh : c.name_en}
                  <span className="side-count">
                    {data.projects.filter((p) => p.category === c.slug).length}
                  </span>
                </Link>
              ))}
            </nav>
          </div>
          <div>
            <p className="side-title">{t("Your space", "个人空间")}</p>
            <nav className="side-links">
              {userLinks.map(([url, label, Icon]) => (
                <Link
                  key={url}
                  href={href(url)}
                  className={`side-link ${route === url.slice(1) ? "active" : ""}`}
                >
                  <Icon size={15} />
                  {label}
                </Link>
              ))}
              {data.isAdmin && (
                <Link
                  href={href("/admin")}
                  className={`side-link ${first === "admin" ? "active" : ""}`}
                >
                  <ShieldCheck size={15} />
                  {t("Review console", "审核工作台")}
                </Link>
              )}
            </nav>
          </div>
          <div className="side-bottom">
            <Link href={href("/methodology")}>
              <FileText size={13} />
              {t("How it works", "发现规则")}
            </Link>
            <Link href={href("/submit")}>
              <ArrowUpRight size={13} />
              {t("Built to be free", "核心服务免费")}
            </Link>
            <p>
              <span className="status-dot" />
              {t("Local preview", "本地预览")}
            </p>
            <span className="mono">123charts.com</span>
          </div>
        </aside>
        <main className="workspace">
          <nav className="mobile-menu">
            {navigation.map(([url, label]) => (
              <Link key={url} href={href(url)}>
                {label}
              </Link>
            ))}
            <Link href={href("/dashboard")}>{t("Workspace", "工作台")}</Link>
            {data.isAdmin && (
              <Link href={href("/admin")}>{t("Review", "审核")}</Link>
            )}
          </nav>
          <div className="preview-banner">
            <Inbox size={13} />
            <span>
              {dataset === "demo"
                ? t(
                    "DEMO · Fictional websites and review examples. Isolated from real project research.",
                    "演示 · 虚构网站与审核案例，与真实项目研究隔离。",
                  )
                : t(
                    "LOCAL RESEARCH · Reviewed website facts and task relationships. Unknown conditions remain unconfirmed.",
                    "本地研究 · 项目资料与用途关系按依据审核，未知条件保持待确认。",
                  )}
            </span>
            <Link href={`${pathname}?${switchDataset}`}>
              {dataset === "demo"
                ? t("View real records", "查看真实记录")
                : t("Explore demo", "体验演示")}
            </Link>
          </div>
          {view}
          <footer className="footer">
            <Link className="wordmark" href={href("/")}>
              123Charts<span style={{ color: "#54617a" }}> / </span>
              <span style={{ fontSize: 10, fontWeight: 400 }}>
                {t(
                  "Discover Websites, Explore Alternatives.",
                  "发现好网站，探索替代方案。",
                )}
              </span>
            </Link>
            <Link href={href("/methodology")}>
              {t("How it works", "发现规则")}
            </Link>
            <Link href={href("/submit")}>{t("Free to join", "免费入驻")}</Link>
            <span>© 2026 123Charts</span>
          </footer>
        </main>
      </div>
      <Dialog.Root open={searchOpen} onOpenChange={setSearchOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="search-overlay" />
          <Dialog.Content className="search-dialog">
            <div className="row between">
              <Dialog.Title>
                {t("Search the index", "搜索项目研究库")}
              </Dialog.Title>
              <Dialog.Close
                className="icon-button"
                aria-label={t("Close search", "关闭搜索")}
              >
                <X size={15} />
              </Dialog.Close>
            </div>
            <Dialog.Description className="muted small">
              {t(
                "Find a project, a domain or a category.",
                "搜索项目名称、域名或分类。",
              )}
            </Dialog.Description>
            <div
              className="filter-search"
              style={{ maxWidth: "none", margin: "15px 0" }}
            >
              <Search size={15} />
              <input
                autoFocus
                className="input"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("Start typing…", "输入关键词…")}
                aria-label={t("Search query", "搜索关键词")}
              />
            </div>
            {data.categories
              .filter((c) =>
                (c.name_en + c.name_zh)
                  .toLowerCase()
                  .includes(search.toLowerCase()),
              )
              .map((c) => (
                <Link
                  className="search-result"
                  onClick={() => setSearchOpen(false)}
                  href={href(`/categories/${c.slug}`)}
                  key={c.slug}
                >
                  <Layers3 size={18} />
                  <div>
                    {locale === "zh" ? c.name_zh : c.name_en}
                    <div className="muted">{t("Category", "分类")}</div>
                  </div>
                </Link>
              ))}
            {data.projects
              .filter((p) =>
                (
                  p.name +
                  p.domain +
                  p.task +
                  p.description_en +
                  p.description_zh
                )
                  .toLowerCase()
                  .includes(search.toLowerCase()),
              )
              .slice(0, 8)
              .map((p) => (
                <Link
                  className="search-result"
                  onClick={() => setSearchOpen(false)}
                  href={href(`/projects/${p.slug}?from=/search`)}
                  key={p.id}
                >
                  <Avatar name={p.name} size="small" />
                  <div>
                    {p.name}
                    <div className="muted">{p.domain}</div>
                  </div>
                  <ArrowRight size={13} style={{ marginLeft: "auto" }} />
                </Link>
              ))}
            {search &&
              !data.projects.some((p) =>
                (
                  p.name +
                  p.domain +
                  p.task +
                  p.description_en +
                  p.description_zh
                )
                  .toLowerCase()
                  .includes(search.toLowerCase()),
              ) && (
                <p className="empty">
                  {t(
                    "No matching projects. Try a category or another task.",
                    "暂无匹配项目，试试分类或其他任务。",
                  )}
                </p>
              )}
            <p className="muted small">
              <Command size={11} style={{ display: "inline" }} /> K{" "}
              <span style={{ marginLeft: 12 }}>
                Esc {t("to close", "关闭")}
              </span>
            </p>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
