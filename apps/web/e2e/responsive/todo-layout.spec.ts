import { test, expect } from "@playwright/test";

const breakpoints = [
  { name: "mobile", width: 375, height: 667 },
  { name: "sm", width: 640, height: 800 },
  { name: "md", width: 768, height: 800 },
  { name: "lg", width: 1024, height: 800 },
  { name: "desktop", width: 1280, height: 800 },
];

test.describe("Responsive Viewport Quality Gate @responsive", () => {
  for (const { name, width, height } of breakpoints) {
    test(`should render and interact correctly on ${name} (${width}x${height})`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height });
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      // Check for key components
      const quickCaptureBar = page.getByTestId("quick-capture-bar");
      await expect(quickCaptureBar).toBeVisible();

      // Ensure no horizontal scroll
      const isHorizontalScrollVisible = await page.evaluate(() => {
        return (
          document.documentElement.scrollWidth >
          document.documentElement.clientWidth
        );
      });
      expect(
        isHorizontalScrollVisible,
        `Horizontal scroll should not be present on ${name}`
      ).toBe(false);

      // Verify layout boundaries for QuickCaptureBar
      const boundingBox = await quickCaptureBar.boundingBox();
      expect(
        boundingBox,
        "QuickCaptureBar should have a valid layout"
      ).not.toBeNull();
      if (boundingBox) {
        expect(boundingBox.x).toBeGreaterThanOrEqual(0);
        expect(boundingBox.x + boundingBox.width).toBeLessThanOrEqual(width);
      }

      // [AC3] Core Flow: Add a todo
      const input = page.getByTestId("quick-capture-input");
      const addButton = page.getByTestId("quick-capture-submit");

      await input.fill(`Responsive Test ${name}`);
      await addButton.click();

      // [AC3] Core Flow: List and interact with TodoItemRow
      const todoRow = page.getByTestId("todo-item-row").first();
      await expect(todoRow).toBeVisible();

      const checkbox = todoRow.getByTestId("todo-checkbox");
      const deleteButton = todoRow.getByTestId("todo-delete-button");

      await expect(checkbox).toBeVisible();
      await expect(deleteButton).toBeVisible();

      // Toggle completion
      await checkbox.click();
      // Delete
      await deleteButton.click();
    });
  }
});
