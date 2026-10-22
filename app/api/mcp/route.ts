import { NextRequest, NextResponse } from "next/server";

import { isMcpLocalOnly, isMcpServerEnabled } from "@/lib/mcp/feature-flags";
import { mcpDisabledProblem } from "@/lib/mcp/problem";
import { listMcpTools } from "@/lib/mcp/tools";

const INSTANCE = "/api/mcp";
const PROBLEM_JSON = "application/problem+json";

type JsonRpcRequest = {
  jsonrpc?: string;
  id?: string | number | null;
  method?: string;
};

function disabledResponse(): NextResponse {
  return NextResponse.json(mcpDisabledProblem(INSTANCE), {
    status: 503,
    headers: {
      "Content-Type": PROBLEM_JSON,
    },
  });
}

function isLocalRequest(request: NextRequest): boolean {
  const host = request.headers.get("host")?.split(":")[0].toLowerCase();
  return host === "localhost" || host === "127.0.0.1" || host === "[::1]";
}

function mcpAccessible(request: NextRequest): boolean {
  if (!isMcpServerEnabled()) return false;
  if (isMcpLocalOnly() && !isLocalRequest(request)) return false;
  return true;
}

function serverMetadata() {
  return {
    server: {
      name: "123charts-read-only-mcp",
      version: "0.1.0",
      status: "local_static_metadata_only",
      read_only: true,
      public_api_dependency: true,
    },
    tools: listMcpTools(),
  };
}

export function GET(request: NextRequest) {
  if (!mcpAccessible(request)) return disabledResponse();
  return NextResponse.json(serverMetadata());
}

export async function POST(request: NextRequest) {
  if (!mcpAccessible(request)) return disabledResponse();

  const body = (await request.json().catch(() => null)) as JsonRpcRequest | null;
  const id = body?.id ?? null;

  if (body?.method === "initialize") {
    return NextResponse.json({
      jsonrpc: "2.0",
      id,
      result: {
        protocolVersion: "2024-11-05",
        capabilities: {
          tools: {
            listChanged: false,
          },
        },
        serverInfo: {
          name: "123charts-read-only-mcp",
          version: "0.1.0",
        },
      },
    });
  }

  if (body?.method === "tools/list") {
    return NextResponse.json({
      jsonrpc: "2.0",
      id,
      result: {
        tools: listMcpTools(),
      },
    });
  }

  return NextResponse.json({
    jsonrpc: "2.0",
    id,
    error: {
      code: -32601,
      message: "MCP tool calls are not implemented in PR60 v0.",
    },
  });
}
