import { test, expect } from "@playwright/test";

test.describe("Dark mode", () => {
  test("theme toggle button exists", async ({ page }) => {
    await page.goto("/en");
    const toggleBtn = page.locator('button[aria-label*="dark mode" i], button[aria-label*="Dunkelmodus" i], button[aria-label*="modo oscuro" i], button[aria-label*="الوضع" i]');
    await expect(toggleBtn.first()).toBeVisible();
  });

  test("clicking theme toggle adds dark class", async ({ page }) => {
    await page.goto("/en");
    const toggleBtn = page.locator('button[aria-label*="dark mode" i], button[aria-label*="Dunkelmodus" i]');
    await toggleBtn.first().click();
    await page.waitForTimeout(500);

    const hasDark = await page.evaluate(() =>
      document.documentElement.classList.contains("dark")
    );
    expect(hasDark).toBe(true);
  });

  test("toggling back removes dark class", async ({ page }) => {
    await page.goto("/en");
    const toggleBtn = page.locator('button[aria-label*="dark mode" i], button[aria-label*="Dunkelmodus" i]');

    await toggleBtn.first().click();
    await page.waitForTimeout(500);
    await toggleBtn.first().click();
    await page.waitForTimeout(500);

    const hasDark = await page.evaluate(() =>
      document.documentElement.classList.contains("dark")
    );
    expect(hasDark).toBe(false);
  });
});
