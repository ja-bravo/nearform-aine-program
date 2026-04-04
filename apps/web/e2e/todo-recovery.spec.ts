import { test, expect } from "@playwright/test";

test.describe("Todo Recovery and Failure", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("User can retry after API failure during creation", async ({ page }) => {
    const todoText = `Failure Task ${Date.now()}`;

    // Intercept POST request and return 500
    await page.route("**/api/v1/todos", async (route) => {
      if (route.request().method() === "POST") {
        await route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({
            error: {
              code: "INTERNAL_SERVER_ERROR",
              message: "Simulated API failure",
            },
          }),
        });
      } else {
        await route.continue();
      }
    });

    const input = page.getByTestId("quick-capture-input");
    await input.fill(todoText);
    await input.press("Enter");

    // Verify "Not saved" and "Retry" in the quick capture bar
    const bar = page.getByTestId("quick-capture-bar");
    await expect(bar.getByText("Not saved")).toBeVisible();
    const retryButton = bar.getByRole("button", { name: "Retry" });
    await expect(retryButton).toBeVisible();

    // Remove interception for next attempt
    await page.unroute("**/api/v1/todos");

    // Click retry
    await retryButton.click();

    // Verify success - row should now appear and status in bar should be 'Saved'
    await expect(bar.getByText("Saved")).toBeVisible();
    const todoRow = page
      .getByTestId("todo-item-row")
      .filter({ hasText: todoText });
    await expect(todoRow).toBeVisible();
  });
});
