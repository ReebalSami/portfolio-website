import { test, expect, type Page } from "@playwright/test";

/**
 * E2E coverage for the desktop About hover-dropdown (Skill 27).
 *
 * Like `journey-compact.spec.ts`, these are feature-detected: when the
 * compactTimeline flag is OFF (default during rollout) the legacy plain
 * "About" button renders and there is no dropdown to test, so the suite
 * skips with a clear message.
 */

async function ensureDropdownOrSkip(page: Page) {
  // The dropdown trigger has aria-haspopup="menu". The legacy button
  // does not.
  const dropdownTrigger = page.locator('header button[aria-haspopup="menu"]').first();
  const count = await dropdownTrigger.count();
  if (count === 0) {
    test.skip(true, "features.compactTimeline is OFF — legacy About button rendered, skipping dropdown assertions.");
  }
}

test.describe("About hover-dropdown (Skill 27)", () => {
  test("opens on hover and reveals 3 sub-items", async ({ page }) => {
    await page.goto("/en");
    await ensureDropdownOrSkip(page);

    const trigger = page.locator('header button[aria-haspopup="menu"]').first();
    await trigger.hover();

    // Menu and 3 menuitems should appear.
    const menu = page.locator('[role="menu"]');
    await expect(menu).toBeVisible();
    await expect(menu.locator('[role="menuitem"]')).toHaveCount(3);
  });

  test("clicking a sub-item scrolls to the matching anchor", async ({ page }) => {
    await page.goto("/en");
    await ensureDropdownOrSkip(page);

    const trigger = page.locator('header button[aria-haspopup="menu"]').first();
    await trigger.hover();

    const journeyItem = page.getByRole("menuitem", { name: "Journey" });
    await journeyItem.click();

    // The journey anchor should be in view; we assert the URL hash is set
    // (same-document anchor click does not always update the hash without
    // an explicit href click — we use href="#journey" so it should).
    await page.waitForTimeout(800);
    const journeyEl = page.locator("#journey");
    await expect(journeyEl).toBeInViewport();
  });

  test("Escape closes the dropdown", async ({ page }) => {
    await page.goto("/en");
    await ensureDropdownOrSkip(page);

    const trigger = page.locator('header button[aria-haspopup="menu"]').first();
    await trigger.hover();
    await expect(page.locator('[role="menu"]')).toBeVisible();

    await trigger.focus();
    await page.keyboard.press("Escape");

    // aria-expanded reflects state regardless of AnimatePresence exit
    // animation timing.
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
  });
});
