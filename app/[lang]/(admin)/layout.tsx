import { context } from "@/lib/charts/server";
import { redirect, notFound } from "next/navigation";
export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const { user, isAdmin } = await context();
  if (!user)
    redirect(
      `/${lang}/login?returnTo=${encodeURIComponent(`/${lang}/admin/review`)}`,
    );
  if (!isAdmin) notFound();
  return <section data-zone="admin">{children}</section>;
}
