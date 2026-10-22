import { test, expect } from "@playwright/test";
import fs from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import WebSocket from "ws";
import sharp from "sharp";
import { loadEnv } from "../../../scripts/local/env.mjs";
loadEnv();
const accounts = JSON.parse(await fs.readFile(".local/accounts.json", "utf8"));
const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    realtime: { transport: WebSocket as any },
    auth: { persistSession: false },
  },
);
const created: string[] = [];
async function signIn(page: any, role: string) {
  await page.goto("/en/login?dataset=demo");
  await page.getByLabel("Email address").fill(accounts[role].email);
  await page
    .getByLabel("Password", { exact: true })
    .fill(accounts[role].password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Your project, in perspective." }),
  ).toBeVisible();
}
test("discovery, keyboard search, bilingual state and responsive layout", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/en?dataset=demo");
  await expect(
    page.getByRole("heading", { name: /A clearer view/ }),
  ).toBeVisible();
  await expect(page.locator("tbody tr").first()).toBeVisible();
  await page.screenshot({
    path: "output/playwright/home-desktop.png",
    fullPage: true,
  });
  await page.keyboard.press("Meta+k");
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByLabel("Search query").fill("Cursor");
  await page
    .getByRole("dialog")
    .getByRole("link", { name: /Cursor/ })
    .click();
  await expect(page).toHaveURL(/\/en\/projects\/cursor/);
  await expect(
    page.getByRole("heading", { name: "Cursor", exact: true }),
  ).toBeVisible();
  await page.goto(
    "/en/charts?dataset=demo&category=knowledge-search&month=2026-08&page=2",
  );
  await page.getByRole("link", { name: "中", exact: true }).click();
  await expect(page).toHaveURL(/\/zh\/charts\/knowledge-search/);
  expect(new URL(page.url()).pathname).toBe("/zh/charts/knowledge-search");
  expect(new URL(page.url()).searchParams.get("month")).toBe("2026-08");
  expect(new URL(page.url()).searchParams.get("page")).toBe("2");
  await expect(
    page.getByRole("heading", { name: "知识搜索与 RAG网站流量榜" }),
  ).toBeVisible();
  await page.screenshot({
    path: "output/playwright/charts-zh.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/zh?dataset=demo");
  await expect(page.getByRole("heading", { name: /看清网站/ })).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "output/playwright/home-mobile-zh.png",
    fullPage: true,
  });
  await page.goto("/en?dataset=real");
  await expect(page.getByText(/RESEARCH DATA/)).toBeVisible();
  await expect(
    page
      .getByText("Awaiting comparable verified data.", { exact: true })
      .first(),
  ).toBeVisible();
  await expect(page.getByText("Demo verified", { exact: true })).toHaveCount(0);
  expect(errors).toEqual([]);
});
test("private reports, revocable sharing, bilingual PNG and subscriptions", async ({
  page,
  browser,
}) => {
  await signIn(page, "founder");
  await page.locator('a[href*="/reports/"]').first().click();
  await expect(
    page.getByRole("heading", { name: "My peer comparison." }),
  ).toBeVisible();
  expect(
    await page.locator('[aria-label="Saved peer report"] tbody tr').count(),
  ).toBe(10);
  const revoke = page.getByRole("button", { name: "Revoke share link" });
  if (await revoke.count()) await revoke.click();
  await page.getByRole("button", { name: "Enable sharing" }).click();
  const href = await page
    .getByRole("link", { name: "Open shared report" })
    .getAttribute("href");
  const guest = await browser.newContext();
  const shared = await guest.newPage();
  await shared.goto(`http://127.0.0.1:3100${href}`);
  await expect(shared.locator("tbody tr")).toHaveCount(10);
  await page.getByRole("button", { name: "Revoke share link" }).click();
  await shared.reload();
  await expect(
    shared.getByRole("heading", { name: "Shared report unavailable" }),
  ).toBeVisible();
  await guest.close();
  await page.getByRole("button", { name: "Preview share card" }).click();
  const image = page.getByAltText("Project share card");
  await expect(image).toBeVisible();
  await expect
    .poll(() => image.evaluate((e: HTMLImageElement) => e.naturalWidth))
    .toBe(1200);
  const src = await image.getAttribute("src");
  for (const lang of ["en", "zh"]) {
    const r = await page.request.get(src!.replace("lang=en", `lang=${lang}`));
    expect(r.status()).toBe(200);
    expect(r.headers()["content-type"]).toContain("image/png");
    const bytes = await r.body();
    expect((await sharp(bytes).metadata()).width).toBe(1200);
    await fs.writeFile(`output/playwright/card-${lang}.png`, bytes);
  }
  await page.goto("/en/projects/cursor?dataset=demo");
  const save = page.getByRole("button", { name: "Save", exact: true });
  if (await save.count()) await save.click();
  await page.goto("/en/following?dataset=demo");
  await expect(page.getByRole("link", { name: /Cursor/ })).toBeVisible();
  await page.goto("/en/categories?dataset=demo");
  const category = page.locator(".category-item").first();
  const follow = category.getByRole("button", { name: "Follow", exact: true });
  if (await follow.count()) await follow.click();
  await page.goto("/en/following?dataset=demo");
  const checkbox = page.getByRole("checkbox").first();
  await checkbox.check();
  await expect(checkbox).toBeChecked();
  await page.screenshot({
    path: "output/playwright/following.png",
    fullPage: true,
  });
});
test("browser submission, saved draft, OCR, administrator review and delivery", async ({
  page,
  browser,
}) => {
  test.setTimeout(180000);
  await signIn(page, "founder");
  const suffix = randomUUID().slice(0, 8),
    name = `Browser demonstration ${suffix}`;
  const peers = (
    await db
      .from("charts_projects")
      .select("*")
      .eq("category", "knowledge-search")
      .eq("demo", false)
      .order("domain")
      .limit(10)
  ).data!;
  await page.goto("/en/submit?dataset=demo");
  await page
    .getByLabel("Official website URL")
    .fill(`https://browser-${suffix}.example`);
  await page.getByLabel("Project name", { exact: true }).fill(name);
  await page.getByLabel("Primary category").selectOption("knowledge-search");
  await page
    .getByLabel("English description")
    .fill("A fictional browser acceptance test project.");
  await page.getByLabel("中文介绍").fill("用于浏览器验收的虚构项目。");
  await page.getByRole("button", { name: "Save draft", exact: true }).click();
  await expect(page.getByText("Saved to your account")).toBeVisible();
  const id = new URL(page.url()).searchParams.get("id");
  expect(id).toBeTruthy();
  created.push(id!);
  await page
    .locator(".wizard-actions")
    .getByRole("button", { name: "Continue", exact: true })
    .click();
  await page
    .getByLabel("Paste website URLs in bulk")
    .fill(peers.map((p) => p.domain).join("\n"));
  await page.getByRole("button", { name: "Add websites", exact: true }).click();
  await expect(page.getByLabel("Shared task", { exact: true })).toHaveCount(10);
  for (let i = 0; i < 10; i++) {
    await page
      .getByLabel("Shared task", { exact: true })
      .nth(i)
      .fill("Document retrieval");
    await page
      .getByLabel("Why can these products be compared?", { exact: true })
      .nth(i)
      .fill(
        "Shared retrieval task; compare different product layers and usage constraints.",
      );
  }
  await page.getByRole("button", { name: "Save draft", exact: true }).click();
  await expect(page.getByText("Saved to your account")).toBeVisible();
  await page.reload();
  await expect(page.getByLabel("Project name", { exact: true })).toHaveValue(
    name,
  );
  await page
    .locator(".wizard-actions")
    .getByRole("button", { name: "Continue", exact: true })
    .click();
  await expect(
    page.getByLabel("Shared task", { exact: true }).first(),
  ).toHaveValue("Document retrieval");
  await page
    .locator(".wizard-actions")
    .getByRole("button", { name: "Continue", exact: true })
    .click();
  for (const p of peers.slice(0, 5)) {
    await page.getByLabel("This batch belongs to").selectOption(p.domain);
    await page
      .getByLabel("Upload screenshots", { exact: true })
      .setInputFiles(`.local/fixtures/${p.domain}.png`);
    await expect(
      page.getByText(`${p.domain}.png`, { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByLabel("Upload screenshots", { exact: true }),
    ).toBeEnabled();
  }
  await expect
    .poll(
      async () => {
        const rows = await db
          .from("charts_evidence")
          .select("state")
          .eq("application_id", id);
        return rows.data?.filter((e) => e.state === "pending_review").length;
      },
      { timeout: 90000 },
    )
    .toBe(5);
  await page.reload();
  await page
    .locator(".wizard-actions")
    .getByRole("button", { name: "Continue", exact: true })
    .click();
  await page
    .locator(".wizard-actions")
    .getByRole("button", { name: "Continue", exact: true })
    .click();
  await page.screenshot({
    path: "output/playwright/submission-ocr.png",
    fullPage: true,
  });
  await page
    .getByRole("button", { name: "Submit for review", exact: true })
    .click();
  await expect(
    page.getByText("Your application is being reviewed.", { exact: false }),
  ).toBeVisible();
  const adminContext = await browser.newContext({
      viewport: { width: 1440, height: 1000 },
    }),
    review = await adminContext.newPage();
  await signIn(review, "admin");
  await review.goto(`/en/admin?dataset=demo&application=${id}`);
  for (const p of peers) {
    const relation = review
      .locator(".review-block")
      .filter({ has: review.getByText(p.domain, { exact: true }) });
    await relation
      .getByRole("button", { name: "Relevant", exact: true })
      .click();
    await expect(relation.getByText("Approved", { exact: true })).toBeVisible();
  }
  for (const p of peers.slice(0, 5)) {
    const block = review.locator("section.panel").filter({
      has: review.getByRole("heading", { name: p.domain, exact: true }),
    });
    await block
      .getByRole("button", { name: "Load private original", exact: true })
      .click();
    await expect(
      block.getByAltText("Original submitted screenshot"),
    ).toBeVisible();
    await block
      .getByLabel("Review channel", { exact: true })
      .fill("Synthetic screenshot review");
    await block
      .getByLabel("Review reference", { exact: true })
      .fill("demo://synthetic-traffic-never-real");
    await block
      .getByLabel("Review note / correction explanation")
      .fill("Fixed synthetic screenshot only; no real traffic claim.");
    await block
      .getByRole("button", { name: "Verify evidence", exact: true })
      .click();
    await expect(
      block.getByText("Evidence verified", { exact: true }),
    ).toBeVisible();
  }
  await expect(review.getByText("10/10", { exact: true })).toBeVisible();
  await review
    .getByRole("button", { name: "Approve & deliver", exact: true })
    .click();
  await expect
    .poll(
      async () =>
        (
          await db
            .from("charts_applications")
            .select("status")
            .eq("id", id)
            .single()
        ).data?.status,
    )
    .toBe("approved");
  await review.screenshot({
    path: "output/playwright/admin-approved.png",
    fullPage: true,
  });
  await adminContext.close();
  await page.goto("/en/dashboard?dataset=demo");
  await page.locator('a[href*="/reports/"]').filter({ hasText: name }).click();
  await expect(
    page.locator('[aria-label="Saved peer report"] tbody tr'),
  ).toHaveCount(10);
  await page.screenshot({
    path: "output/playwright/delivered-report.png",
    fullPage: true,
  });
});
test.afterAll(async () => {
  for (const id of created) {
    const app = (
      await db
        .from("charts_applications")
        .select("project_id")
        .eq("id", id)
        .single()
    ).data;
    const ev =
      (await db.from("charts_evidence").select("*").eq("application_id", id))
        .data ?? [];
    for (const e of ev)
      await db
        .from("charts_jobs")
        .delete()
        .contains("payload", { evidence_id: e.id });
    if (ev.length) {
      await db.storage
        .from("charts-evidence")
        .remove(ev.map((e) => e.storage_path));
      await db.from("charts_evidence").delete().eq("application_id", id);
    }
    await db.from("charts_reports").delete().eq("application_id", id);
    await db.from("charts_relations").delete().eq("application_id", id);
    await db
      .from("charts_notifications")
      .delete()
      .eq("dedupe_key", `approved:${id}`);
    await db.from("charts_applications").delete().eq("id", id);
    if (app?.project_id) {
      await db.from("charts_events").delete().eq("project_id", app.project_id);
      await db
        .from("charts_contributions")
        .delete()
        .eq("project_id", app.project_id);
      await db.from("charts_projects").delete().eq("id", app.project_id);
    }
  }
});

test("category directory, stable category ranks, scope exclusions and shared snapshot JSON", async ({
  page,
  request,
}) => {
  await page.goto("/zh/charts?dataset=demo");
  await expect(
    page.getByRole("heading", { name: "分类流量榜", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".category-summary")).toHaveCount(3);
  await page.getByLabel("搜索分类").fill("编程");
  await expect(page.locator(".category-summary")).toHaveCount(1);
  await page.getByRole("link", { name: /查看完整榜单/ }).click();
  await expect(page).toHaveURL(/\/zh\/charts\/ai-coding/);
  await expect(
    page.getByRole("heading", { name: "AI 编程辅助网站流量榜" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "相关综合平台" }),
  ).toBeVisible();
  await expect(
    page.locator(".category-rank-table").getByText(/AWS/),
  ).toHaveCount(0);
  const second = page
    .locator(".category-rank-table tbody tr[data-project]")
    .nth(1);
  const name = await second.locator("strong").innerText(),
    rank = await second.locator("td").first().innerText();
  await page.getByLabel("筛选网站").fill(name);
  await expect(
    page.locator(".category-rank-table tbody tr[data-project]"),
  ).toHaveCount(1);
  await expect(
    page.locator(".category-rank-table tbody tr[data-project] td").first(),
  ).toHaveText(rank);
  await page.getByRole("link", { name: "EN", exact: true }).click();
  await expect(page).toHaveURL(/\/en\/charts\/ai-coding/);
  expect(new URL(page.url()).searchParams.get("q")).toBe(name);
  const jsonLink = await page
    .getByRole("link", { name: "Read this exact snapshot as JSON" })
    .getAttribute("href");
  const response = await request.get(jsonLink!);
  expect(response.ok()).toBe(true);
  const snapshot = await response.json();
  expect(snapshot.demo).toBe(true);
  expect(snapshot.category).toBe("ai-coding");
  expect(
    snapshot.entries.every(
      (e: any) =>
        e.month === snapshot.month &&
        e.source === snapshot.source &&
        e.snapshot_version === snapshot.version,
    ),
  ).toBe(true);
  await page.goto("/en/charts/ai-coding?dataset=demo&month=2026-09&page=2");
  await page.getByRole("button", { name: "←", exact: true }).click();
  await expect
    .poll(() => new URL(page.url()).searchParams.get("page"))
    .toBe("1");
  await page.goto(
    "/zh/charts/ai-coding?dataset=real&month=2026-09&source=Semrush%20public",
  );
  await expect(
    page.locator(".category-rank-table").getByText("35.49M", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "详情", exact: true }).click();
  await expect(page.locator(".rank-evidence")).toContainText("cursor.com");
  await expect(page.locator(".rank-evidence")).toContainText("Semrush public");
  await expect(
    page.getByRole("heading", { name: /本期未参与排名/ }),
  ).toBeVisible();
  await page.screenshot({
    path: "output/playwright/category-real-desktop.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: "output/playwright/category-real-mobile.png",
    fullPage: true,
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.locator(".category-rank-table a").first().click();
  await expect(page).toHaveURL(/\/zh\/projects\/cursor/);
  expect(new URL(page.url()).searchParams.get("source")).toBe("Semrush public");
  expect(new URL(page.url()).searchParams.get("month")).toBe("2026-09");
  await expect(
    page.getByText(/2026-09 · Semrush public/).first(),
  ).toBeVisible();
  const pinned = new URL(page.url()).searchParams.get("snapshot");
  await expect(page.getByRole("link", { name: /分享卡片/ })).toHaveAttribute(
    "href",
    new RegExp("snapshot=" + pinned),
  );
  await page.goto(
    "/en/charts/ai-coding?dataset=demo&month=2026-09&version=999999",
  );
  await expect(
    page.getByText(/No published snapshot for this selection/),
  ).toBeVisible();
  await expect(page.locator(".category-rank-table")).toHaveCount(0);
});
