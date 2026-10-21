import { context } from "@/lib/charts/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
export default async function PersonalLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const h = await headers(),
    path = h.get("x-charts-path") || `/${lang}/dashboard`;
  const { user } = await context();
  if (!user && !path.includes("/login"))
    redirect(`/${lang}/login?returnTo=${encodeURIComponent(path)}`);
  return <section data-zone="dashboard">{children}</section>;
}
