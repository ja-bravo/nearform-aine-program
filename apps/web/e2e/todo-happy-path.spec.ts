import { test, expect } from "@playwright/test";

test.describe("Todo Happy Path", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("User can create, complete, and delete a todo", async ({ page }) => {
    const todoText = `Task ${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Slow down the API to ensure we see the 'Saving' state
    await page.route("**/api/v1/todos/**", async (route) => {
      await route.continue();
    });
    // Also for the base collection URL
    await page.route("**/api/v1/todos", async (route) => {
      await route.continue();
    });

    // Create
    const input = page.getByPlaceholder(/What needs doing?/i);
    await input.fill(todoText);
    await input.press("Enter");

    // Verify persistence lifecycle in the quick capture bar
    const bar = page.getByTestId("quick-capture-bar");
    const badge = bar.getByTestId("persistence-status-badge");
    await expect(badge.getByText(/Saving/i)).toBeVisible();
    await expect(badge.getByText(/Saved/i)).toBeVisible();

    const todoRow = page
      .getByTestId("todo-item-row")
      .filter({ hasText: todoText });
    await expect(todoRow).toBeVisible();

    // Complete
    const checkbox = todoRow.getByRole("checkbox");
    await checkbox.click();

    // Verify persistence lifecycle for update
    await expect(todoRow.getByText(/Saving/i)).toBeVisible();
    await expect(todoRow.getByText(/Saved/i)).toBeVisible();

    // Verify visual state change (strikethrough)
    const description = todoRow.locator("p").filter({ hasText: todoText });
    await expect(description).toHaveClass(/line-through/);

    // Delete
    const deleteButton = todoRow.getByRole("button", { name: /delete/i });
    await deleteButton.click();

    await expect(todoRow).not.toBeVisible();
  });
});
