import { GenesisBadgeExplainer } from "@/components/genesis-badge-explainer";
import { webPageJSONLD } from "@/lib/structured-data";
import { siteTitle, siteDescription } from "@/lib/seo";
import { Shield } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: siteTitle("Genesis Badge"),
  description: siteDescription(
    "The 123Charts Genesis Badge is an optional public signal display for early AI projects with reviewed public growth signals and founder verification."
  ),
  robots: { index: true, follow: true },
};

export default function GenesisPage() {
  const baseUrl =
    process.env.APP_URL ?? "http://localhost:3000";
  const pageUrl = `${baseUrl}/genesis`;

  const webPageLD = webPageJSONLD(
    pageUrl,
    "Genesis Badge",
    "The 123Charts Genesis Badge is an optional public signal display for early AI projects with reviewed public growth signals and founder verification."
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageLD) }}
      />

      <div className="mb-12 text-center">
        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full border-2 border-terminal-ring bg-terminal-elevated">
          <Shield className="h-5 w-5 text-terminal-muted" />
        </div>
        <h1 className="mb-3 text-2xl font-bold tracking-tight text-terminal-fg">
          Genesis Badge
        </h1>
        <p className="text-sm text-terminal-dim leading-relaxed max-w-lg mx-auto">
          An optional public signal display for early AI projects that have
          reviewed growth signals and completed founder verification on 123Charts.
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          <span className="rounded border border-terminal-border bg-terminal-surface px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-terminal-muted">
            Tracked by 123Charts
          </span>
          <span className="rounded border border-terminal-border bg-terminal-surface px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-terminal-muted">
            Founder Claimed
          </span>
        </div>
      </div>

      <GenesisBadgeExplainer />

      <div className="mt-12 rounded-lg border border-terminal-border bg-terminal-surface p-6 text-center">
        <h2 className="mb-2 text-sm font-semibold text-terminal-fg">
          Genesis Badge Availability
        </h2>
        <p className="text-xs text-terminal-dim leading-relaxed max-w-md mx-auto">
          The Genesis Badge is planned for a future phase of 123Charts. Eligibility,
          review criteria, and display format are still under development.
          Dynamic rendering and embed functionality are not yet available. This
          page describes the planned badge concept and its limits.
        </p>
      </div>
    </div>
  );
}
