import { NextRequest, NextResponse } from "next/server";
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  if (
    pathname.startsWith("/api/") &&
    !pathname.startsWith("/api/charts/") &&
    !pathname.startsWith("/api/v1/") &&
    pathname !== "/api/healthz"
  )
    return NextResponse.json(
      {
        error:
          "This historical endpoint is not active in 123Charts local preview.",
      },
      { status: 410 },
    );
  // Historical public pages leave the active navigation; the source and Git history remain intact.
  if (pathname.startsWith("/auth/"))
    return NextResponse.json(
      { error: "Historical auth endpoints are retired." },
      { status: 410 },
    );
  const legacy = [
    "alternatives",
    "free",
    "new",
    "dashboard",
    "following",
    "login",
    "how-it-works",
    "open-source",
    "search",
    "products",
    "projects",
    "categories",
    "submit",
    "claim",
    "reports",
    "methodology",
    "collections",
    "founders",
    "genesis",
    "founding-slots",
    "geo-checker",
    "landscape",
    "backers",
    "alpha-feed",
    "scouted",
    "stacks",
    "tasks",
    "verticals",
    "admin",
  ];
  if (legacy.includes(pathname.split("/")[1])) {
    let target = pathname;
    if (/^\/(admin)/.test(target)) target = "/admin";
    else if (/^\/(claim)\//.test(target))
      target = target.replace("/claim/", "/projects/");
    else if (
      !/^\/(open-source|search|products|alternatives|free|new|dashboard|following|login|how-it-works|projects|categories|submit|methodology)/.test(
        target,
      )
    )
      target = "/methodology";
    return NextResponse.redirect(new URL(`/en${target}${search}`, request.url));
  }
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-charts-path", pathname + search);
  requestHeaders.set(
    "x-charts-locale",
    pathname.split("/")[1] === "zh" ? "zh" : "en",
  );
  const response = NextResponse.next({ request: { headers: requestHeaders } });
  if (process.env.CHARTS_LOCAL_PREVIEW !== "false")
    response.headers.set("X-Robots-Tag", "noindex, follow");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-Frame-Options", "DENY");
  if (pathname.startsWith("/api/") || pathname.startsWith("/out/"))
    response.headers.set("Cache-Control", "no-store");
  return response;
}
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|ocr/).*)"],
};
