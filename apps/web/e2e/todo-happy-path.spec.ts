import { test, expect } from "@playwright/test";

test.describe("Todo Happy Path", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("User can create, complete, and delete a todo", async ({ page }) => {
    const todoText = `Task ${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Create
    const input = page.getByPlaceholder(/Capture task/i);
    await input.fill(todoText);
    await input.press("Enter");

    const todoRow = page
      .getByTestId("todo-item-row")
      .filter({ hasText: todoText });

    // Verify persistence lifecycle
    await expect(todoRow.getByText(/Saving/i)).toBeVisible();
    await expect(todoRow.getByText(/Saved/i)).toBeVisible();
    await expect(todoRow).toBeVisible();

    // Complete
    const checkbox = todoRow.getByRole("checkbox");
    await checkbox.click();

    // Verify visual state change (strikethrough)
    const description = todoRow.locator("p").filter({ hasText: todoText });
    await expect(description).toHaveClass(/line-through/);

    // Verify persistence lifecycle for update
    await expect(todoRow.getByText(/Saving/i)).toBeVisible();
    await expect(todoRow.getByText(/Saved/i)).toBeVisible();

    // Delete
    const deleteButton = todoRow.getByRole("button", { name: /delete/i });
    await deleteButton.click();

    await expect(todoRow).not.toBeVisible();
  });
});
