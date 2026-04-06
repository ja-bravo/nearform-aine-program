import { test, expect, type Page } from "@playwright/test";

const delayTodosApi = async (page: Page) => {
  const pause = () => new Promise<void>((r) => setTimeout(r, 100));
  await page.route("**/api/v1/todos/**", async (route) => {
    await pause();
    await route.continue();
  });
  await page.route("**/api/v1/todos", async (route) => {
    await pause();
    await route.continue();
  });
};

const uniqueTodoText = () =>
  `E2E ${Date.now()}-${test.info().parallelIndex}-${Math.floor(Math.random() * 10000)}`;

test.describe("Todo core journeys", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test("create todo", async ({ page }) => {
    await delayTodosApi(page);
    const todoText = uniqueTodoText();
    const input = page.getByTestId("quick-capture-input");
    await input.fill(todoText);
    await input.press("Enter");

    const bar = page.getByTestId("quick-capture-bar");
    const badge = bar.getByTestId("persistence-status-badge");
    await expect(badge.getByText(/Saving/i)).toBeVisible();
    await expect(badge.getByText(/Saved/i)).toBeVisible();

    const todoRow = page
      .getByTestId("todo-item-row")
      .filter({ hasText: todoText });
    await expect(todoRow).toBeVisible();
  });

  test("complete todo", async ({ page }) => {
    await delayTodosApi(page);
    const todoText = uniqueTodoText();
    const input = page.getByTestId("quick-capture-input");
    await input.fill(todoText);
    await input.press("Enter");

    const todoRow = page
      .getByTestId("todo-item-row")
      .filter({ hasText: todoText });
    await expect(todoRow).toBeVisible();

    await todoRow.getByTestId("todo-checkbox").click();

    await expect(todoRow.getByText(/Saving/i)).toBeVisible();
    await expect(todoRow.getByText(/Saved/i)).toBeVisible();

    const description = todoRow.locator("p").filter({ hasText: todoText });
    await expect(description).toHaveClass(/line-through/);
  });

  test("delete todo", async ({ page }) => {
    await delayTodosApi(page);
    const todoText = uniqueTodoText();
    const input = page.getByTestId("quick-capture-input");
    await input.fill(todoText);
    await input.press("Enter");

    const todoRow = page
      .getByTestId("todo-item-row")
      .filter({ hasText: todoText });
    await expect(todoRow).toBeVisible();

    await todoRow.getByTestId("todo-delete-button").click();
    await expect(todoRow).toBeHidden();
  });

  test("empty state", async ({ page }) => {
    let guard = 0;
    while ((await page.getByTestId("todo-item-row").count()) > 0) {
      if (++guard > 120) {
        throw new Error("Could not clear visible tasks for empty state");
      }
      const row = page.getByTestId("todo-item-row").first();
      await row.getByTestId("todo-delete-button").click();
      const detached = await row
        .waitFor({ state: "detached", timeout: 15000 })
        .then(() => true)
        .catch(() => false);
      if (!detached) {
        await page.reload();
        await page.waitForLoadState("networkidle");
      }
    }
    await expect(page.getByText("Nothing here yet")).toBeVisible();
    await expect(page.getByText(/Add your first task above/i)).toBeVisible();
  });

  test("error handling", async ({ page }) => {
    const todoText = uniqueTodoText();

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

    const bar = page.getByTestId("quick-capture-bar");
    await expect(bar.getByText("Not saved")).toBeVisible();
    const retryButton = bar.getByRole("button", { name: "Retry" });
    await expect(retryButton).toBeVisible();

    await page.unroute("**/api/v1/todos");

    await retryButton.click();

    await expect(bar.getByText("Saved")).toBeVisible();
    const todoRow = page
      .getByTestId("todo-item-row")
      .filter({ hasText: todoText });
    await expect(todoRow).toBeVisible();
  });
});
