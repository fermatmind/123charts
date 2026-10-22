import type { Metadata } from "next";
import { AlphaDataFeedLanding } from "@/components/backers/AlphaDataFeedLanding";
import {
  BACKERS_ALPHA_FEED_DESCRIPTION,
  BACKERS_ALPHA_FEED_PATH,
  BACKERS_ALPHA_FEED_TITLE,
} from "@/lib/seo/backers";
import { siteDescription, siteTitle } from "@/lib/seo";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: siteTitle(BACKERS_ALPHA_FEED_TITLE),
  description: siteDescription(BACKERS_ALPHA_FEED_DESCRIPTION),
  alternates: {
    canonical: `https://123charts.com${BACKERS_ALPHA_FEED_PATH}`,
  },
  robots: { index: true, follow: true },
};

export default function BackersPage() {
  return <AlphaDataFeedLanding />;
}
