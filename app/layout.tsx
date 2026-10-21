import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";
export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL ?? "http://127.0.0.1:3100"),
  title: {
    default: "123Charts — Discover. Compare. Decide.",
    template: "%s | 123Charts",
  },
  description:
    "Discover projects, compare website data and build your peer observation group. Free to browse and join.",
  robots: { index: false, follow: true },
};
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const incoming = await headers();
  const lang = incoming.get("x-charts-locale") === "zh" ? "zh-CN" : "en";
  return (
    <html lang={lang} suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
