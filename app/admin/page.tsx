import { checkAdminGuard } from "@/lib/auth/admin";
import { siteTitle, siteDescription, noIndex } from "@/lib/seo";
import {
  Shield,
  ShieldAlert,
  FileText,
  UserPlus,
  Edit3,
  RefreshCw,
  LogOut,
  SearchCheck,
  BarChart3,
  KeyRound,
  ClipboardList,
} from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: siteTitle("Admin"),
  description: siteDescription("123Charts admin panel."),
  ...noIndex(),
};

export default async function AdminPage() {
  const guard = await checkAdminGuard();

  if (guard.error === "Supabase is not configured.") {
    return <UnavailableState />;
  }

  if (!guard.isAuthenticated) {
    return <NotAuthenticated />;
  }

  if (!guard.isAdmin) {
    return <NotAdmin email={guard.userEmail} />;
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <div className="mb-10">
        <div className="mb-2 flex items-center gap-2">
          <Shield className="h-4 w-4 text-terminal-muted" />
          <span className="text-[10px] font-mono uppercase tracking-widest text-terminal-dim">
            Admin
          </span>
        </div>
        <h1 className="mb-2 text-2xl font-bold tracking-tight text-terminal-fg">
          123Charts Admin
        </h1>
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <span className="text-terminal-dim">
            Signed in as{" "}
            <span className="text-terminal-muted font-medium">
              {guard.userEmail}
            </span>
          </span>
          <span className="inline-flex items-center gap-1 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
            <Shield className="h-3 w-3" />
            Admin
          </span>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 mb-8">
        <Link href="/admin/submissions" className="block">
          <AdminCard
            icon={FileText}
            title="Submissions Review"
            description="Review, approve, or reject project submissions."
            tag="Active"
          />
        </Link>
        <Link href="/admin/claims" className="block">
          <AdminCard
            icon={UserPlus}
            title="Claims Review"
            description="Review and verify founder claims."
            tag="Active"
          />
        </Link>
        <Link href="/admin/editorial" className="block">
          <AdminCard
            icon={Edit3}
            title="Editorial Review"
            description="Review draft-only editorial notes before any publication workflow."
            tag="Active"
          />
        </Link>
        <Link href="/admin/external-imports" className="block">
          <AdminCard
            icon={RefreshCw}
            title="External Imports"
            description="Manage external project data imports from 88cn-index-data."
            tag="Active"
          />
        </Link>
        <Link href="/admin/scouted" className="block">
          <AdminCard
            icon={SearchCheck}
            title="Scouted Profiles"
            description="Review observed public-source profiles and intent records."
            tag="Active"
          />
        </Link>
        <Link href="/admin/bulk-review" className="block">
          <AdminCard
            icon={ClipboardList}
            title="Bulk Review"
            description="Inspect backstage project entities, review states, sources, and public-signal previews."
            tag="Active"
          />
        </Link>
        <Link href="/admin/metrics" className="block">
          <AdminCard
            icon={BarChart3}
            title="Conversion Metrics"
            description="Review aggregate counters and Day 30/60/100 pivot gates."
            tag="Active"
          />
        </Link>
        <Link href="/admin/api-keys" className="block">
          <AdminCard
            icon={KeyRound}
            title="API Key Access"
            description="Review the disabled Alpha Data Feed API key shell."
            tag="Disabled"
          />
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <form action="/auth/signout" method="post">
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 rounded-md border border-terminal-border px-3 py-1.5 text-xs font-medium text-terminal-dim hover:text-terminal-fg hover:bg-terminal-surface transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign Out
          </button>
        </form>
        <Link
          href="/"
          className="text-xs text-terminal-dim hover:text-terminal-muted transition-colors"
        >
          Back to site
        </Link>
      </div>
    </div>
  );
}

function AdminCard({
  icon: Icon,
  title,
  description,
  tag,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  tag: string;
}) {
  return (
    <div className="rounded-lg border border-terminal-border bg-terminal-surface p-5">
      <div className="flex items-start justify-between mb-3">
        <Icon className="h-5 w-5 text-terminal-muted" />
        <span className="rounded-md border border-terminal-border px-2 py-0.5 text-[10px] font-medium text-terminal-dim">
          {tag}
        </span>
      </div>
      <h3 className="mb-1 text-sm font-semibold text-terminal-fg">
        {title}
      </h3>
      <p className="text-xs text-terminal-dim leading-relaxed">
        {description}
      </p>
    </div>
  );
}

function UnavailableState() {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full border border-terminal-border bg-terminal-surface">
        <ShieldAlert className="h-5 w-5 text-amber-500" />
      </div>
      <h1 className="mb-2 text-xl font-bold text-terminal-fg">
        Admin Not Configured
      </h1>
      <p className="text-xs text-terminal-dim leading-relaxed">
        Set Supabase environment variables to enable the admin panel.
      </p>
    </div>
  );
}

function NotAuthenticated() {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full border border-terminal-border bg-terminal-surface">
        <Shield className="h-5 w-5 text-terminal-muted" />
      </div>
      <h1 className="mb-2 text-xl font-bold text-terminal-fg">
        Sign In Required
      </h1>
      <p className="mb-4 text-xs text-terminal-dim">
        You must sign in to access the admin panel.
      </p>
      <Link
        href="/admin/login"
        className="inline-flex items-center gap-1.5 rounded-md border border-terminal-border px-4 py-2 text-xs font-semibold text-terminal-fg hover:bg-terminal-surface transition-colors"
      >
        <Shield className="h-3.5 w-3.5" />
        Sign In
      </Link>
    </div>
  );
}

function NotAdmin({ email }: { email?: string }) {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full border border-terminal-border bg-terminal-surface">
        <ShieldAlert className="h-5 w-5 text-red-400" />
      </div>
      <h1 className="mb-2 text-xl font-bold text-terminal-fg">
        Not Authorized
      </h1>
      <p className="text-xs text-terminal-dim leading-relaxed">
        {email ? (
          <>
            <span className="text-terminal-muted">{email}</span> is not an
            admin. Contact the system administrator to request access.
          </>
        ) : (
          "Your account does not have admin privileges."
        )}
      </p>
    </div>
  );
}
