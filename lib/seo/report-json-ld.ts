interface ReportJsonLdInput {
  url: string;
  headline: string;
  description: string;
  datePublished: string;
}

export function reportJsonLd({
  url,
  headline,
  description,
  datePublished,
}: ReportJsonLdInput) {
  return {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    url,
    headline,
    description,
    datePublished,
    dateModified: datePublished,
    author: {
      "@type": "Organization",
      name: "123Charts",
      url: "https://123charts.com",
    },
    publisher: {
      "@type": "Organization",
      name: "123Charts",
      url: "https://123charts.com",
    },
    about: [
      "AI project machine-readability",
      "structured metadata",
      "JSON-LD",
      "crawler-readable project profiles",
    ],
  };
}
