import type { ProblemDetail } from "@/lib/api/problem";

export function mcpDisabledProblem(instance: string): ProblemDetail {
  return {
    type: "https://123charts.com/problems/mcp-disabled",
    title: "MCP server is disabled",
    status: 503,
    detail: "The MCP server is not enabled for this environment.",
    instance,
  };
}
