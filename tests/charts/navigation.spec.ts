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
      name: "发现好工具，找到更合适的替代方案。",
    }),
  ).toBeVisible();
  await page.screenshot({
    path: "output/playwright/nav-after-desktop.png",
    fullPage: false,
    caret: "initial",
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
  await page.getByLabel("搜索工具或任务", { exact: true }).fill("n8n");
  await page.getByLabel("搜索工具或任务", { exact: true }).press("Enter");
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
  await expect(page.getByLabel("搜索工具", { exact: true })).toHaveValue("n8n");
  await page.keyboard.press("Meta+k");
  await page.getByRole("dialog").getByLabel("搜索工具或任务").fill("Cursor");
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
  await expect(page.locator(".candidate-facts")).toContainText("支持语言");
  await expect(page.locator(".candidate-facts")).not.toContainText(
    "Detailed conditions",
  );
  await page.screenshot({
    path: "output/playwright/nav-alternatives.png",
    fullPage: true,
    caret: "initial",
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
    caret: "initial",
  });
  await page.getByRole("link", { name: "EN", exact: true }).click();
  await expect(
    page.getByRole("heading", {
      name: "Discover great tools. Find better alternatives.",
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
    caret: "initial",
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
  const consoleErrors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") consoleErrors.push(m.text());
  });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/zh?dataset=real");
  await expect(page).toHaveTitle("123Charts｜全球工具发现与替代榜单");
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
    "content",
    "123Charts｜全球工具发现与替代榜单",
  );
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    "content",
    /审核通过后免费收录/,
  );
  await expect(page.locator(".brand-copy small")).toHaveText(
    "全球工具分类与替代榜单",
  );
  await expect(page.locator(".brand-promises")).toContainText("免费提交");
  await expect(
    page.getByRole("tab", { name: "找工具", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByPlaceholder("搜索工具名称、官网域名，或你想完成的任务", {
      exact: true,
    }),
  ).toBeVisible();
  await expect(page.locator(".maker-line")).toContainText(
    "让需要的人发现你的工具。免费提交，审核通过后免费收录。",
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
  await expect(page.locator(".candidate-facts")).toContainText("支持语言");
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
    "output/playwright/tools-listing-card.png",
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
  const conditions = page
    .locator(".directory-results .site-conditions")
    .first();
  await conditions.locator("summary").click();
  await expect(conditions.locator("p").first()).toBeVisible();
  await expect(
    page.locator(".directory-results .site-access").first(),
  ).not.toContainText(/待确认|待补充/);
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
    .getByRole("link", { name: "免费提交工具", exact: true })
    .click();
  await expect(page).toHaveURL(/login/);
  await expect(page).toHaveURL(/returnTo/);
  const accounts = JSON.parse(
    await fs.readFile(".local/accounts.json", "utf8"),
  );
  await signIn(page, accounts.founder.email, accounts.founder.password);
  await page
    .locator(".top-actions")
    .getByRole("link", { name: "免费提交工具", exact: true })
    .click();
  await expect(page).toHaveURL(/\/zh\/submit\?dataset=real/);
  await expect(page.locator(".page-heading")).toContainText(
    "免费提交，审核通过后免费收录。",
  );
  await expect(page.locator(".submission-benefits")).toContainText(
    "同行关系单独审核",
  );
  await expect(page.locator(".platform-free-note")).toContainText(
    "开源是独立属性",
  );
  const appData = await (
    await page.request.get("/api/charts/bootstrap?dataset=demo&zone=dashboard")
  ).json();
  const statusLabels: Record<string, string> = {
    approved: "审核通过",
    rejected: "不予通过",
    submitted: "已提交",
    verifying: "核验中",
  };
  const reviewed = appData.applications.find(
    (a: any) => a.status === "approved",
  );
  expect(reviewed, "Existing local approved sample required").toBeTruthy();
  await page.goto("/zh/submit?dataset=demo&id=" + reviewed.id);
  await expect(
    page
      .locator(".discovery-page .tag")
      .filter({ hasText: statusLabels[reviewed.status] }),
  ).toBeVisible();
  await expect(page.locator(".notice")).not.toContainText("已提交审核");
  console.log("Existing local application state verified:", reviewed.status);
  await signOut(page);
  await page.goto("/zh?dataset=real");
  await page.screenshot({
    path: "output/playwright/tools-home-desktop-zh.png",
    fullPage: false,
    caret: "initial",
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(
    page
      .locator(".topnav")
      .getByRole("link", { name: "最新收录", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "搜索项目", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "搜索项目", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: "关闭搜索", exact: true }).click();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "output/playwright/tools-home-mobile-zh.png",
    fullPage: false,
    caret: "initial",
  });
  console.log("Brand mobile entries:", await visibleSites(page));
  await page
    .locator(".topnav")
    .getByRole("link", { name: "分类导航", exact: true })
    .click();
  await expect(page.locator(".discovery-page")).toContainText(
    "当前聚焦 AI 编程辅助",
  );
  await page.goto("/en?dataset=real");
  await expect(page).toHaveTitle(
    "123Charts | Global Tool Discovery & Alternative Charts",
  );
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
    "content",
    "123Charts | Global Tool Discovery & Alternative Charts",
  );
  await expect(
    page.getByRole("heading", {
      name: "Discover great tools. Find better alternatives.",
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
    path: "output/playwright/tools-home-mobile-en.png",
    fullPage: false,
    caret: "initial",
  });
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(page.locator(".brand-promises")).toHaveText(
    /Free submissions.*Free listings.*Clear categories.*Transparent data/,
  );
  await expect(
    page
      .locator(".top-actions")
      .getByRole("link", { name: "Submit a tool for free", exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "output/playwright/tools-home-desktop-en.png",
    fullPage: false,
    caret: "initial",
  });
  expect(errors).toEqual([]);
  expect(consoleErrors).toEqual([]);
});

test("owner: basic listing, claim gate, AI JSON import persists in revision and stays private before approval", async ({
  page,
}) => {
  test.setTimeout(120000);
  const accounts = JSON.parse(
    await fs.readFile(".local/accounts.json", "utf8"),
  );
  const id = randomUUID(),
    suffix = id.slice(0, 8),
    domain = `owner-${suffix}.example`,
    slug = `owner-${suffix}`;
  const fixture = {
    id,
    slug,
    name: "Owner AI " + suffix,
    website_url: "https://" + domain,
    domain,
    measurement_domain: domain,
    category: "ai-coding",
    description_en:
      "A fictional code helper for local owner profile acceptance.",
    description_zh: "本地认领资料验收中的虚构代码辅助工具。",
    price_type: "unknown",
    publication: "draft",
    demo: true,
    task: "",
    differentiator: "",
    supported_languages: [],
  };
  const ck = (r: any) => {
    if (r.error) throw Error(r.error.message);
    return r.data;
  };
  try {
    ck(await db.from("charts_projects").insert(fixture));
    await signIn(page, accounts.admin.email, accounts.admin.password);
    const publish = await page.request.post("/api/charts/admin/project", {
      data: {
        id,
        publication: "published",
        project: fixture,
        reference: "LOCAL DEMO: " + fixture.website_url,
        price_verified: false,
      },
    });
    expect(publish.status(), await publish.text()).toBe(200);
    await signOut(page);
    await page.goto(`/zh/products/${slug}?dataset=demo`);
    await expect(
      page.getByRole("heading", { name: fixture.name, exact: true }),
    ).toBeVisible();
    await expect(page.locator(".owner-listing-note")).toContainText(
      "整理项目简介并提供官网入口",
    );
    await expect(page.locator(".supplemental-profile")).not.toHaveAttribute(
      "open",
      "",
    );
    await page.locator(".owner-assist summary").first().click();
    await expect(
      page.getByLabel("项目资料核实提示词", { exact: true }),
    ).toHaveValue(new RegExp(domain));
    await page
      .context()
      .grantPermissions(["clipboard-read", "clipboard-write"]);
    await page
      .getByRole("button", { name: "复制核实提示词", exact: true })
      .click();
    await expect(
      page.getByRole("status").filter({ hasText: "提示词已复制" }),
    ).toBeVisible();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toContain(
      "price_verified",
    );
    await expect(
      page.getByLabel("上传项目资料 JSON", { exact: true }),
    ).toHaveCount(0);
    await page.screenshot({
      path: "output/playwright/owner-basic-profile.png",
      fullPage: false,
      caret: "initial",
    });
    await signIn(page, accounts.founder.email, accounts.founder.password);
    await page.goto(`/zh/submit?dataset=demo&project=${id}`);
    await expect(
      page.getByText("认领通过后才能补充资料", { exact: true }),
    ).toBeVisible();
    const user = (
      await (
        await page.request.get("/api/charts/bootstrap?dataset=demo")
      ).json()
    ).user;
    ck(
      await db.from("charts_claims").insert({
        project_id: id,
        owner_id: user.id,
        state: "approved",
        evidence: "LOCAL DEMO claim fixture for owner import acceptance",
        method: "manual",
      }),
    );
    await page.reload();
    await page.locator(".owner-assist summary").first().click();
    const packet = {
      schema_version: "123charts-owner-profile-v1",
      website_url: fixture.website_url,
      profile: {
        description_en:
          "An owner-supplied fictional introduction for the local test.",
        description_zh: "项目方补充的虚构验收简介，尚未公开。",
        conditions: "Usage limits remain unknown / 使用条件仍待补充",
        supported_languages: [],
        price_type: "unknown",
      },
      sources: [
        {
          field: "description_en",
          url: fixture.website_url + "/docs",
          checked_at: "",
          note: "LOCAL DEMO source placeholder, not externally verified",
        },
      ],
    };
    await page.getByLabel("上传项目资料 JSON", { exact: true }).setInputFiles({
      name: "owner-profile.json",
      mimeType: "application/json",
      buffer: Buffer.from(JSON.stringify(packet)),
    });
    await page
      .getByRole("checkbox", {
        name: "我已逐项核对事实与来源，仅导入草稿",
        exact: true,
      })
      .check();
    await page
      .getByRole("button", { name: "导入资料草稿", exact: true })
      .click();
    await expect(
      page.getByLabel("Conditions and limits", { exact: true }),
    ).toHaveValue(packet.profile.conditions);
    await expect
      .poll(async () => {
        const r = ck(
          await db
            .from("charts_applications")
            .select("draft")
            .eq("project_id", id)
            .eq("owner_id", user.id),
        );
        return r.length === 1
          ? r[0]?.draft?.owner_sources?.[0]?.note
          : `records:${r.length}`;
      })
      .toBe(packet.sources[0].note);
    const saved = ck(
      await db
        .from("charts_applications")
        .select("id,draft")
        .eq("project_id", id)
        .eq("owner_id", user.id),
    )[0];
    expect(saved.draft.supported_languages).toEqual([]);
    expect(
      ck(
        await db
          .from("charts_projects")
          .select("description_en,first_published_at")
          .eq("id", id)
          .single(),
      ).description_en,
    ).toBe(fixture.description_en);
    await page.screenshot({
      path: "output/playwright/owner-ai-import.png",
      fullPage: false,
      caret: "initial",
    });
    const submitted = await page.request.post("/api/charts/submit", {
      data: { id: saved.id },
    });
    expect(submitted.status(), await submitted.text()).toBe(200);
    await signOut(page);
    await signIn(page, accounts.admin.email, accounts.admin.password);
    const a = ck(
      await db
        .from("charts_applications")
        .select("updated_at")
        .eq("id", saved.id)
        .single(),
    );
    const approval = await page.request.post(
      `/api/v1/reviews/${saved.id}/decision`,
      {
        data: {
          action: "approve",
          reference:
            "LOCAL DEMO: reviewed owner source references without claiming external verification",
          pricing_confirmed: false,
          expected_updated_at: a.updated_at,
        },
      },
    );
    expect(approval.status(), await approval.text()).toBe(200);
    expect(
      ck(
        await db
          .from("charts_projects")
          .select("description_en,price_verified")
          .eq("id", id)
          .single(),
      ),
    ).toMatchObject({
      description_en: packet.profile.description_en,
      price_verified: false,
    });
    console.log(
      "Owner import: public basic profile, approved-claim gate, persisted sources, review-before-publication; empty optional languages accepted",
    );
  } finally {
    const apps = ck(
      await db.from("charts_applications").select("id").eq("project_id", id),
    );
    for (const a of apps) {
      for (const table of ["charts_reports", "charts_relations"])
        ck(await db.from(table).delete().eq("application_id", a.id));
      ck(
        await db
          .from("charts_notifications")
          .delete()
          .eq("dedupe_key", "approved:" + a.id),
      );
    }
    ck(await db.from("charts_applications").delete().eq("project_id", id));
    for (const table of [
      "charts_claims",
      "charts_events",
      "charts_contributions",
      "charts_memberships",
    ])
      ck(await db.from(table).delete().eq("project_id", id));
    ck(await db.from("charts_projects").delete().eq("id", id));
  }
});

test("listing: unclaimed projects show introductions and claim actions while real facts remain available", async ({
  page,
}) => {
  const outbounds: string[] = [];
  page.on("request", (r) => {
    if (r.url().includes("/api/v1/events/outbound") && r.method() === "POST")
      outbounds.push(r.url());
  });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/zh?dataset=real");
  const cursor = page
    .locator("#favorites .site-unit")
    .filter({ has: page.getByRole("link", { name: "Cursor", exact: false }) })
    .first();
  await expect(cursor).toContainText("提供代码库 AI 辅助功能的编辑器。");
  const claim = cursor.getByRole("link", {
    name: "认领并补充 Cursor",
    exact: true,
  });
  await expect(claim).toBeVisible();
  await page.screenshot({
    path: "output/playwright/listing-home-desktop.png",
    caret: "initial",
    fullPage: false,
  });
  await claim.click();
  await expect(page).toHaveURL(
    /products\/cursor\?claim=1&dataset=real#owner-claim/,
  );
  await expect(
    page.getByRole("heading", { name: "这是你的项目吗？", exact: true }),
  ).toBeVisible();
  expect(outbounds).toHaveLength(0);
  await page.goto("/zh/categories/workflow-automation?dataset=real");
  const row = page
    .locator(".directory-results .site-unit")
    .filter({ has: page.locator(".site-name strong", { hasText: "Huginn" }) });
  await expect(row).toContainText("使用代理监测事件并自动执行任务的开源系统。");
  await expect(
    row.getByRole("link", { name: "认领并补充 Huginn", exact: true }),
  ).toBeVisible();
  expect(await row.innerText()).not.toMatch(/待确认|待补充|尚未核实/);
  await expect(row.locator(".project-reference")).toHaveCount(0);
  await page.screenshot({
    path: "output/playwright/listing-category-desktop.png",
    caret: "initial",
    fullPage: false,
  });
  await page.goto("/zh/alternatives/activepieces?dataset=real");
  const candidate = page.locator(".alternative-candidate");
  await expect(candidate).toHaveCount(1);
  await expect(candidate.locator(".site-purpose")).toHaveText(
    "连接服务并自动执行任务的工作流构建器。",
  );
  await expect(candidate.locator(".site-access")).toContainText("免费试用");
  await expect(
    candidate.getByRole("link", { name: "认领并补充 n8n", exact: true }),
  ).toBeVisible();
  await expect(candidate.locator(".project-reference")).not.toHaveAttribute(
    "open",
    "",
  );
  expect(await candidate.innerText()).not.toMatch(/待确认|待补充|价格尚未确认/);
  await candidate.locator(".project-reference summary").click();
  await expect(candidate.locator(".candidate-facts")).toContainText("自部署");
  await expect(candidate.locator(".candidate-facts")).toContainText("英语");
  await candidate.locator(".project-reference summary").click();
  await page.screenshot({
    path: "output/playwright/listing-alternatives-desktop.png",
    caret: "initial",
    fullPage: false,
  });
  expect(outbounds).toHaveLength(0);
  await page.goto("/zh?dataset=real");
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(
    page
      .locator("#favorites")
      .getByRole("link", { name: "认领并补充 Cursor", exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  console.log("Compact unclaimed home entries:", await visibleSites(page));
  await page.screenshot({
    path: "output/playwright/listing-home-mobile.png",
    caret: "initial",
    fullPage: false,
  });
  await page.goto("/en/alternatives/activepieces?dataset=real");
  await expect(
    page.getByRole("link", { name: "Claim and complete n8n", exact: true }),
  ).toBeVisible();
  expect(await page.locator(".alternative-candidate").innerText()).not.toMatch(
    /Unconfirmed|Not recorded|not yet confirmed/,
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
