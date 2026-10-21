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
test("task-first discovery, keyboard search, alternatives, free conditions and mobile bilingual filters", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/en?dataset=real");
  await expect(
    page.getByRole("heading", { name: /Find a website that fits/ }),
  ).toBeVisible();
  await page.screenshot({
    path: "output/playwright/discovery-desktop.png",
    fullPage: true,
  });
  await page.keyboard.press("Meta+k");
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByLabel("Search query").fill("Cursor");
  await page
    .getByRole("dialog")
    .getByRole("link", { name: /Cursor/ })
    .click();
  await expect(
    page.getByRole("heading", { name: "Cursor", exact: true }),
  ).toBeVisible();
  await page.goto("/en/alternatives/n8n?dataset=real");
  await expect(
    page.getByRole("heading", { name: "Alternatives to n8n" }),
  ).toBeVisible();
  await expect(
    page.locator(".discovery-identity").filter({ hasText: "Zapier" }),
  ).toBeVisible();
  await page.screenshot({
    path: "output/playwright/alternatives-desktop.png",
    fullPage: true,
  });
  await page.goto("/en/free?dataset=real");
  await expect(
    page.locator(".discovery-identity").filter({ hasText: "Zapier" }),
  ).toBeVisible();
  await expect(
    page.locator(".discovery-identity").filter({ hasText: "n8n" }),
  ).toHaveCount(0);
  await page
    .getByRole("checkbox", { name: "Open source", exact: true })
    .check();
  await expect(
    page.locator(".discovery-identity").filter({ hasText: "Node-RED" }),
  ).toBeVisible();
  await expect(
    page.locator(".discovery-identity").filter({ hasText: "Zapier" }),
  ).toHaveCount(0);
  await page.getByRole("link", { name: "中", exact: true }).click();
  await expect(page).toHaveURL(/\/zh\/free/);
  expect(new URL(page.url()).searchParams.get("oss")).toBe("1");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/zh?dataset=real");
  await expect(page.getByRole("heading", { name: /发现好网站/ })).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "output/playwright/discovery-mobile.png",
    fullPage: true,
  });
  await page.goto(
    "/zh/categories/workflow-automation?dataset=real&price=freemium",
  );
  await expect(
    page.getByRole("heading", { name: "工作流自动化", exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  expect(errors).toEqual([]);
});
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
    await page.getByLabel("Website name", { exact: true }).fill(name);
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
    await expect(page.getByLabel("Website name")).toHaveValue(name);
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
    await card
      .getByRole("button", { name: "Approve listing", exact: true })
      .click();
    await expect(card.locator(".status").filter({ hasText: "Approved" }))
      .toBeVisible()
      .catch(async () => {
        await expect(
          card.getByRole("button", { name: "Approve listing", exact: true }),
        ).toHaveCount(0);
      });
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
