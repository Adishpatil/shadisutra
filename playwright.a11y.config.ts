import { defineConfig, devices } from "@playwright/test";

const port = process.env.A11Y_PORT ?? "3000";

export default defineConfig({
  testDir: "./a11y",
  testMatch: "**/*.a11y.ts",
  fullyParallel: false,
  reporter: "list",
  use: {
    ...devices["Desktop Chrome"],
    baseURL: `http://127.0.0.1:${port}`,
  },
  webServer: {
    command: `npm run start -- --hostname 127.0.0.1 --port ${port}`,
    url: `http://127.0.0.1:${port}`,
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
