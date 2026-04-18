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

  test("blog photo opens and closes lightbox", async ({ page }) => {
    await page.goto("/en/blog/building-multi-agent-ai-systems");

    const photoTrigger = page.getByRole("button", { name: /Open photo:/i }).first();
    await expect(photoTrigger).toBeVisible();

    await photoTrigger.click();
    const lightboxPortal = page.locator(".yarl__portal_open");
    await expect(lightboxPortal).toBeVisible();

    const closeButton = page.getByRole("button", { name: "Close" });
    await expect(closeButton).toBeVisible();
    await closeButton.click();

    await expect(lightboxPortal).toBeHidden();
  });

  test("single-image blog gallery hides next/prev controls", async ({ page }) => {
    await page.goto("/en/blog/building-multi-agent-ai-systems");

    const photoTrigger = page.getByRole("button", { name: /Open photo:/i }).first();
    await expect(photoTrigger).toBeVisible();
    await photoTrigger.click();

    await expect(page.locator(".yarl__portal_open")).toBeVisible();
    await expect(page.getByRole("button", { name: "Previous photo" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Next photo" })).toHaveCount(0);
  });
});
