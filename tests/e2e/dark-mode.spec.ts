import { test, expect } from "@playwright/test";

test.describe("Dark mode", () => {
  test("theme toggle button exists", async ({ page }) => {
    await page.goto("/en");
    const toggleBtn = page.locator('button[aria-label*="dark mode" i], button[aria-label*="Dunkelmodus" i], button[aria-label*="modo oscuro" i], button[aria-label*="الوضع" i]');
    await expect(toggleBtn.first()).toBeVisible();
  });

  // Dark is now the default: page loads with dark class, no localStorage entry.
  test("page defaults to dark mode on first visit", async ({ page }) => {
    await page.goto("/en");
    const { hasDark, stored } = await page.evaluate(() => ({
      hasDark: document.documentElement.classList.contains("dark"),
      stored: localStorage.getItem("theme"),
    }));
    expect(stored).toBeNull();
    expect(hasDark).toBe(true);
  });

  test("clicking theme toggle switches to light mode", async ({ page }) => {
    await page.goto("/en");
    // Page starts dark by default — one click → light.
    const toggleBtn = page.locator('[role="switch"]').first();
    await toggleBtn.click();
    await page.waitForTimeout(500);

    const { hasDark, stored } = await page.evaluate(() => ({
      hasDark: document.documentElement.classList.contains("dark"),
      stored: localStorage.getItem("theme"),
    }));
    expect(hasDark).toBe(false);
    expect(stored).toBe("light");
  });

  test("toggling twice returns to dark mode", async ({ page }) => {
    await page.goto("/en");
    const toggleBtn = page.locator('[role="switch"]').first();

    await toggleBtn.click(); // dark → light
    await page.waitForTimeout(500);
    await toggleBtn.click(); // light → dark
    await page.waitForTimeout(500);

    const { hasDark, stored } = await page.evaluate(() => ({
      hasDark: document.documentElement.classList.contains("dark"),
      stored: localStorage.getItem("theme"),
    }));
    expect(hasDark).toBe(true);
    expect(stored).toBe("dark");
  });

  test("explicit light preference persists across reload", async ({ page }) => {
    await page.goto("/en");
    // Switch to light
    await page.evaluate(() => localStorage.setItem("theme", "light"));
    await page.reload({ waitUntil: "domcontentloaded" });

    const hasDark = await page.evaluate(() =>
      document.documentElement.classList.contains("dark")
    );
    expect(hasDark).toBe(false);
  });
});
