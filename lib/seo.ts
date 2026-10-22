import { SITE_NAME, SITE_TAGLINE } from "./constants";

export function siteTitle(pageTitle?: string): string {
  if (pageTitle) {
    return `${pageTitle} | ${SITE_NAME}`;
  }
  return `${SITE_NAME} — ${SITE_TAGLINE}`;
}

export function siteDescription(override?: string): string {
  return (
    override ??
    "Discover, track and claim early AI projects with public growth signals. Free AI project profiles and editorial listings on 123Charts."
  );
}

export function siteOgImage(): string {
  return "/og-default.png";
}

export function noIndex(): { robots: { index: boolean; follow: boolean } } {
  return {
    robots: {
      index: false,
      follow: false,
    },
  };
}
