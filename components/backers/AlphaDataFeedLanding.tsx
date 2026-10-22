import { ArrowRight, Database, Eye, Layers3, ShieldCheck } from "lucide-react";
import Link from "next/link";
import {
  BACKERS_ALPHA_FEED_BOUNDARIES,
  BACKERS_ALPHA_FEED_DESCRIPTION,
  BACKERS_ALPHA_FEED_TITLE,
} from "@/lib/seo/backers";

const sections = [
  {
    icon: Database,
    title: "Public Signal Snapshots",
    body: "A future feed can package reviewed project names, categories, public links, lifecycle state, and aggregate signal context from 123Charts public profiles.",
  },
  {
    icon: Layers3,
    title: "Research Context",
    body: "The intended audience is operators, builders, and research teams comparing early AI project activity through reviewed public sources.",
  },
  {
    icon: ShieldCheck,
    title: "Boundary First",
    body: "The landing page is informational only. It has no payment path, no private backer intake, and no live data feed endpoint.",
  },
];

export function AlphaDataFeedLanding() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <header className="mb-10 border-b border-terminal-border pb-8">
        <div className="mb-3 flex items-center gap-2">
          <Eye className="h-4 w-4 text-terminal-muted" />
          <span className="font-mono text-[10px] uppercase tracking-widest text-terminal-dim">
            Backer Interest
          </span>
        </div>
        <h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-terminal-fg sm:text-4xl">
          {BACKERS_ALPHA_FEED_TITLE}
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-terminal-dim">
          {BACKERS_ALPHA_FEED_DESCRIPTION}
        </p>
        <div className="mt-5 flex flex-wrap gap-3 text-[11px] font-mono uppercase tracking-widest text-terminal-dim">
          <span>Mode: read-only preview</span>
          <span>Data: reviewed public sources</span>
          <span>Boundary: no commitment flow</span>
        </div>
      </header>

      <section className="mb-10 grid gap-4 md:grid-cols-3">
        {sections.map((section) => (
          <article
            key={section.title}
            className="rounded-md border border-terminal-border bg-terminal-surface p-5"
          >
            <section.icon className="mb-4 h-5 w-5 text-terminal-muted" />
            <h2 className="text-sm font-semibold text-terminal-fg">
              {section.title}
            </h2>
            <p className="mt-3 text-xs leading-relaxed text-terminal-dim">
              {section.body}
            </p>
          </article>
        ))}
      </section>

      <section className="mb-10 rounded-md border border-terminal-border bg-terminal-surface p-5">
        <h2 className="text-sm font-semibold text-terminal-fg">
          What The Future Feed Can Contain
        </h2>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {BACKERS_ALPHA_FEED_BOUNDARIES.map((item) => (
            <div
              key={item}
              className="rounded-md border border-terminal-border px-3 py-2 text-xs text-terminal-dim"
            >
              {item}
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-md border border-terminal-border bg-terminal-elevated p-5">
        <h2 className="text-sm font-semibold text-terminal-fg">
          Current Status
        </h2>
        <p className="mt-3 max-w-3xl text-xs leading-relaxed text-terminal-dim">
          Alpha Data Feed is a future research surface. This page does not
          collect private information, does not launch a public API feed, and
          does not create payment or allocation workflows.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/projects"
            className="inline-flex items-center gap-1 rounded-md border border-terminal-ring px-3 py-2 text-xs text-terminal-fg transition-colors hover:bg-terminal-surface"
          >
            View Public Profiles
            <ArrowRight className="h-3 w-3" />
          </Link>
          <Link
            href="/reports"
            className="inline-flex items-center gap-1 rounded-md border border-terminal-ring px-3 py-2 text-xs text-terminal-fg transition-colors hover:bg-terminal-surface"
          >
            View Signal Reports
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </section>
    </main>
  );
}
