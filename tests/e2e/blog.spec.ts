import { test, expect } from "@playwright/test";

test.describe("Blog", () => {
  test("blog section shows on homepage", async ({ page }) => {
    await page.goto("/en");
    const blogSection = page.locator("#blog");
    await expect(blogSection).toBeAttached();
  });

  test("blog post page loads from homepage link", async ({ page }) => {
    await page.goto("/en");
    const blogSection = page.locator("#blog");
    await blogSection.scrollIntoViewIfNeeded();

    const firstLink = blogSection.locator("a").first();
    if (await firstLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      await firstLink.click();
      await expect(page).toHaveURL(/\/en\/blog\//);
      await expect(page.locator("article")).toBeVisible();
    }
  });

  test("blog post has back link", async ({ page }) => {
    await page.goto("/en/blog/building-multi-agent-ai-systems");
    const backLink = page.locator('a[href*="blog"]').first();
    await expect(backLink).toBeVisible();
  });

  test("blog post has title and metadata", async ({ page }) => {
    await page.goto("/en/blog/building-multi-agent-ai-systems");
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("article")).toBeVisible();
  });
});
