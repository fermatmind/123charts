import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/charts",
  testMatch: ["browser.spec.ts", "navigation.spec.ts"],
  workers: 1,
  timeout: 60000,
  expect: { timeout: 10000 },
  outputDir: "output/playwright/results",
  reporter: [["list"]],
  use: {
    baseURL: process.env.CHARTS_TEST_BASE_URL || "http://127.0.0.1:3100",
    channel: "chrome",
    headless: true,
    actionTimeout: 15000,
    viewport: { width: 1440, height: 1000 },
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
});
