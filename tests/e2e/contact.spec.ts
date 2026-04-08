import { test, expect } from "@playwright/test";

test.describe("Contact form", () => {
  test("form fields are visible", async ({ page }) => {
    await page.goto("/en");
    const contactSection = page.locator("#contact");
    await contactSection.scrollIntoViewIfNeeded();

    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="subject"]')).toBeVisible();
    await expect(page.locator('textarea[name="message"]')).toBeVisible();
  });

  test("shows validation errors for empty submission", async ({ page }) => {
    await page.goto("/en");
    const contactSection = page.locator("#contact");
    await contactSection.scrollIntoViewIfNeeded();

    const submitBtn = contactSection.locator('button[type="submit"]');
    await submitBtn.click();

    await expect(page.locator(".text-destructive").first()).toBeVisible({ timeout: 3000 });
  });

  test("honeypot field is not visible to users", async ({ page }) => {
    await page.goto("/en");
    const honeypotContainer = page.locator('.sr-only').filter({ has: page.locator('input[name="website"]') });
    await expect(honeypotContainer).toBeAttached();
    await expect(honeypotContainer).not.toBeInViewport();
  });

  test("submits form with valid data (mocked API)", async ({ page }) => {
    await page.route("**/api/contact", (route) =>
      route.fulfill({ status: 200, body: JSON.stringify({ ok: true }) })
    );

    await page.goto("/en");
    const contactSection = page.locator("#contact");
    await contactSection.scrollIntoViewIfNeeded();

    await page.fill('input[name="name"]', "Test User");
    await page.fill('input[name="email"]', "test@example.com");
    await page.fill('input[name="subject"]', "Test Subject");
    await page.fill('textarea[name="message"]', "This is a test message for the contact form.");

    const submitBtn = contactSection.locator('button[type="submit"]');
    await submitBtn.click();

    await expect(page.locator(".text-green-600, .text-green-400").first()).toBeVisible({
      timeout: 5000,
    });
  });
});
