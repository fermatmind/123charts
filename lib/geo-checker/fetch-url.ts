import { ssrfGuard } from "./ssrf-guard";
import type { FetchResult } from "./types";

const TIMEOUT_MS = 5000;
const MAX_BODY_SIZE = 256 * 1024;
const MAX_REDIRECTS = 2;
const USER_AGENT = "123Charts-ReadinessChecker/0.1 (+https://123charts.com/geo-checker)";

export async function fetchUrl(rawUrl: string): Promise<{ ok: true; result: FetchResult } | { ok: false; error: string; status: number }> {
  const guardResult = ssrfGuard(rawUrl);
  if (!guardResult.ok) {
    return guardResult;
  }

  let currentUrl = guardResult.normalized_url;
  let redirects = 0;

  while (redirects <= MAX_REDIRECTS) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    let response: Response;
    try {
      response = await fetch(currentUrl, {
        method: "GET",
        headers: {
          "Accept": "text/html,application/xhtml+xml",
          "User-Agent": USER_AGENT,
        },
        signal: controller.signal,
        redirect: "manual",
      });
    } catch (e: unknown) {
      clearTimeout(timeout);
      const name = (e as Error)?.name;
      if (name === "AbortError" || name === "TimeoutError") {
        return { ok: false, error: "The request timed out.", status: 504 };
      }
      return { ok: false, error: "Could not reach the URL.", status: 502 };
    }
    clearTimeout(timeout);

    // Redirect handling
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get("location");
      if (!location) {
        return { ok: false, error: "Redirect without Location header.", status: 502 };
      }

      const redirectGuard = ssrfGuard(location);
      if (!redirectGuard.ok) {
        return { ok: false, error: "Redirect target is not allowed.", status: 400 };
      }

      currentUrl = redirectGuard.normalized_url;
      redirects++;
      continue;
    }

    if (!response.ok) {
      return { ok: false, error: `Remote server returned ${response.status}.`, status: 502 };
    }

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("text/html") && !contentType.includes("application/xhtml")) {
      return { ok: false, error: "The URL does not return an HTML page.", status: 415 };
    }

    const contentLength = response.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) > MAX_BODY_SIZE) {
      return { ok: false, error: "Response body exceeds size limit.", status: 413 };
    }

    const text = await response.text();
    if (text.length > MAX_BODY_SIZE) {
      return { ok: false, error: "Response body exceeds size limit.", status: 413 };
    }

    const headers: Record<string, string> = {};
    response.headers.forEach((v, k) => { headers[k] = v; });

    return {
      ok: true,
      result: {
        normalized_url: currentUrl,
        status: response.status,
        headers,
        body: text.slice(0, MAX_BODY_SIZE),
      },
    };
  }

  return { ok: false, error: "Too many redirects.", status: 400 };
}
