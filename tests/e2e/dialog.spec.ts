import { test, expect } from "@playwright/test";

test.describe("Dialog scroll-to-top on open", () => {
  test("project dialog opens scrolled to the top even with long content", async ({
    page,
  }) => {
    // Small viewport forces the long fullDescription + highlights to
    // exceed max-h-[85vh] — the exact condition that used to trigger
    // the scroll-to-bottom bug.
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/en");

    await page.locator("#projects").scrollIntoViewIfNeeded();

    // Click the B2B Sales project card — has the longest fullDescription
    // + 6 highlights so content is guaranteed to exceed max-h-[85vh].
    const cardTitle = page
      .locator("#projects")
      .getByText("B2B Sales Lead Pipeline", { exact: true });
    await cardTitle.scrollIntoViewIfNeeded();
    await cardTitle.click();

    const popup = page.locator("[data-slot='dialog-content']");
    await expect(popup).toBeVisible();

    // Title must be visible within the scrolled popup viewport.
    const title = popup.locator("[data-slot='dialog-title']");
    await expect(title).toBeInViewport();

    // Belt-and-suspenders: popup's scrollTop is at the top (0-ish).
    const scrollTop = await popup.evaluate((el) => el.scrollTop);
    expect(scrollTop).toBeLessThanOrEqual(4);
  });
});
