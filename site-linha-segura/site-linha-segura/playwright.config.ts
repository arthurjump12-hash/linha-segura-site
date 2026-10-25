import { defineConfig, devices } from "@playwright/test";

/**
 * Testes de interface. Rode `npm run build` antes de `npm run test:e2e`.
 * Na primeira vez: `npx playwright install chromium`.
 */
export default defineConfig({
  testDir: "./e2e",
  timeout: 45_000,
  fullyParallel: true,
  reporter: [["list"]],
  use: { baseURL: "http://localhost:3500", trace: "retain-on-failure" },
  webServer: {
    command: "npx next start -p 3500",
    url: "http://localhost:3500",
    reuseExistingServer: true,
    timeout: 60_000,
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
});
