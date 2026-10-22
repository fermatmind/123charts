import { BulkControlPanel } from "@/components/admin/bulk-control-panel";
import {
  getBulkControlPanelData,
  parseBulkControlPanelFilters,
} from "@/lib/admin/bulk-control-panel";
import { checkAdminGuard } from "@/lib/auth/admin";
import { noIndex, siteTitle } from "@/lib/seo";
import { Shield, ShieldAlert } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: siteTitle("Admin - Bulk Review"),
  ...noIndex(),
};

export const dynamic = "force-dynamic";

export default async function BulkReviewPage(
  props: {
    searchParams: Promise<Record<string, string | string[] | undefined>>;
  }
) {
  const searchParams = await props.searchParams;
  const guard = await checkAdminGuard();

  if (!guard.isAuthenticated) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <Shield className="mb-4 inline-block h-12 w-12 text-terminal-muted" />
        <h1 className="mb-2 text-xl font-bold text-terminal-fg">Sign In Required</h1>
        <Link href="/admin/login" className="text-xs text-terminal-muted underline">
          Sign In
        </Link>
      </div>
    );
  }

  if (!guard.isAdmin) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <ShieldAlert className="mb-4 inline-block h-12 w-12 text-red-400" />
        <h1 className="mb-2 text-xl font-bold text-terminal-fg">Not Authorized</h1>
      </div>
    );
  }

  const filters = parseBulkControlPanelFilters(searchParams);
  const data = await getBulkControlPanelData(filters);

  return <BulkControlPanel data={data} filters={filters} />;
}
