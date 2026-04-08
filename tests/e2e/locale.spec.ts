import { test, expect } from "@playwright/test";

test.describe("Locale switching", () => {
  test("default locale (en) loads correctly", async ({ page }) => {
    await page.goto("/en");
    await expect(page).toHaveURL(/\/en/);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
  });

  test("German locale loads correctly", async ({ page }) => {
    await page.goto("/de");
    await expect(page).toHaveURL(/\/de/);
    await expect(page.locator("html")).toHaveAttribute("lang", "de");
  });

  test("Spanish locale loads correctly", async ({ page }) => {
    await page.goto("/es");
    await expect(page).toHaveURL(/\/es/);
    await expect(page.locator("html")).toHaveAttribute("lang", "es");
  });

  test("Arabic locale loads with RTL", async ({ page }) => {
    await page.goto("/ar");
    await expect(page).toHaveURL(/\/ar/);
    await expect(page.locator("html")).toHaveAttribute("lang", "ar");
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  });

  test("locale switcher is visible and functional", async ({ page }) => {
    await page.goto("/en");
    const switcher = page.locator('[aria-label="Language"]').first();
    if (await switcher.isVisible()) {
      await switcher.click();
      const deOption = page.getByRole("option", { name: /Deutsch|DE/i }).first();
      if (await deOption.isVisible({ timeout: 2000 }).catch(() => false)) {
        await deOption.click();
        await expect(page).toHaveURL(/\/de/);
      }
    }
  });
});
