import { publicCatalog } from "./catalog";
import { ensureDiscoveryCycle } from "../../scripts/local/discovery-cycle";
import { publishCategory } from "./publishing";
import WebSocket from "ws";
import "server-only";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Bootstrap, Dataset } from "./types";
import { emptyBootstrap } from "./types";
export function adminDb() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL,
    key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key)
    throw new Error(
      "Local database is not configured. Run npm run local:setup.",
    );
  if (
    process.env.CHARTS_LOCAL_PREVIEW !== "false" &&
    !["localhost", "127.0.0.1"].includes(new URL(url).hostname)
  )
    throw new Error("Local preview refuses non-local database connections.");
  return createClient(url, key, {
    realtime: { transport: WebSocket as any },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
export async function sessionDb() {
  const jar = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      realtime: { transport: WebSocket as any },
      cookieOptions: {
        name: "123charts-auth",
        httpOnly: true,
        sameSite: "lax",
        secure: (process.env.APP_URL ?? "").startsWith("https://"),
      },
      cookies: {
        getAll: () => jar.getAll(),
        setAll: (list) => {
          for (const c of list) {
            try {
              jar.set(c.name, c.value, { ...c.options, sameSite: "lax" });
            } catch {
              /* Server components cannot write cookies. */
            }
          }
        },
      },
    },
  );
}
export async function context() {
  const db = adminDb(),
    auth = await sessionDb();
  const {
    data: { user },
  } = await auth.auth.getUser();
  const { data: row } = user
    ? await db
        .from("admin_users")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle()
    : { data: null };
  return { db, auth, user, isAdmin: !!row };
}
export function checked<T>(r: {
  data: T;
  error: { message: string } | null;
}): NonNullable<T> {
  if (r.error) throw new Error(r.error.message);
  return r.data as NonNullable<T>;
}
export async function bootstrap(
  dataset: Dataset,
  zone: "public" | "dashboard" | "admin" = "dashboard",
): Promise<Bootstrap> {
  let c: Awaited<ReturnType<typeof context>>;
  try {
    c = await context();
  } catch {
    return { ...emptyBootstrap };
  }
  const { db, user, isAdmin } = c,
    demo = dataset === "demo";
  const catalog = await publicCatalog(dataset);
  const result: Bootstrap = {
    ...emptyBootstrap,
    discoveryCycle: await ensureDiscoveryCycle(db, demo),
    as_of: new Date().toISOString(),
    configured: true,
    categories: catalog.categories,
    categoryFollowers: checked(
      await db
        .from("charts_follows")
        .select("target")
        .eq("kind", "category")
        .limit(5000),
    ).reduce((counts: Record<string, number>, f: { target: string }) => {
      counts[f.target] = (counts[f.target] ?? 0) + 1;
      return counts;
    }, {}),
    memberships: checked(
      await db
        .from("charts_memberships")
        .select("project_id,category,state,placement,basis,reviewed_at")
        .order("project_id"),
    ),
    projects: catalog.projects,
    relations: catalog.relations,
    user: user ? { id: user.id, email: user.email ?? "" } : null,
    isAdmin,
  };
  const publicClaims = checked(
    await db
      .from("charts_claims")
      .select("project_id")
      .eq("state", "approved")
      .limit(500),
  );
  result.projects = result.projects.map((p) => ({
    ...p,
    owner_verified: publicClaims.some((c) => c.project_id === p.id),
    controller_id: null,
  }));
  if (zone === "public") {
    if (user)
      result.follows = checked(
        await db
          .from("charts_follows")
          .select("*")
          .eq("owner_id", user.id)
          .order("created_at", { ascending: true }),
      );
    return result;
  }
  if (isAdmin)
    result.researchQueue = checked(
      await db
        .from("charts_projects")
        .select("*")
        .neq("publication", "published")
        .eq("demo", demo)
        .order("collected_at", { ascending: false })
        .limit(200),
    );
  if (!user) return result;
  const own = (table: string, field = "owner_id") => {
    const q = db
      .from(table)
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    return isAdmin ? q : q.eq(field, user.id);
  };
  const a = checked(await own("charts_applications")).filter(
    (x: any) => x.demo === demo,
  );
  result.applications = a;
  result.evidence = checked(await own("charts_evidence")).filter(
    (x: any) => x.demo === demo,
  );
  result.reports = checked(await own("charts_reports")).filter(
    (x: any) => x.demo === demo,
  );
  result.claims = checked(await own("charts_claims"));
  result.corrections = checked(await own("charts_corrections"));
  result.jobs = checked(await own("charts_jobs"));
  if (a.length) {
    const ownRelations = checked(
      await db
        .from("charts_relations")
        .select("*")
        .in(
          "application_id",
          a.map((x) => x.id),
        )
        .order("peer_domain"),
    );
    result.relations = [
      ...new Map(
        [
          ...result.relations,
          ...ownRelations.map((r: any) => ({
            ...r,
            public:
              a.find((x: any) => x.id === r.application_id)?.status ===
              "approved",
          })),
        ].map((r) => [r.id, r]),
      ).values(),
    ];
  }
  result.follows = checked(
    await db
      .from("charts_follows")
      .select("*")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: true }),
  );
  result.notifications = checked(
    await db
      .from("charts_notifications")
      .select("*")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false })
      .limit(40),
  );
  const owned = isAdmin
    ? [...result.projects, ...result.researchQueue].map((p) => p.id)
    : result.claims
        .filter((x) => x.state === "approved" && x.owner_id === user.id)
        .map((x) => x.project_id);
  result.managedProjects = owned.length
    ? checked(
        await db
          .from("charts_projects")
          .select("*")
          .in("id", owned)
          .eq("demo", demo),
      )
    : [];
  const allowed = [...new Set(owned)].filter((id) =>
    result.managedProjects.some((p) => p.id === id),
  );
  if (allowed.length)
    result.events = checked(
      await db
        .from("charts_events")
        .select(
          "project_id,kind,excluded,exclusion_reason,visitor_id,surface,created_at",
        )
        .in("project_id", allowed)
        .gte("created_at", new Date(Date.now() - 30 * 86400000).toISOString())
        .order("created_at", { ascending: false })
        .limit(5000),
    );
  return result;
}
export async function createSnapshot(
  category: string,
  month: string,
  demo: boolean,
  note: string,
  source = "AITDK",
) {
  return publishCategory(adminDb(), category, month, demo, note, source);
}
