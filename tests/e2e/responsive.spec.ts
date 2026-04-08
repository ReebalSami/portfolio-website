import { test, expect, devices } from "@playwright/test";

test.describe("Responsive design", () => {
  test("mobile: hamburger menu is visible", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/en");
    const menuBtn = page.locator('button[aria-label*="menu" i], button[aria-label*="Menu" i]');
    await expect(menuBtn.first()).toBeVisible();
  });

  test("mobile: desktop nav is hidden", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/en");
    const desktopNav = page.locator("nav.hidden");
    await expect(desktopNav.first()).toBeHidden();
  });

  test("mobile: hamburger opens mobile nav", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/en");
    const menuBtn = page.locator('button[aria-label*="menu" i], button[aria-label*="Menu" i]');
    await menuBtn.first().click();
    await page.waitForTimeout(300);
    const mobileNav = page.locator('[role="dialog"] nav, [data-state="open"] nav');
    await expect(mobileNav.first()).toBeVisible({ timeout: 3000 });
  });

  test("desktop: nav links are visible", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/en");
    const nav = page.locator("nav").filter({ hasText: "About" });
    await expect(nav.first()).toBeVisible();
  });

  test("mobile: hero section is not cut off", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/en");
    const hero = page.locator("#home");
    await expect(hero).toBeVisible();
    const h1 = page.locator("h1");
    await expect(h1).toBeVisible();
  });

  test("tablet: layout adapts", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/en");
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("#about")).toBeAttached();
  });

  test("no horizontal scrollbar on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/en");
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
  });
});
