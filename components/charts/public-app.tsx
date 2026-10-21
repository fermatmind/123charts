"use client";
import { ChartsProvider, Empty } from "./context";
import { ZoneFrame } from "./site-shell";
import type { Bootstrap, Dataset, Locale } from "@/lib/charts/types";
import {
  DiscoveryHome,
  DiscoveryListing,
  DiscoveryCategories,
  AlternativesPage,
  DiscoveryDetail,
  DiscoveryShared,
  DiscoveryMethod,
} from "./discovery-views";
export interface ZoneProps {
  initial: Bootstrap;
  dataset: Dataset;
  locale: Locale;
  path: string[];
}
export default function PublicApp(props: ZoneProps) {
  const [first, slug] = props.path;
  let view: React.ReactNode = !first ? (
    <DiscoveryHome />
  ) : first === "products" ? (
    <DiscoveryDetail slug={slug} />
  ) : first === "categories" ? (
    slug ? (
      <DiscoveryListing category={slug} />
    ) : (
      <DiscoveryCategories />
    )
  ) : first === "alternatives" ? (
    <AlternativesPage slug={slug} />
  ) : first === "shared" ? (
    <DiscoveryShared token={slug} />
  ) : first === "free" ? (
    <DiscoveryListing mode="free" />
  ) : first === "open-source" ? (
    <DiscoveryListing mode="open-source" />
  ) : first === "new" ? (
    <DiscoveryListing mode="new" />
  ) : first === "projects" || first === "search" ? (
    <DiscoveryListing />
  ) : (
    <DiscoveryMethod />
  );
  if (!props.initial.configured)
    view = (
      <Empty title="Run npm run local:setup to initialize the local database." />
    );
  return (
    <ChartsProvider {...props} zone="public">
      <ZoneFrame zone="public">{view}</ZoneFrame>
    </ChartsProvider>
  );
}
