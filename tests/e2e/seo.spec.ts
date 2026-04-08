import { test, expect } from "@playwright/test";

test.describe("SEO", () => {
  test("page has proper title", async ({ page }) => {
    await page.goto("/en");
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(5);
  });

  test("page has meta description", async ({ page }) => {
    await page.goto("/en");
    const desc = await page.locator('meta[name="description"]').getAttribute("content");
    expect(desc).toBeTruthy();
    expect(desc!.length).toBeGreaterThan(10);
  });

  test("page has canonical link", async ({ page }) => {
    await page.goto("/en");
    const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
    expect(canonical).toContain("/en");
  });

  test("page has og:title", async ({ page }) => {
    await page.goto("/en");
    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute("content");
    expect(ogTitle).toBeTruthy();
  });

  test("page has og:locale", async ({ page }) => {
    await page.goto("/en");
    const ogLocale = await page.locator('meta[property="og:locale"]').getAttribute("content");
    expect(ogLocale).toBe("en_US");
  });

  test("page has JSON-LD structured data", async ({ page }) => {
    await page.goto("/en");
    const scripts = await page.locator('script[type="application/ld+json"]').count();
    expect(scripts).toBeGreaterThanOrEqual(1);
  });

  test("skip link is present and hidden by default", async ({ page }) => {
    await page.goto("/en");
    const skipLink = page.locator(".skip-link");
    await expect(skipLink).toBeAttached();
  });

  test("sitemap.xml is accessible", async ({ page }) => {
    const response = await page.goto("/sitemap.xml");
    expect(response?.status()).toBe(200);
    const text = await response?.text();
    expect(text).toContain("<urlset");
    expect(text).toContain("xhtml:link");
  });

  test("robots.txt is accessible", async ({ page }) => {
    const response = await page.goto("/robots.txt");
    expect(response?.status()).toBe(200);
    const text = await response?.text();
    expect(text).toContain("Sitemap:");
    expect(text).toContain("Disallow: /api/");
  });

  test("manifest.webmanifest is accessible", async ({ request }) => {
    const response = await request.get("/manifest.webmanifest");
    expect(response.status()).toBe(200);
    const json = await response.json();
    expect(json.name).toBeTruthy();
    expect(json.icons).toBeDefined();
  });
});
