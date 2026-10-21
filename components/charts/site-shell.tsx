"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import { Search, X, UserRound, ArrowRight } from "lucide-react";
import { useCharts, Avatar } from "./context";
export type Zone = "public" | "dashboard" | "admin";
export function ZoneFrame({
  zone,
  children,
}: {
  zone: Zone;
  children: React.ReactNode;
}) {
  const { data, t, href, locale, dataset } = useCharts(),
    pathname = usePathname(),
    params = useSearchParams();
  const [open, setOpen] = useState(false),
    [q, setQ] = useState("");
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  const language = `/${locale === "zh" ? "en" : "zh"}${pathname.replace(/^\/(en|zh)/, "")}?${params}`;
  const links =
    zone === "admin"
      ? [
          ["/admin/review", t("Review queue", "审核队列")],
          ["/admin/products", t("Products", "项目资料")],
          ["/admin/categories", t("Categories", "分类与用途")],
          ["/admin/relations", t("Relations", "替代关系")],
          ["/admin/discovery", t("Discovery", "发现轮换")],
        ]
      : [
          ["/dashboard/projects", t("My projects", "我的项目")],
          ["/dashboard/bookmarks", t("Bookmarks", "我的收藏")],
          ["/dashboard/following", t("Following", "我的关注")],
          ["/dashboard/notifications", t("Notifications", "通知")],
          ["/dashboard/settings", t("Settings", "账户设置")],
        ];
  return (
    <>
      <header className="topbar framework-header">
        <Link className="brand" href={href("/")}>
          <span className="brand-mark">123</span>123Charts
        </Link>
        <nav className="topnav">
          <Link href={href("/categories")}>
            {t("Category charts", "分类榜单")}
          </Link>
          <Link href={href("/alternatives")}>
            {t("Alternatives", "找替代方案")}
          </Link>
          <Link href={href("/free")}>{t("Free", "免费可用")}</Link>
          <Link href={href("/open-source")}>
            {t("Open source", "开源发现")}
          </Link>
        </nav>
        <div className="top-actions">
          <button
            className="search-trigger"
            aria-label={t("Search projects", "搜索项目")}
            onClick={() => setOpen(true)}
          >
            <Search size={15} />
            <span className="search-label">{t("Search", "搜索")}</span>
            <kbd>⌘ K</kbd>
          </button>
          <Link className="button ghost" href={language}>
            {locale === "zh" ? "EN" : "中"}
          </Link>
          <Link className="button primary" href={href("/submit")}>
            {t("Submit free", "免费提交")}
          </Link>
          <details className="account-menu">
            <summary aria-label={t("Account menu", "账户菜单")}>
              <UserRound size={18} />
            </summary>
            <nav>
              {data.user ? (
                <>
                  <small>{data.user.email}</small>
                  <Link href={href("/dashboard/projects")}>
                    {t("My projects", "我的项目")}
                  </Link>
                  <Link href={href("/dashboard/bookmarks")}>
                    {t("Bookmarks", "我的收藏")}
                  </Link>
                  <Link href={href("/dashboard/following")}>
                    {t("Following", "我的关注")}
                  </Link>
                  <Link href={href("/dashboard/notifications")}>
                    {t("Notifications", "通知")}
                  </Link>
                  <Link href={href("/dashboard/settings")}>
                    {t("Settings", "账户设置")}
                  </Link>
                  {data.isAdmin && (
                    <Link href={href("/admin/review")}>
                      {t("Operations", "运营管理")}
                    </Link>
                  )}
                </>
              ) : (
                <Link
                  href={href(
                    "/login?returnTo=" +
                      encodeURIComponent(pathname + "?" + params),
                  )}
                >
                  {t("Sign in / register", "登录／注册")}
                </Link>
              )}
            </nav>
          </details>
        </div>
      </header>
      <div
        className={
          "framework-zone " + (zone === "public" ? "public-zone" : "work-zone")
        }
      >
        {zone !== "public" && (
          <aside className="zone-sidebar">
            <p className="eyebrow">
              {zone === "admin"
                ? t("OPERATIONS", "运营管理")
                : t("YOUR SPACE", "我的空间")}
            </p>
            {links.map(([path, label]) => (
              <Link
                className={pathname.endsWith(path) ? "active" : ""}
                href={href(path)}
                key={path}
              >
                {label}
              </Link>
            ))}
            <Link href={href("/")}>
              {t("Back to discovery", "返回公开发现")} →
            </Link>
          </aside>
        )}
        <main className="zone-content">
          <div className="local-preview-label">
            {t("Local preview", "本地预览")} ·{" "}
            {dataset === "demo"
              ? t("Fictional demonstration", "虚构演示案例")
              : t("Website research", "网站研究资料")}
            <Link
              href={
                pathname +
                "?" +
                new URLSearchParams({
                  ...Object.fromEntries(params),
                  dataset: dataset === "real" ? "demo" : "real",
                })
              }
            >
              {dataset === "real" ? t("Demo", "演示") : t("Research", "研究")}
            </Link>
          </div>
          {children}
          <footer className="footer">
            <span>
              123Charts ·{" "}
              {t(
                "Discover Websites, Explore Alternatives.",
                "发现好网站，探索替代方案。",
              )}
            </span>
            <Link href={href("/how-it-works")}>
              {t("How it works", "平台规则")}
            </Link>
            <span>123charts.com</span>
          </footer>
        </main>
      </div>
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="search-overlay" />
          <Dialog.Content className="search-dialog">
            <div className="row between">
              <Dialog.Title>
                {t("Search websites & tasks", "搜索网站与用途")}
              </Dialog.Title>
              <Dialog.Close aria-label={t("Close search", "关闭搜索")}>
                <X size={18} />
              </Dialog.Close>
            </div>
            <Dialog.Description className="muted">
              {t(
                "Names, domains, tasks and categories.",
                "名称、域名、用途与分类。",
              )}
            </Dialog.Description>
            <input
              aria-label={t("Search query", "搜索关键词")}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              autoFocus
            />
            {data.categories
              .filter((c) =>
                (c.name_en + c.name_zh).toLowerCase().includes(q.toLowerCase()),
              )
              .map((c) => (
                <Link
                  className="search-result"
                  key={c.slug}
                  href={href("/categories/" + c.slug)}
                  onClick={() => setOpen(false)}
                >
                  {locale === "zh" ? c.name_zh : c.name_en}
                  <ArrowRight size={14} />
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
                  .includes(q.toLowerCase()),
              )
              .slice(0, 8)
              .map((p) => (
                <Link
                  className="search-result"
                  key={p.id}
                  href={href("/products/" + p.slug)}
                  onClick={() => setOpen(false)}
                >
                  <Avatar name={p.name} />
                  <span>
                    {p.name}
                    <small className="muted"> {p.domain}</small>
                  </span>
                </Link>
              ))}
            <Link
              className="button"
              href={href("/search?q=" + encodeURIComponent(q))}
              onClick={() => setOpen(false)}
            >
              {t("All search results", "查看全部搜索结果")} →
            </Link>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
