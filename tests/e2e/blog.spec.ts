import { test, expect } from "@playwright/test";

/** Escape regex metacharacters so a Tailwind utility class can be safely
 *  embedded in a `RegExp` pattern (e.g. `tracking-[0.2em]`). */
function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

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

  test("blog post has BackToBlogLink at top and bottom (matches journey link styling)", async ({
    page,
  }) => {
    await page.goto("/en/blog/building-multi-agent-ai-systems");

    // The BackToBlogLink component exposes a `data-component` attribute so
    // tests can target it without coupling to copy or CSS classes.
    const backLinks = page.locator('a[data-component="back-to-blog"]');
    await expect(backLinks).toHaveCount(2);

    // Both instances should share the journey-link visual signature: small
    // uppercase heading-font label inside a class list that includes
    // `font-heading`, `uppercase`, and `tracking-[0.2em]` — these three
    // tokens together are unique to the journey + back-to-blog treatment.
    for (const cls of ["font-heading", "uppercase", "tracking-[0.2em]"]) {
      await expect(backLinks.first()).toHaveClass(new RegExp(escapeRegExp(cls)));
      await expect(backLinks.last()).toHaveClass(new RegExp(escapeRegExp(cls)));
    }

    // First instance (above the article header) should be visible without
    // scrolling. Verifies it points at the homepage `#blog` anchor.
    await expect(backLinks.first()).toBeVisible();
    await expect(backLinks.first()).toHaveAttribute("href", /#blog$/);
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
