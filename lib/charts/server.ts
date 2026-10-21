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
export async function bootstrap(dataset: Dataset): Promise<Bootstrap> {
  let c: Awaited<ReturnType<typeof context>>;
  try {
    c = await context();
  } catch {
    return { ...emptyBootstrap };
  }
  const { db, user, isAdmin } = c,
    demo = dataset === "demo";
  const [categories, projects, traffic, snapshots, months, recommendations] =
    await Promise.all([
      db.from("charts_categories").select("*").order("slug"),
      db
        .from("charts_projects")
        .select("*")
        .eq("publication", "published")
        .order("name")
        .limit(300),
      db
        .from("charts_traffic")
        .select(
          "id,domain,source,month,metric,scope,value,version,state,demo,correction_note,verified_at,raw_display,precision_step",
        )
        .eq("demo", demo)
        .in("state", ["verified", "conflict", "superseded"])
        .order("month", { ascending: false })
        .limit(1000),
      db
        .from("charts_snapshots")
        .select("*")
        .eq("demo", demo)
        .order("created_at", { ascending: false })
        .limit(50),
      db
        .from("charts_source_months")
        .select("*")
        .eq("demo", demo)
        .order("month", { ascending: false }),
      db
        .from("charts_recommendations")
        .select("*")
        .eq("demo", demo)
        .eq("day", new Date().toISOString().slice(0, 10))
        .order("slot")
        .limit(20),
    ]);
  const result: Bootstrap = {
    ...emptyBootstrap,
    as_of: new Date().toISOString(),
    configured: !categories.error,
    categories: checked(categories),
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
    checks: checked(
      await db.from("charts_public_checks").select("*").eq("demo", demo),
    ),
    projects: checked(projects).filter((p) => demo || !p.demo),
    traffic: checked(traffic),
    snapshots: checked(snapshots),
    months: checked(months),
    recommendations: checked(recommendations),
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
  const publicProjects = result.projects.map((p) => p.id);
  if (publicProjects.length)
    result.relations = checked(
      await db
        .from("charts_relations")
        .select("id,project_id,peer_domain,peer_name,task,rationale,status")
        .eq("status", "approved")
        .in("project_id", publicProjects)
        .order("peer_domain")
        .limit(1000),
    ) as any;
  if (isAdmin)
    result.researchQueue = checked(
      await db
        .from("charts_projects")
        .select("*")
        .neq("publication", "published")
        .order("collected_at", { ascending: false })
        .limit(200),
    );
  if (isAdmin) {
    result.verificationTasks = checked(
      await db
        .from("charts_verification_tasks")
        .select("*")
        .eq("demo", demo)
        .order("priority", { ascending: false })
        .limit(200),
    );
    result.receipts = checked(
      await db
        .from("charts_verification_receipts")
        .select(
          "id,task_id,source_url,response_hash,extracted,outcome,detail,actual_calls,cost_usd,attempted_at,success_at,traffic_id",
        )
        .order("attempted_at", { ascending: false })
        .limit(100),
    );
    result.verificationSettings = checked(
      await db
        .from("charts_settings")
        .select("value")
        .eq("key", "verification")
        .single(),
    ).value;
  }
  if (!user) return result;
  const own = (table: string, field = "owner_id") => {
    const q = db
      .from(table)
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    return isAdmin ? q : q.eq(field, user.id);
  };
  const a = checked(await own("charts_applications"));
  result.applications = a;
  result.evidence = checked(await own("charts_evidence"));
  result.reports = checked(await own("charts_reports"));
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
        [...result.relations, ...ownRelations].map((r) => [r.id, r]),
      ).values(),
    ];
  }
  result.follows = checked(
    await db.from("charts_follows").select("*").eq("owner_id", user.id),
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
    ? result.projects.map((p) => p.id)
    : result.claims
        .filter((x) => x.state === "approved" && x.owner_id === user.id)
        .map((x) => x.project_id);
  const ownAppProjects = a
    .filter((x) => x.owner_id === user.id && x.status === "approved")
    .map((x) => x.project_id)
    .filter(Boolean); // Effect records also belong to the original approved applicant.
  const allowed = [...new Set([...owned, ...ownAppProjects])];
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
