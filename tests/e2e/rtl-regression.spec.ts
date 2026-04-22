import { test, expect } from "@playwright/test";

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";

/**
 * RTL smoke tests for Arabic locale.
 *
 * These tests verify:
 * 1. html[dir="rtl"] and lang="ar" are set correctly
 * 2. Arabic text is present in each section
 * 3. Latin-script tech terms (React, LLM, OTTO Group) render without reversal
 * 4. Western numerals are used (not Arabic-Indic)
 * 5. Key glossary terms appear in correct locale form
 *
 * Baseline screenshots live in tests/e2e/rtl-baseline/ and are updated
 * when content changes intentionally. Run with --update-snapshots to refresh.
 */

test.describe("Arabic RTL — smoke tests", () => {
  test("homepage /ar has correct RTL attributes and content", async ({
    page,
  }) => {
    await page.goto(`${BASE_URL}/ar`);
    await page.waitForLoadState("domcontentloaded");

    // RTL fundamentals
    const htmlDir = await page.getAttribute("html", "dir");
    const htmlLang = await page.getAttribute("html", "lang");
    expect(htmlDir).toBe("rtl");
    expect(htmlLang).toBe("ar");

    // Arabic text is present
    const bodyText = await page.evaluate(() => document.body.textContent || "");
    expect(/[؀-ۿ]/.test(bodyText)).toBe(true);

    // Hero section: improved transcreation (أجمع بين, not مدموجة مع)
    expect(bodyText).toContain("أجمع");
    expect(bodyText).not.toContain("مدموجة مع");

    // Locked tech terms in Latin script (not transliterated)
    expect(bodyText).toContain("OTTO Group");
    expect(bodyText).toContain("LLM");
    expect(bodyText).toContain("GraphRAG");

    // Western numerals (not Arabic-Indic ١٢٣)
    const arabicIndicDigits = bodyText.match(/[٠-٩]/g);
    expect(arabicIndicDigits).toBeNull();
  });

  test("about section /ar has correct glossary terms", async ({ page }) => {
    await page.goto(`${BASE_URL}/ar`);
    await page.waitForLoadState("domcontentloaded");

    // Scroll to about
    await page.evaluate(() =>
      document.getElementById("about")?.scrollIntoView({ behavior: "instant" })
    );

    const aboutEl = page.locator("#about");
    const aboutText = await aboutEl.textContent();

    // "عالم البيانات" (Data Scientist per glossary) or "عالِم بيانات" in visible summary
    expect(aboutText).toMatch(/عالِم بيانات|عالم بيانات/);

    // summary2 uses "كشف صحة النباتات" (plant health detection — always visible)
    expect(aboutText).toContain("كشف صحة النباتات");

    // Expand the builder card to verify urban farming translation
    const expandBtn = page.locator("#about").getByText(/المزيد|بانٍ شامل/).first();
    await expandBtn.click().catch(() => {/* card may already show content */});
    // Check full page body for الزراعة الحضرية (in expanded card or page source)
    const fullBody = await page.evaluate(() => document.body.innerHTML);
    expect(fullBody).toContain("الزراعة الحضرية");

    // "إدارة الفئات" (Category Management — in full page source)
    expect(fullBody).toContain("إدارة الفئات");
  });

  test("contact section /ar uses warm Arabic address (not corporate)", async ({
    page,
  }) => {
    await page.goto(`${BASE_URL}/ar`);
    await page.waitForLoadState("domcontentloaded");

    const contactEl = page.locator("#contact");
    await contactEl.scrollIntoViewIfNeeded();
    const contactText = await contactEl.textContent();

    // Should have "راسلني" or "تواصل" — warm, not corporate
    expect(contactText).toMatch(/راسلني|تواصل/);
  });

  test("CV page /ar/cv has RTL + correct job titles", async ({ page }) => {
    await page.goto(`${BASE_URL}/ar/cv`);
    await page.waitForLoadState("domcontentloaded");

    const htmlDir = await page.getAttribute("html", "dir");
    expect(htmlDir).toBe("rtl");

    const bodyText = await page.evaluate(() => document.body.textContent || "");

    // Financial Accountant per glossary
    expect(bodyText).toContain("محاسب مالي");

    // OTTO Group in locked source (Latin)
    expect(bodyText).toContain("OTTO Group");

    // Western numerals on CV dates
    expect(bodyText).toMatch(/20\d\d/);
  });

  test("no Arabic-Indic numerals on any AR page", async ({ page }) => {
    for (const path of ["/ar", "/ar/cv"]) {
      await page.goto(`${BASE_URL}${path}`);
      await page.waitForLoadState("domcontentloaded");
      const bodyText =
        await page.evaluate(() => document.body.textContent || "");
      const arabicIndicDigits = bodyText.match(/[٠-٩]/g);
      expect(arabicIndicDigits, `Arabic-Indic numerals found on ${path}`).toBeNull();
    }
  });
});

test.describe("German Du-form — smoke tests", () => {
  test("contact form /de uses Du-form (Dein, not Ihr)", async ({ page }) => {
    await page.goto(`${BASE_URL}/de`);
    await page.waitForLoadState("networkidle");

    const contactEl = page.locator("#contact");
    await contactEl.scrollIntoViewIfNeeded();

    // Use innerHTML to check placeholder attributes AND visible text
    const contactHtml = await contactEl.evaluate((el) => el.innerHTML);

    // Du-form: should find "Dein" or "Deine" in placeholders/labels
    expect(contactHtml).toMatch(/Dein|Deine/);

    // No formal Sie-form anywhere in contact section
    expect(contactHtml).not.toMatch(/\bIhr\b|\bIhre\b|\bIhnen\b/);
  });
});

test.describe("Spanish tú-form — smoke tests", () => {
  test("hero /es uses evocative verb (Fusiono, not combinados)", async ({
    page,
  }) => {
    await page.goto(`${BASE_URL}/es`);
    await page.waitForLoadState("domcontentloaded");

    const bodyText = await page.evaluate(() => document.body.textContent || "");
    expect(bodyText).toContain("Fusiono");
  });

  test("contact /es uses tú-form (Tu, not Vuestra/Usted)", async ({ page }) => {
    await page.goto(`${BASE_URL}/es`);
    await page.waitForLoadState("domcontentloaded");

    const contactEl = page.locator("#contact");
    await contactEl.scrollIntoViewIfNeeded();

    // Placeholder text is an attribute, not textContent — check via innerHTML
    const contactHtml = await contactEl.evaluate((el) => el.innerHTML);
    expect(contactHtml).toMatch(/Tu nombre|Tu correo|Tu mensaje/);

    // No formal usted-form
    expect(contactHtml).not.toMatch(/Su nombre|Su correo|Su mensaje/);
  });
});
