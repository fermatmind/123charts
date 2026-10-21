import { getPublicScoutedProfilePlaceholder } from "@/lib/scouted/public-profile";
import { noIndex, siteTitle } from "@/lib/seo";
import type { Metadata } from "next";

export async function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const params = await props.params;
  return {
    title: siteTitle(`Scouted profile - ${params.slug}`),
    ...noIndex(),
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function ScoutedProfilePage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const profile = getPublicScoutedProfilePlaceholder(params.slug);

  return (
    <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <div className="mb-4 text-[10px] font-mono uppercase tracking-widest text-terminal-dim">
        Scouted profile
      </div>
      <h1 className="mb-3 text-2xl font-bold tracking-tight text-terminal-fg">
        {profile.slug}
      </h1>
      <div className="mb-6 flex flex-wrap gap-2 text-[10px]">
        <span className="rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 font-medium text-amber-300">
          {profile.indexStatus}
        </span>
        <span className="rounded-md border border-terminal-border px-2 py-0.5 text-terminal-dim">
          {profile.followPolicy}
        </span>
      </div>
      <p className="text-sm leading-relaxed text-terminal-dim">
        This is an observed public-source placeholder. It is not a published project profile,
        not included in sitemap, and not exposed through public API data.
      </p>
    </main>
  );
}
