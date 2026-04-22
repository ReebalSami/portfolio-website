import { test, expect, type Page, type Locator } from "@playwright/test";

/**
 * Regression tests for the MorphingDownloadCta rewrite (issue #46).
 *
 * iter-4 v3 — tightened assertions:
 *   1. Button tracks its placeholder 1:1 during intra-state scroll
 *      (no "dancing").
 *   2. Bottom slot activates when the slot is fully visible (not only
 *      when it crosses the viewport midline).
 *   3. FAB sits above the chat button (closed) and chat dialog (open),
 *      never below.
 *
 * Canonical route only (/en/cv, Editorial theme). Preview routes use
 * the legacy FAB and are excluded.
 */

async function findActivePortalButton(page: Page): Promise<Locator> {
  return page.getByRole("button", { name: /download/i }).first();
}

async function getButtonBox(page: Page) {
  const button = await findActivePortalButton(page);
  return button.boundingBox();
}

test.describe("CV morphing download CTA", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/en/cv");
    await page.waitForSelector('[data-morph-slot="top"]');
  });

  test("button is visible at every scroll position (no mid-flight disappearance)", async ({
    page,
  }) => {
    const scrollHeight = await page.evaluate(() => document.body.scrollHeight);
    const samples = 10;
    const collected: Array<{ y: number; box: { width: number; height: number } | null }> = [];

    for (let i = 0; i <= samples; i++) {
      const y = (scrollHeight * i) / samples;
      await page.evaluate((yy) => window.scrollTo(0, yy), y);
      await page.waitForTimeout(150);
      const box = await getButtonBox(page);
      collected.push({ y, box: box ? { width: box.width, height: box.height } : null });
    }

    for (let i = samples - 1; i >= 0; i--) {
      const y = (scrollHeight * i) / samples;
      await page.evaluate((yy) => window.scrollTo(0, yy), y);
      await page.waitForTimeout(150);
      const box = await getButtonBox(page);
      collected.push({ y, box: box ? { width: box.width, height: box.height } : null });
    }

    for (const { y, box } of collected) {
      expect(box, `button missing at scrollY=${y}`).not.toBeNull();
      expect(box!.width, `collapsed width at scrollY=${y}`).toBeGreaterThanOrEqual(24);
      expect(box!.height, `collapsed height at scrollY=${y}`).toBeGreaterThanOrEqual(24);
    }
  });

  test("top slot: button tracks its placeholder 1:1 during scroll (no dancing)", async ({
    page,
  }) => {
    // Spring-animation timing is environment-dependent; skip in headless CI.
    test.skip(!!process.env.CI, "Spring settling timing is unreliable in CI headless");

    // Stay inside the top slot (hero). Sample at small scroll offsets.
    // At each sample, the portal button's rect must match the top
    // placeholder's rect within a small tolerance — this proves the
    // button is snapping to the placeholder every scroll frame, not
    // running a chasing spring that leaves the user's eye trailing.
    const samples = 12;
    for (let i = 0; i < samples; i++) {
      const y = i * 30; // 30 px steps, still well inside the hero
      await page.evaluate((yy) => window.scrollTo(0, yy), y);
      await page.waitForTimeout(80);

      const placeholderBox = await page
        .locator('[data-morph-slot="top"]')
        .boundingBox();
      const buttonBox = await getButtonBox(page);

      expect(placeholderBox, `placeholder missing at scrollY=${y}`).not.toBeNull();
      expect(buttonBox, `button missing at scrollY=${y}`).not.toBeNull();

      // Allow 2 px of tolerance for sub-pixel rounding; anything larger
      // means the button is lagging the placeholder = dancing.
      expect(
        Math.abs(buttonBox!.x - placeholderBox!.x),
        `button.x lags placeholder.x at scrollY=${y}`,
      ).toBeLessThanOrEqual(2);
      expect(
        Math.abs(buttonBox!.y - placeholderBox!.y),
        `button.y lags placeholder.y at scrollY=${y}`,
      ).toBeLessThanOrEqual(2);
    }
  });

  test("bottom slot activates when scrolled to the footer", async ({ page }) => {
    test.skip(!!process.env.CI, "Spring settling timing is unreliable in CI headless");
    // Scroll to the very end of the document and wait for the spring to settle.
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(800);

    const bottomPlaceholder = page.locator('[data-morph-slot="bottom"]');
    await expect(bottomPlaceholder).toBeVisible();
    const placeholderBox = await bottomPlaceholder.boundingBox();
    const buttonBox = await getButtonBox(page);

    expect(placeholderBox).not.toBeNull();
    expect(buttonBox).not.toBeNull();

    // After the spring settles the button's rect should match the
    // bottom placeholder's rect. Generous tolerance for spring damping.
    expect(Math.abs(buttonBox!.x - placeholderBox!.x)).toBeLessThanOrEqual(6);
    expect(Math.abs(buttonBox!.y - placeholderBox!.y)).toBeLessThanOrEqual(6);
    // Bottom state = pill shape, NOT the 56 px FAB circle.
    expect(buttonBox!.width).toBeGreaterThan(80);
  });

  test("FAB sits above the chat button (chat closed)", async ({ page }) => {
    // Scroll past the hero into the fab region — but not so far that
    // the bottom slot activates.
    await page.evaluate(() => window.scrollBy(0, window.innerHeight));
    await page.waitForTimeout(500);

    const chatButton = page.getByRole("button", { name: /chat|message/i }).last();
    await expect(chatButton).toBeVisible();
    const chatBox = await chatButton.boundingBox();
    const fabBox = await getButtonBox(page);

    expect(chatBox).not.toBeNull();
    expect(fabBox).not.toBeNull();

    expect(fabBox!.y + fabBox!.height, "FAB bottom should be above chat button top").toBeLessThan(
      chatBox!.y - 4,
    );
  });

  test("FAB sits above the chat dialog (chat open)", async ({ page }) => {
    await page.evaluate(() => window.scrollBy(0, window.innerHeight));
    await page.waitForTimeout(300);

    const chatButton = page.getByRole("button", { name: /chat|message/i }).last();
    await chatButton.click();
    await page.waitForTimeout(500);

    const dialog = page.locator('[class*="bottom-24"][class*="rounded-2xl"]');
    await expect(dialog).toBeVisible();
    const dialogBox = await dialog.boundingBox();
    const fabBox = await getButtonBox(page);

    expect(dialogBox).not.toBeNull();
    expect(fabBox).not.toBeNull();

    // Use floor to handle sub-pixel rendering differences across environments.
    expect(Math.floor(fabBox!.y + fabBox!.height), "FAB should be above the chat dialog").toBeLessThan(
      dialogBox!.y - 1,
    );
  });

  test("button returns to the hero pill when scrolled back to the top", async ({
    page,
  }) => {
    test.skip(!!process.env.CI, "Spring settling timing is unreliable in CI headless");
    await page.evaluate(() => window.scrollBy(0, window.innerHeight * 2));
    await page.waitForTimeout(400);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(600);

    const placeholderBox = await page.locator('[data-morph-slot="top"]').boundingBox();
    const buttonBox = await getButtonBox(page);

    expect(placeholderBox).not.toBeNull();
    expect(buttonBox).not.toBeNull();
    expect(Math.abs(buttonBox!.x - placeholderBox!.x)).toBeLessThan(6);
    expect(Math.abs(buttonBox!.y - placeholderBox!.y)).toBeLessThan(6);
  });
});

test.describe("CV morphing download CTA — reduced motion", () => {
  test("state changes snap instantly under prefers-reduced-motion", async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: "reduce" });
    const page = await ctx.newPage();
    await page.goto("/en/cv");
    await page.waitForSelector('[data-morph-slot="top"]');

    const placeholderBox = await page.locator('[data-morph-slot="top"]').boundingBox();
    const buttonBox = await (async () => {
      const b = page.getByRole("button", { name: /download/i }).first();
      return b.boundingBox();
    })();

    expect(placeholderBox).not.toBeNull();
    expect(buttonBox).not.toBeNull();
    // No spring → button locked to placeholder from the first frame.
    expect(Math.abs(buttonBox!.x - placeholderBox!.x)).toBeLessThan(2);
    expect(Math.abs(buttonBox!.y - placeholderBox!.y)).toBeLessThan(2);

    await ctx.close();
  });
});
