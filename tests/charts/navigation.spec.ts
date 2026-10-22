import { test, expect } from "@playwright/test";
import fs from "node:fs/promises";
import { randomUUID } from "node:crypto";
import WebSocket from "ws";
import { createClient } from "@supabase/supabase-js";
import { loadEnv } from "../../scripts/local/env.mjs";
loadEnv();
const base = "http://127.0.0.1:3100";
if (process.env.NEXT_PUBLIC_SUPABASE_URL !== "http://127.0.0.1:54321")
  throw Error("Local-only browser acceptance required");
const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    realtime: { transport: WebSocket as any },
    auth: { persistSession: false },
  },
);
async function signIn(page: any, email: string, password: string) {
  await page.goto("/zh/login?dataset=real");
  await page.getByLabel("邮箱地址").fill(email);
  await page.getByLabel("密码", { exact: true }).fill(password);
  await page.getByRole("button", { name: "登录", exact: true }).click();
  await expect(page).toHaveURL(/dashboard/);
  await page.goto("/zh?dataset=real");
}
async function signOut(page: any) {
  await page.goto("/zh/dashboard/settings?dataset=real");
  await page.getByRole("button", { name: "退出登录", exact: true }).click();
  await expect(page).toHaveURL(/\/zh\?dataset=real/);
}
async function visibleSites(page: any) {
  return page.locator(".site-name").evaluateAll((els: Element[]) => {
    const visible = els.filter((e) => {
      const b = e.getBoundingClientRect();
      return b.top >= 0 && b.bottom <= innerHeight && b.width > 0;
    });
    return {
      unique: new Set(
        visible.map((e) =>
          e.closest("[data-product-id]")?.getAttribute("data-product-id"),
        ),
      ).size,
      firstY: visible[0]?.getBoundingClientRect().top,
    };
  });
}
test("navigation: direct actions, persistent guest favorites, exact search, stable categories, alternatives, bilingual mobile", async ({
  page,
  context,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const outbounds: string[] = [];
  page.on("request", (r) => {
    if (r.url().includes("/api/v1/events/outbound") && r.method() === "POST")
      outbounds.push(r.url());
  });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/zh?dataset=real");
  await expect(
    page.getByRole("heading", {
      name: "发现全球好网站，找到更合适的替代方案。",
    }),
  ).toBeVisible();
  await page.screenshot({
    path: "output/playwright/nav-after-desktop.png",
    fullPage: false,
  });
  const desktop = await visibleSites(page);
  console.log("Desktop visible unique entries:", desktop);
  const initial = await page
    .locator(".website-map .site-name")
    .allTextContents();
  await page.reload();
  expect(
    await page.locator(".website-map .site-name").allTextContents(),
  ).toEqual(initial);
  await page
    .getByRole("button", { name: "添加常用 Cursor", exact: true })
    .first()
    .click();
  await page
    .getByRole("button", { name: "添加常用 Aider", exact: true })
    .first()
    .click();
  await expect(page.locator("#favorites")).toContainText("仅保存在此浏览器");
  await expect(page.locator("#favorites .site-name")).toHaveCount(2);
  expect(outbounds).toHaveLength(0);
  await page.reload();
  await expect(page.locator("#favorites .site-name")).toHaveCount(2);
  await page.getByRole("button", { name: "调整顺序", exact: true }).click();
  await page.getByRole("button", { name: "上移 Aider", exact: true }).click();
  await expect(page.locator("#favorites .site-name strong")).toHaveText([
    "Aider",
    "Cursor",
  ]);
  await page.reload();
  await expect(page.locator("#favorites .site-name strong")).toHaveText([
    "Aider",
    "Cursor",
  ]);
  await page
    .locator("#favorites")
    .getByRole("button", { name: "移除常用 Aider", exact: true })
    .click();
  await page.reload();
  await expect(page.locator("#favorites .site-name")).toHaveCount(1);
  expect(outbounds).toHaveLength(0);
  await page.getByRole("link", { name: /^管理／更多/ }).click();
  await expect(page).toHaveURL(/\/zh\/following/);
  await expect(
    page.getByRole("heading", { name: "我的常用", exact: true }),
  ).toBeVisible();
  await page.goto("/zh?dataset=real");
  await page.getByLabel("搜索网站或任务", { exact: true }).fill("n8n");
  await page.getByLabel("搜索网站或任务", { exact: true }).press("Enter");
  await expect(page).toHaveURL(/\/zh\/projects\?q=n8n/);
  await expect(
    page.getByRole("heading", { name: "“n8n”的搜索结果" }),
  ).toBeVisible();
  await expect(page.locator(".directory-results .site-name")).toHaveCount(1);
  await expect(page.locator(".directory-results .site-name")).toContainText(
    "n8n",
  );
  await expect(page.locator("body")).not.toContainText("每日稳定轮换");
  await page
    .locator(".directory-results")
    .getByRole("link", { name: "简介", exact: true })
    .click();
  await expect(page).toHaveURL(/\/products\/n8n/);
  await page.goBack();
  await expect(page).toHaveURL(/q=n8n/);
  await expect(page.getByLabel("搜索网站", { exact: true })).toHaveValue("n8n");
  await page.keyboard.press("Meta+k");
  await page.getByRole("dialog").getByLabel("搜索网站或任务").fill("Cursor");
  await expect(
    page.getByRole("dialog").locator(".suggestion-row"),
  ).toContainText("Cursor");
  await page.keyboard.press("Escape");
  await page.setViewportSize({ width: 1440, height: 600 });
  await page.goto("/zh/categories/workflow-automation?dataset=real");
  const order = await page
    .locator(".directory-results .site-name strong")
    .allTextContents();
  await page.reload();
  expect(
    await page
      .locator(".directory-results .site-name strong")
      .allTextContents(),
  ).toEqual(order);
  await page.getByLabel("价格类型").selectOption("unknown");
  await page.getByLabel("排序", { exact: true }).selectOption("name");
  await page
    .locator(".directory-results .site-unit")
    .last()
    .scrollIntoViewIfNeeded();
  const scroll = await page.evaluate(() => scrollY);
  await page
    .locator(".directory-results .site-unit")
    .last()
    .getByRole("link", { name: "简介", exact: true })
    .click();
  await expect(page).toHaveURL(/\/products\//);
  await page.goBack();
  await expect(page).toHaveURL(/price=unknown/);
  await expect(page.getByLabel("排序", { exact: true })).toHaveValue("name");
  expect(await page.evaluate(() => scrollY)).toBeGreaterThan(0);
  console.log("Category return restored scroll from", scroll);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/zh/alternatives/activepieces?dataset=real");
  await expect(
    page.getByRole("heading", { name: "Activepieces 替代方案" }),
  ).toBeVisible();
  await expect(page.locator(".alternative-candidate")).toHaveCount(1);
  await expect(page.locator(".candidate-facts")).toContainText("自部署");
  await expect(page.locator(".candidate-facts")).not.toContainText(
    "Detailed conditions",
  );
  await page.screenshot({
    path: "output/playwright/nav-alternatives.png",
    fullPage: true,
  });
  // Resolve the actual local 302; do not send test traffic to a remote product's production analytics.
  await context.route("https://n8n.io/**", (r) =>
    r.fulfill({
      status: 200,
      contentType: "text/html",
      body: "<title>Official destination isolated for local acceptance</title>",
    }),
  );
  const count = outbounds.length;
  const popup = page.waitForEvent("popup");
  await page.locator(".alternative-candidate .site-name").click();
  const tab = await popup;
  await expect(tab).toHaveURL(/^https:\/\/n8n.io\//);
  await expect.poll(() => outbounds.length).toBe(count + 1);
  await tab.close();
  const api = await context.request.get(
    "/api/v1/events/outbound?product_id=" +
      (await page
        .locator(".alternative-candidate [data-product-id]")
        .getAttribute("data-product-id")),
    { maxRedirects: 0 },
  );
  expect(api.status()).toBe(302);
  expect(api.headers().location).toBe("https://n8n.io/");
  await page.goto("/zh?dataset=real");
  await page
    .locator("#favorites")
    .getByRole("button", { name: "移除常用 Cursor", exact: true })
    .click();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  await expect(page.locator("#favorites")).toContainText("精选直达");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  console.log("Mobile visible unique entries:", await visibleSites(page));
  await page.screenshot({
    path: "output/playwright/nav-after-mobile.png",
    fullPage: false,
  });
  await page.getByRole("link", { name: "EN", exact: true }).click();
  await expect(
    page.getByRole("heading", {
      name: "Discover websites worldwide. Find alternatives that fit.",
    }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "output/playwright/nav-mobile-english.png",
    fullPage: false,
  });
  expect(errors).toEqual([]);
});
test("favorites: one-time account merge, persisted removals, reorder and account isolation", async ({
  page,
}) => {
  test.setTimeout(120000);
  const suffix = randomUUID().slice(0, 8),
    password = "Nav!" + randomUUID(),
    users: any[] = [];
  const ck = (r: any) => {
    if (r.error) throw Error(r.error.message);
    return r.data;
  };
  try {
    for (let i = 0; i < 2; i++)
      users.push(
        ck(
          await db.auth.admin.createUser({
            email: `nav-${suffix}-${i}@123charts.local`,
            password,
            email_confirm: true,
          }),
        ).user,
      );
    const projects = ck(
        await db
          .from("products")
          .select("id,domain")
          .in("domain", ["cursor.com", "aider.chat", "tabnine.com"]),
      ),
      id = (domain: string) =>
        projects.find((p: any) => p.domain === domain).id;
    ck(
      await db.from("charts_follows").insert({
        owner_id: users[0].id,
        kind: "bookmark",
        target: id("tabnine.com"),
      }),
    );
    await page.goto("/zh?dataset=real");
    await page
      .getByRole("button", { name: "添加常用 Cursor", exact: true })
      .first()
      .click();
    await page
      .getByRole("button", { name: "添加常用 Aider", exact: true })
      .first()
      .click();
    await signIn(page, users[0].email, password);
    await expect
      .poll(
        async () =>
          ck(
            await db
              .from("charts_follows")
              .select("target")
              .eq("owner_id", users[0].id),
          ).length,
      )
      .toBe(3);
    await expect(page.locator("#favorites .site-name strong")).toHaveText([
      "Tabnine",
      "Cursor",
      "Aider",
    ]);
    await page.getByRole("button", { name: "调整顺序", exact: true }).click();
    await page
      .getByRole("button", { name: "上移 Cursor", exact: true })
      .click();
    await page.reload();
    await expect(page.locator("#favorites .site-name strong")).toHaveText([
      "Cursor",
      "Tabnine",
      "Aider",
    ]);
    await page
      .locator("#favorites")
      .getByRole("button", { name: "移除常用 Cursor", exact: true })
      .click();
    await signOut(page);
    await expect(page.locator("#favorites")).toContainText("精选直达");
    expect(
      await page.evaluate(() =>
        JSON.parse(
          localStorage.getItem("123charts:favorites:real:guest") || "[]",
        ),
      ),
    ).toEqual([]);
    await signIn(page, users[0].email, password);
    await expect(page.locator("#favorites .site-name strong")).toHaveText([
      "Tabnine",
      "Aider",
    ]);
    await page
      .getByRole("button", { name: "添加常用 CodeRabbit", exact: true })
      .first()
      .click();
    await page
      .getByRole("button", { name: "添加常用 Qodo", exact: true })
      .first()
      .click();
    await expect(page.locator("#favorites .site-name strong")).toHaveCount(4);
    await page.reload();
    await expect(page.locator("#favorites .site-name strong")).toHaveCount(4);

    await signOut(page);
    await signIn(page, users[1].email, password);
    await expect(page.locator("#favorites")).toContainText("精选直达");
    expect(
      ck(
        await db
          .from("charts_follows")
          .select("target")
          .eq("owner_id", users[1].id),
      ),
    ).toHaveLength(0);
  } finally {
    for (const u of users) {
      for (const table of [
        "charts_follows",
        "charts_jobs",
        "charts_notifications",
      ])
        await db.from(table).delete().eq("owner_id", u.id);
      await db.auth.admin.deleteUser(u.id);
    }
  }
});

test("brand: positioning, transparent chart order, new listings and free submission entries", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/zh?dataset=real");
  await expect(page).toHaveTitle(
    "123Charts — 免费全球网站分类与对标排行榜平台。",
  );
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
    "content",
    "123Charts — 免费全球网站分类与对标排行榜平台。",
  );
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    "content",
    /审核通过后免费收录/,
  );
  await expect(page.locator(".brand-copy small")).toHaveText(
    "全球网站分类与替代榜单",
  );
  await expect(page.locator(".brand-promises")).toContainText("免费提交");
  await expect(page.locator(".maker-line")).toContainText(
    "让需要的人发现你的网站。免费提交，审核通过后免费收录。",
  );
  await page
    .locator(".brand-promises")
    .getByRole("link", { name: "数据透明", exact: true })
    .click();
  await expect(page).toHaveURL(/how-it-works\?dataset=real#data-and-order$/);
  await expect(page.locator("#data-and-order")).toBeVisible();
  await expect(page.locator("#data-and-order")).toContainText(
    "不代表外部访问量或产品质量",
  );
  await expect(page.locator(".method-copy")).toContainText("开源是独立属性");
  await page
    .locator(".topnav")
    .getByRole("link", { name: "替代榜单", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "替代榜单", exact: true }),
  ).toBeVisible();
  await page
    .locator(".alternative-shortcuts")
    .getByRole("link", { name: /^Activepieces/ })
    .click();
  await expect(page.locator(".alternative-candidate")).toHaveCount(1);
  await expect(page.getByLabel("候选排序", { exact: true })).toHaveValue(
    "name",
  );
  await expect(page.locator(".alternative-order")).toContainText(
    "当前排序：名称 A–Z",
  );
  await expect(page.locator(".candidate-facts")).toContainText("自部署");
  await page.getByLabel("候选排序", { exact: true }).selectOption("new");
  await expect(page).toHaveURL(/sort=new/);
  await expect(page.locator(".alternative-order")).toContainText(
    "当前排序：首次公开收录时间倒序",
  );
  await expect(
    page.locator(".alternative-candidate .ordering-note"),
  ).toContainText("首次公开收录");
  await page.locator(".comparison-source summary").click();
  await expect(page.locator(".comparison-source")).toContainText("资料更新于");
  await page
    .locator(".comparison-source")
    .getByRole("link", { name: "纠错", exact: true })
    .click();
  await expect(page).toHaveURL(/products\/n8n\?dataset=real#corrections/);
  await expect(page.locator(".discovery-page")).toContainText(
    "已收录于 123Charts",
  );
  const productId = await page
    .locator(".discovery-page a[href*='events/outbound']")
    .first()
    .getAttribute("href");
  const id = new URL(productId!, base).searchParams.get("product_id");
  const card = await page.request.get(
    `/api/charts/card/${id}?lang=zh&kind=listing&dataset=real`,
  );
  expect(card.status()).toBe(200);
  expect(card.headers()["content-type"]).toContain("image/png");
  await fs.writeFile(
    "output/playwright/brand-listing-card.png",
    await card.body(),
  );
  await page
    .locator(".topnav")
    .getByRole("link", { name: "最新收录", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "最新收录榜", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".directory-heading")).toContainText(
    "不代表产品首发时间",
  );
  await expect(page.getByLabel("排序", { exact: true })).toHaveValue("new");
  const ids = await page
    .locator(".directory-results [data-product-id]")
    .evaluateAll((els) => els.map((e) => e.getAttribute("data-product-id")));
  const records = await db
    .from("products")
    .select("id,first_published_at")
    .in("id", ids);
  expect(records.error).toBeNull();
  const dates = ids.map(
    (id) => records.data!.find((p) => p.id === id)!.first_published_at || "",
  );
  expect(dates).toEqual([...dates].sort().reverse());
  await page
    .locator(".top-actions")
    .getByRole("link", { name: "免费提交网站", exact: true })
    .click();
  await expect(page).toHaveURL(/login/);
  await expect(page).toHaveURL(/returnTo/);
  const accounts = JSON.parse(
    await fs.readFile(".local/accounts.json", "utf8"),
  );
  await signIn(page, accounts.founder.email, accounts.founder.password);
  await page
    .locator(".top-actions")
    .getByRole("link", { name: "免费提交网站", exact: true })
    .click();
  await expect(page).toHaveURL(/\/zh\/submit\?dataset=real/);
  await expect(page.locator(".page-heading")).toContainText(
    "免费提交，审核通过后免费收录。",
  );
  await expect(page.locator(".platform-free-note")).toContainText(
    "开源是独立属性",
  );
  await signOut(page);
  await page.goto("/zh?dataset=real");
  await page.screenshot({
    path: "output/playwright/brand-home-desktop.png",
    fullPage: false,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(
    page
      .locator(".topnav")
      .getByRole("link", { name: "最新收录", exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "output/playwright/brand-home-mobile.png",
    fullPage: false,
  });
  console.log("Brand mobile entries:", await visibleSites(page));
  await page
    .locator(".topnav")
    .getByRole("link", { name: "分类导航", exact: true })
    .click();
  await expect(page.locator(".discovery-page")).toContainText(
    "当前从 AI 与效率工具开始",
  );
  await page.goto("/en?dataset=real");
  await expect(page).toHaveTitle(
    "123Charts — Free Global Website Directory & Alternative Charts.",
  );
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
    "content",
    "123Charts — Free Global Website Directory & Alternative Charts.",
  );
  await expect(
    page.getByRole("heading", {
      name: "Discover websites worldwide. Find alternatives that fit.",
      exact: true,
    }),
  ).toBeVisible();
  await expect(page.locator(".brand-promises")).toContainText(
    "Transparent data",
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "output/playwright/brand-home-mobile-en.png",
    fullPage: false,
  });
  expect(errors).toEqual([]);
});
