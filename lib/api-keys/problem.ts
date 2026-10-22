import type { ProblemDetail } from "@/lib/api/problem";

export const API_KEY_SHELL_INSTANCE = "/api/alpha-feed/api-keys";

export function apiKeysDisabledProblem(): ProblemDetail {
  return {
    type: "https://123charts.com/problems/api-keys-disabled",
    title: "API key access is disabled",
    status: 503,
    detail: "Alpha Data Feed API key access is not enabled for this environment.",
    instance: API_KEY_SHELL_INSTANCE,
  };
}
