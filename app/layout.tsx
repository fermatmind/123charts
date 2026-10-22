import { publicIndexing } from "@/lib/charts/runtime-config";
import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";
import { brand } from "@/lib/charts/brand";
export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL ?? "http://127.0.0.1:3100"),
  title: {
    default: brand.en.title,
    template: "%s | 123Charts",
  },
  description: brand.en.description,
  robots: { index: publicIndexing(process.env), follow: true },
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
