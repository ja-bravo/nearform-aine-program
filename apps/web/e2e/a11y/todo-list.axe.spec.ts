import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const checkA11y = async (page, name) => {
  const accessibilityScanResults = await new AxeBuilder({ page })
    .withTags(["wcag2aa", "wcag22aa"])
    .analyze();

  if (accessibilityScanResults.violations.length > 0) {
    console.error(
      `A11y violations found in ${name}:`,
      JSON.stringify(accessibilityScanResults.violations, null, 2)
    );
  }

  expect(
    accessibilityScanResults.violations,
    `Should have no WCAG 2.2 AA violations in ${name}`
  ).toEqual([]);
};

test.describe("Accessibility Quality Gate @a11y", () => {
  test("home page should not have any WCAG 2.2 Level AA violations", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("main")).toBeVisible();

    // Verify PersistenceStatusBadge is scanned (implicitly part of the page)
    await expect(page.getByTestId("persistence-status-badge")).toBeVisible();

    await checkA11y(page, "Home Page");
  });

  test("offline banner should not have any violations", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("main")).toBeVisible();

    // Go offline AFTER loading the page
    await page.context().setOffline(true);

    // Documented: App logic uses a custom event or listener that might need a manual trigger in E2E environments
    await page.evaluate(() => window.dispatchEvent(new Event("offline")));

    // Wait for banner to be visible and animation to finish
    const banner = page.getByTestId("offline-banner");
    await expect(banner).toBeVisible({ timeout: 10000 });

    // Wait for animations to settle before scanning to avoid false positives
    await banner.evaluate((el) =>
      Promise.all(el.getAnimations().map((a) => a.finished))
    );

    await checkA11y(page, "Offline Banner");

    // Cleanup: restore online state
    await page.context().setOffline(false);
    await page.evaluate(() => window.dispatchEvent(new Event("online")));
  });
});
