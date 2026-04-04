import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Accessibility Quality Gate @a11y", () => {
  test("home page should not have any WCAG 2.2 Level AA violations", async ({
    page,
  }) => {
    await page.goto("/");

    // Wait for the main content to be loaded if necessary
    await expect(page.locator("main")).toBeVisible();

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2aa", "wcag22aa"])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test("offline banner should not have any violations", async ({ page }) => {
    await page.goto("/");

    // Wait for initial load
    await expect(page.locator("main")).toBeVisible();

    // Go offline AFTER loading the page
    await page.context().setOffline(true);

    // Try to trigger the event manually in case setOffline doesn't do it in this environment
    await page.evaluate(() => window.dispatchEvent(new Event("offline")));

    // Wait for banner to be visible using data-testid, with longer timeout
    await expect(page.getByTestId("offline-banner")).toBeVisible({
      timeout: 10000,
    });

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2aa", "wcag22aa"])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
