"use client";
import Link from "next/link";
import { brand } from "@/lib/charts/brand";
import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import { Search, X, UserRound, ArrowRight } from "lucide-react";
import { UnifiedSearch } from "./navigation-ui";
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
  const [open, setOpen] = useState(false);
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
          <span className="brand-mark">123</span>
          <span className="brand-copy">
            <strong>123Charts</strong>
            <small>{brand[locale].short}</small>
          </span>
        </Link>
        <nav className="topnav">
          <Link href={href("/categories")}>{t("Directory", "分类导航")}</Link>
          <Link href={href("/alternatives")}>
            {t("Alternative charts", "替代榜单")}
          </Link>
          <Link href={href("/new")}>{t("New listings", "最新收录")}</Link>
          <Link href={href(data.user ? "/dashboard/bookmarks" : "/following")}>
            {t("My favorites", "我的常用")}
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
            <span className="submit-full">
              {t("Submit a website — free", "免费提交网站")}
            </span>
            <span className="submit-short">
              {t("Submit free", "免费提交网站")}
            </span>
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
            <span>123Charts · {brand[locale].positioning}</span>
            <Link href={href("/how-it-works")}>
              {t("How it works", "平台规则")}
            </Link>
            <Link href={href("/how-it-works") + "#data-and-order"}>
              {t("Sources & sorting", "资料与排序说明")}
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
            <UnifiedSearch dialog onChoose={() => setOpen(false)} />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
