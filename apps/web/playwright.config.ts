import { defineConfig, devices } from "@playwright/test";

/**
 * See https://playwright.dev/docs/test-configuration.
 */
const isCI =
  !!process.env.CI && process.env.CI !== "false" && process.env.CI !== "0";

export default defineConfig({
  testDir: "./e2e",
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: isCI,
  /* Retry on CI only */
  retries: isCI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: isCI ? 1 : undefined,
  /* Global timeout per test */
  timeout: isCI ? 60000 : 30000,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: "html",
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  expect: {
    timeout: isCI ? 10000 : 5000,
  },
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.BASE_URL || "http://localhost:3000",

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },

    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },

    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },

    /* Test against mobile viewports. */
    {
      name: "Mobile Safari",
      use: { ...devices["iPhone 13"] },
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: process.env.SKIP_PW_WEBSERVER
    ? undefined
    : [
        {
          command: process.env.CI
            ? "pnpm -C ../api start"
            : "pnpm --filter api dev",
          url: "http://localhost:3001/healthz/live",
          reuseExistingServer: !process.env.CI,
          timeout: 120 * 1000,
        },
        {
          command: process.env.CI ? "pnpm start" : "pnpm dev",
          url: "http://localhost:3000/healthz",
          reuseExistingServer: !process.env.CI,
          timeout: 120 * 1000,
        },
      ],
});
