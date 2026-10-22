"use client";
import { ChartsProvider, useCharts } from "./context";
import { FavoritesArea } from "./navigation-ui";
import { ZoneFrame } from "./site-shell";
import type { ZoneProps } from "./public-app";
import { DiscoveryDashboard, DiscoveryFollowing } from "./discovery-workspace";
import { DiscoverySubmit } from "./discovery-submit";
import { DiscoveryReport } from "./discovery-views";
import { AuthPage } from "./workspace";
import Link from "next/link";
function Settings() {
  const { data, t, api, href } = useCharts();
  return (
    <div className="discovery-page">
      <h1>{t("Account & notifications", "账户与通知设置")}</h1>
      <p>{data.user?.email}</p>
      <Link className="button" href={href("/dashboard/following")}>
        {t("Manage subscriptions", "管理订阅")}
      </Link>
      <button
        className="button"
        onClick={() =>
          void api("auth", { action: "signout" }).then(() =>
            location.assign(href("/")),
          )
        }
      >
        {t("Sign out", "退出登录")}
      </button>
    </div>
  );
}
export default function PersonalApp(props: ZoneProps) {
  const [first, section, id] = props.path;
  const view =
    first === "login" ? (
      <AuthPage />
    ) : first === "submit" ? (
      <DiscoverySubmit />
    ) : first === "reports" || section === "reports" ? (
      <DiscoveryReport id={id || section} />
    ) : section === "bookmarks" ? (
      <div className="navigation-home">
        <FavoritesArea manage />
      </div>
    ) : first === "following" ||
      ["bookmarks", "following"].includes(section) ? (
      <DiscoveryFollowing
        kind={
          section === "bookmarks"
            ? "bookmark"
            : section === "following"
              ? "following"
              : undefined
        }
      />
    ) : section === "settings" ? (
      <Settings />
    ) : (
      <DiscoveryDashboard
        notificationsOnly={section === "notifications"}
        projectId={id}
      />
    );
  return (
    <ChartsProvider {...props} zone="dashboard">
      <ZoneFrame zone="dashboard">{view}</ZoneFrame>
    </ChartsProvider>
  );
}
