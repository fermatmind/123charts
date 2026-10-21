import { notFound } from "next/navigation";
import { FeaturedVerifiedSignals } from "@/components/featured/FeaturedVerifiedSignals";
import { getCategoryBySlug, demoCategories } from "@/lib/demo-categories";
import { getProjectBySlug, getPublishedProjects } from "@/lib/demo-projects";
import { CategoryHub } from "@/components/category-hub";
import { webPageJSONLD, itemListJSONLD } from "@/lib/structured-data";
import { siteTitle, siteDescription } from "@/lib/seo";
import type { Metadata } from "next";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return demoCategories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata(props: CategoryPageProps): Promise<Metadata> {
  const params = await props.params;
  const category = getCategoryBySlug(params.slug);
  if (!category) return { title: "Not Found" };

  return {
    title: siteTitle(`${category.title} AI Projects`),
    description: siteDescription(
      `Browse ${category.title} AI projects on 88CN. ${category.overview.slice(0, 120)}`
    ),
    robots: { index: true, follow: true },
  };
}

export default async function CategoryPage(props: CategoryPageProps) {
  const params = await props.params;
  const category = getCategoryBySlug(params.slug);
  if (!category) notFound();

  const baseUrl =
    process.env.APP_URL ?? "http://localhost:3000";
  const pageUrl = `${baseUrl}/categories/${category.slug}`;

  const projects = category.projectSlugs
    .map((slug) => getProjectBySlug(slug))
    .filter((p): p is NonNullable<typeof p> => p !== undefined);

  const webPageLD = webPageJSONLD(
    pageUrl,
    `${category.title} AI Projects`,
    category.overview
  );

  const itemListLD = itemListJSONLD(
    projects.map((p) => ({
      url: `${baseUrl}/projects/${p.slug}`,
      name: p.name,
    }))
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageLD) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLD) }}
      />
      <FeaturedVerifiedSignals
        surface="category"
        categorySlug={category.slug}
        className="mb-10 px-0 sm:px-0"
      />
      <CategoryHub category={category} projects={projects} />
    </div>
  );
}
