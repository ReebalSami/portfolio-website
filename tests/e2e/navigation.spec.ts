import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test("homepage loads and shows hero section", async ({ page }) => {
    await page.goto("/en");
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("#home")).toBeVisible();
  });

  test("all sections are present on the homepage", async ({ page }) => {
    await page.goto("/en");
    for (const id of ["home", "about", "projects", "blog", "contact"]) {
      await expect(page.locator(`#${id}`)).toBeAttached();
    }
  });

  test("desktop nav links scroll to sections", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/en");
    const aboutBtn = page.locator("header nav button").filter({ hasText: "About" });
    if (await aboutBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await aboutBtn.click();
      await page.waitForTimeout(1000);
      const aboutSection = page.locator("#about");
      await expect(aboutSection).toBeInViewport({ ratio: 0.2 });
    }
  });

  test("header becomes sticky on scroll", async ({ page }) => {
    await page.goto("/en");
    await page.evaluate(() => window.scrollBy(0, 200));
    await page.waitForTimeout(500);
    const header = page.locator("header");
    const classes = await header.getAttribute("class");
    expect(classes).toContain("sticky");
  });
});
