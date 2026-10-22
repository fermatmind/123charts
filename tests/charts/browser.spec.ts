import { test, expect } from "@playwright/test";
import fs from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import WebSocket from "ws";
import { loadEnv } from "../../scripts/local/env.mjs";
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
async function signIn(page: any, role: string) {
  await page.goto("/en/login?dataset=demo");
  await page.getByLabel("Email address").fill(accounts[role].email);
  await page
    .getByLabel("Password", { exact: true })
    .fill(accounts[role].password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Your project, discovered." }),
  ).toBeVisible();
}
test("browser draft recovery, three peers, review, shared comparison and factual card", async ({
  page,
  browser,
}) => {
  test.setTimeout(120000);
  const name = "Browser Discovery " + randomUUID().slice(0, 6);
  const adminCtx = await browser.newContext();
  const staff = await adminCtx.newPage();
  let appId: string | undefined, pid: string | undefined;
  try {
    await signIn(page, "founder");
    await page.goto("/en/submit?dataset=demo");
    await page
      .getByLabel("Official website URL", { exact: true })
      .fill("https://browser-" + randomUUID().slice(0, 8) + ".example");
    await page.getByLabel("Tool name", { exact: true }).fill(name);
    await page
      .getByLabel("English description")
      .fill("A fictional document search project for browser acceptance.");
    await page
      .getByLabel("Chinese description")
      .fill("用于浏览器验收的虚构文档搜索项目。");
    await page.getByRole("button", { name: "Save draft", exact: true }).click();
    await expect(page.getByRole("link", { name: "Resume link" })).toBeVisible();
    const resume = await page
      .getByRole("link", { name: "Resume link" })
      .getAttribute("href");
    appId = new URL(resume!, "http://localhost").searchParams.get("id")!;
    await page.goto("/en/dashboard?dataset=demo");
    await page.goto(resume!);
    await expect(page.getByLabel("Tool name")).toHaveValue(name);
    await page.getByRole("button", { name: "Continue", exact: true }).click();
    await page.getByLabel("Primary category").selectOption("knowledge-search");
    await page
      .getByLabel("Main task", { exact: true })
      .fill("Find team documents");
    await page
      .getByLabel("Distinguishing focus")
      .fill("A fictional self-managed workspace for small teams.");
    await page
      .getByLabel("Price type", { exact: true })
      .selectOption("freemium");
    await page
      .getByLabel("Conditions and limits")
      .fill("DEMO: sustained free search allowance with paid hosting options.");
    await page
      .getByLabel("Supported languages", { exact: true })
      .fill("English, 中文");
    await page.getByRole("button", { name: "Continue", exact: true }).click();
    await page
      .getByLabel("Peer URLs")
      .fill(
        "https://discovery-1.example\nhttps://discovery-2.example\nhttps://discovery-3.example",
      );
    await page.getByRole("button", { name: "Add URLs", exact: true }).click();
    for (let i = 1; i <= 3; i++)
      await page
        .getByLabel(`Peer ${i} rationale`)
        .fill(
          "DEMO comparison: document search with different deployment and pricing conditions.",
        );
    await page
      .getByRole("button", { name: "Submit for free review", exact: true })
      .click();
    await expect(
      page.getByRole("heading", { name: "Your profile preview is ready" }),
    ).toBeVisible();
    await signIn(staff, "admin");
    await staff.goto("/en/admin?dataset=demo");
    const card = staff
      .locator(".review-card")
      .filter({ has: staff.getByRole("heading", { name, exact: true }) });
    await expect(card).toBeVisible();
    await card
      .getByLabel("Review basis " + name)
      .fill(
        "DEMO factual task comparison and fictional plan reviewed; no real traffic claims.",
      );
    for (const button of await card
      .getByRole("button", { name: "Confirm relation", exact: true })
      .all())
      await button.click();
    await card
      .getByRole("checkbox", {
        name: "Pricing conditions independently checked",
      })
      .check();
    const decision = staff.waitForResponse((r) =>
      r.url().includes(`/api/v1/reviews/${appId}/decision`),
    );
    await card
      .getByRole("button", { name: "Approve listing", exact: true })
      .click();
    expect((await decision).status()).toBe(200);
    await expect
      .poll(async () => {
        const { data } = await db
          .from("charts_applications")
          .select("status")
          .eq("id", appId!)
          .single();
        return data?.status;
      })
      .toBe("approved");
    await expect(
      card
        .locator(":scope > .row > .tag.verified")
        .filter({ hasText: "Approved" }),
    ).toBeVisible();
    const { data: app } = await db
      .from("charts_applications")
      .select("project_id")
      .eq("id", appId)
      .single();
    pid = app!.project_id;
    await page.goto("/en/dashboard?dataset=demo");
    const own = page
      .locator(".review-card")
      .filter({ has: page.getByRole("heading", { name, exact: true }) });
    await own.getByRole("link", { name: "Comparison shortlist" }).click();
    await expect(
      page.getByRole("heading", { name: "Your comparison shortlist" }),
    ).toBeVisible();
    await expect(
      page.getByText("Current shared profile data is shown", { exact: false }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "Enable sharing", exact: true })
      .click();
    await expect(
      page.getByRole("link", { name: "Open shared comparison" }),
    ).toBeVisible();
    await page.getByRole("link", { name: "Open shared comparison" }).click();
    await expect(
      page.getByRole("heading", { name: "Shared comparison shortlist" }),
    ).toBeVisible();
    await expect(
      page.getByText("DEMO / 虚构演示案例", { exact: true }),
    ).toBeVisible();
    const image = await page.request.get(
      "/api/charts/card/" + pid + "?dataset=demo&kind=listing",
    );
    expect(image.status()).toBe(200);
    expect(image.headers()["content-type"]).toContain("image/png");
    await fs.writeFile(
      "output/playwright/listing-card.png",
      await image.body(),
    );
    await page.screenshot({
      path: "output/playwright/shared-comparison.png",
      fullPage: true,
    });
  } finally {
    await adminCtx.close();
    if (appId) {
      await db
        .from("charts_notifications")
        .delete()
        .eq("dedupe_key", "approved:" + appId);
      if (!pid) {
        const { data: saved } = await db
          .from("charts_applications")
          .select("project_id")
          .eq("id", appId)
          .maybeSingle();
        pid = saved?.project_id;
      }
      for (const table of ["charts_reports", "charts_relations"])
        await db.from(table).delete().eq("application_id", appId);
      await db.from("charts_applications").delete().eq("id", appId);
    }
    if (pid) {
      for (const table of [
        "charts_events",
        "charts_contributions",
        "charts_memberships",
      ])
        await db.from(table).delete().eq("project_id", pid);
      await db.from("charts_projects").delete().eq("id", pid);
    }
  }
});
