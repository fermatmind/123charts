import type { Metadata } from "next";
import Link from "next/link";
import {
  Archive,
  ArrowRight,
  Database,
  MailX,
  FileText,
  Lock,
  ShieldCheck,
} from "lucide-react";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Alpha Feed Boundary | 123Charts",
  description:
    "A static boundary page for future Alpha Feed public signal snapshots from 123Charts reviewed public metadata.",
  alternates: {
    canonical: "https://123charts.com/alpha-feed",
  },
  robots: { index: true, follow: true },
};

const signalCards = [
  {
    title: "Reviewed Public Metadata",
    body: "Project names, categories, canonical public links, lifecycle status, and reviewed public source references.",
    icon: Database,
  },
  {
    title: "Machine-Readable Evidence",
    body: "Research-oriented snapshots can describe crawler readability, public profile completeness, and source review posture.",
    icon: Archive,
  },
  {
    title: "Boundary-Led Access",
    body: "There is no live feed endpoint, account flow, private intake, payment path, or API key request in this release.",
    icon: Lock,
  },
];

const allowed = [
  "Published public project profiles",
  "Reviewed public metadata",
  "Machine-readability summaries",
  "Public source link status",
  "Local snapshot readiness evidence",
  "Boundary and QA history",
];

const notIncluded = [
  "Private founder or admin fields",
  "Raw database rows",
  "Hidden score inputs",
  "Payment or account data",
  "Live API delivery",
  "Customer signup",
];

const disabledFields = [
  "Work identity",
  "Team context",
  "Use case note",
];

export default function AlphaFeedPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <section className="border-b border-terminal-border pb-10">
        <div className="mb-4 inline-flex items-center gap-2 rounded-md border border-terminal-border bg-terminal-surface px-3 py-2">
          <ShieldCheck className="h-4 w-4 text-terminal-muted" />
          <span className="font-mono text-[10px] uppercase tracking-widest text-terminal-dim">
            Static Boundary
          </span>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
          <div>
            <h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-terminal-fg sm:text-5xl">
              Alpha Feed public signal boundary
            </h1>
            <p className="mt-5 max-w-3xl text-sm leading-relaxed text-terminal-dim sm:text-base">
              Alpha Feed is a future public-signal snapshot surface for teams
              researching early AI project activity. This page defines the
              boundary only: reviewed public metadata, machine-readable
              evidence, and local snapshot readiness.
            </p>
          </div>

          <div className="rounded-md border border-terminal-border bg-terminal-surface p-5">
            <h2 className="text-sm font-semibold text-terminal-fg">
              Current status
            </h2>
            <p className="mt-3 text-xs leading-relaxed text-terminal-dim">
              Informational preview only. No feed runtime, no private data, no
              account flow, no payment, no external delivery, and no API access
              are enabled here.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 py-10 md:grid-cols-3">
        {signalCards.map((item) => (
          <article
            key={item.title}
            className="rounded-md border border-terminal-border bg-terminal-surface p-5"
          >
            <item.icon className="mb-4 h-5 w-5 text-terminal-muted" />
            <h2 className="text-sm font-semibold text-terminal-fg">
              {item.title}
            </h2>
            <p className="mt-3 text-xs leading-relaxed text-terminal-dim">
              {item.body}
            </p>
          </article>
        ))}
      </section>

      <section className="grid gap-4 pb-10 md:grid-cols-2">
        <div className="rounded-md border border-terminal-border bg-terminal-surface p-5">
          <div className="mb-3 flex items-center gap-2">
            <FileText className="h-4 w-4 text-terminal-muted" />
            <h2 className="text-sm font-semibold text-terminal-fg">
              Boundary includes
            </h2>
          </div>
          <div className="grid gap-2">
            {allowed.map((item) => (
              <div
                key={item}
                className="rounded-md border border-terminal-border px-3 py-2 text-xs text-terminal-dim"
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-md border border-terminal-border bg-terminal-surface p-5">
          <div className="mb-3 flex items-center gap-2">
            <Lock className="h-4 w-4 text-terminal-muted" />
            <h2 className="text-sm font-semibold text-terminal-fg">
              Boundary excludes
            </h2>
          </div>
          <div className="grid gap-2">
            {notIncluded.map((item) => (
              <div
                key={item}
                className="rounded-md border border-terminal-border px-3 py-2 text-xs text-terminal-dim"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-md border border-terminal-border bg-terminal-elevated p-5">
        <h2 className="text-sm font-semibold text-terminal-fg">
          Commercial and data boundary
        </h2>
        <p className="mt-3 max-w-4xl text-xs leading-relaxed text-terminal-dim">
          Alpha Feed content is not financial advice, is not an investment
          recommendation, and does not promise external outcomes. It does not
          provide private founder data, private admin data, live feed access,
          API keys, metering, customer accounts, or payment flows.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/projects"
            className="inline-flex items-center gap-1 rounded-md border border-terminal-ring px-3 py-2 text-xs text-terminal-fg transition-colors hover:bg-terminal-surface"
          >
            Review public profiles
            <ArrowRight className="h-3 w-3" />
          </Link>
          <Link
            href="/reports"
            className="inline-flex items-center gap-1 rounded-md border border-terminal-ring px-3 py-2 text-xs text-terminal-fg transition-colors hover:bg-terminal-surface"
          >
            Review public reports
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </section>

      <section className="mt-6 grid gap-4 rounded-md border border-terminal-border bg-terminal-surface p-5 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <MailX className="h-4 w-4 text-terminal-muted" />
            <h2 className="text-sm font-semibold text-terminal-fg">
              Buyer interest shell
            </h2>
          </div>
          <p className="text-xs leading-relaxed text-terminal-dim">
            Future Alpha Feed interest is shown as a disabled preview only.
            123Charts is not collecting private contact details, company details,
            buyer messages, customer signup requests, payment details, API key
            requests, or live feed access requests here.
          </p>
        </div>

        <form
          aria-label="Disabled Alpha Feed buyer interest preview"
          className="grid gap-3"
        >
          {disabledFields.map((label) => (
            <label key={label} className="grid gap-1 text-xs text-terminal-dim">
              <span>{label}</span>
              <input
                aria-label={`${label} disabled preview`}
                className="rounded-md border border-terminal-border bg-terminal-elevated px-3 py-2 text-xs text-terminal-muted"
                disabled
                placeholder="Disabled preview"
                readOnly
                type="text"
              />
            </label>
          ))}
          <button
            className="rounded-md border border-terminal-border bg-terminal-elevated px-3 py-2 text-xs text-terminal-muted"
            disabled
            type="button"
          >
            Interest collection disabled
          </button>
          <p className="text-[11px] leading-relaxed text-terminal-muted">
            The matching API route returns a disabled Problem Details response
            and does not parse request bodies.
          </p>
        </form>
      </section>
    </main>
  );
}
