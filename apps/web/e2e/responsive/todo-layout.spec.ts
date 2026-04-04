import { test, expect } from "@playwright/test";

const breakpoints = [
  { name: "Mobile", width: 320, height: 600 },
  { name: "Tablet", width: 768, height: 1024 },
  { name: "Desktop", width: 1024, height: 768 },
];

test.describe("Responsive Viewport Quality Gate @responsive", () => {
  for (const { name, width, height } of breakpoints) {
    test(`should render correctly on ${name} (${width}x${height})`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height });
      await page.goto("/");

      // Wait for content to be ready
      await expect(page.locator("main")).toBeVisible();

      // Check for QuickCaptureBar
      const quickCaptureBar = page.getByTestId("quick-capture-bar");
      await expect(quickCaptureBar).toBeVisible();

      // Check that there's no horizontal scroll
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

      // Verify that the main elements are within the viewport
      const boundingBox = await quickCaptureBar.boundingBox();
      if (boundingBox) {
        expect(boundingBox.x).toBeGreaterThanOrEqual(0);
        expect(boundingBox.x + boundingBox.width).toBeLessThanOrEqual(width);
      }
    });
  }
});
