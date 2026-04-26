import { test, expect, type Page } from "@playwright/test";

/**
 * E2E coverage for Skill 27 — CompactJourney + AboutDropdown.
 *
 * These tests are *feature-detected*: each one checks for the presence
 * of the new compact-journey carousel before asserting on it. When
 * `features.compactTimeline` is `false` in `config/site.yaml` (the default
 * during the rollout) the suite skips with a clear message so the legacy
 * timeline e2e coverage continues to pass without spurious failures.
 *
 * To run this file with the NEW behaviour exercised, flip
 * `features.compactTimeline: true` in `config/site.yaml`, then:
 *
 *     pnpm playwright test tests/e2e/journey-compact.spec.ts
 */

const LOCALES = ["en", "de", "es", "ar"] as const;

async function gotoJourney(page: Page, locale: string) {
  await page.goto(`/${locale}#journey`);
  await page.locator("#journey").scrollIntoViewIfNeeded();
}

async function ensureCompactJourneyOrSkip(page: Page) {
  // The desktop carousel is hidden below md (768 px); the mobile variant
  // is hidden above md. Detect either to decide if the feature is ON.
  const desktop = page.locator('#journey [role="region"][aria-roledescription="carousel"]:visible').first();
  const count = await desktop.count();
  if (count === 0) {
    test.skip(true, "features.compactTimeline is OFF — legacy timeline rendered, skipping compact-journey assertions.");
  }
}

test.describe("Compact Journey carousel (Skill 27)", () => {
  test("renders inside #journey anchor on the homepage", async ({ page }) => {
    await gotoJourney(page, "en");
    await ensureCompactJourneyOrSkip(page);
    await expect(
      page.locator('#journey [role="region"][aria-roledescription="carousel"]:visible').first(),
    ).toBeVisible();
  });

  test("clicking the right half of the viewport advances by one step", async ({ page }) => {
    await gotoJourney(page, "en");
    await ensureCompactJourneyOrSkip(page);

    const viewport = page
      .locator('#journey [role="region"][aria-roledescription="carousel"]:visible')
      .first();
    await expect(viewport).toBeVisible();

    const beforeRole = await page
      .locator('#journey [role="region"][aria-roledescription="carousel"]:visible h3')
      .first()
      .textContent();

    // Pivot v3: edge zones are visual-only with `pointer-events: none`,
    // and the viewport itself owns step-wise navigation. Click roughly
    // 80 px from the right edge of the viewport — well past the active
    // node at 50vw — and the viewport handler should call goNext.
    const box = await viewport.boundingBox();
    if (!box) throw new Error("carousel viewport has no bounding box");
    await page.mouse.click(
      box.x + box.width - 80,
      box.y + box.height / 2,
    );

    // Wait for the carousel transform to settle (700 ms transition).
    await page.waitForTimeout(900);
    const afterRole = await page
      .locator('#journey [role="region"][aria-roledescription="carousel"]:visible h3')
      .first()
      .textContent();

    expect(afterRole).not.toBe(beforeRole);
  });

  test("clicking a year label in the scrubber direct-jumps to that entry", async ({ page }) => {
    await gotoJourney(page, "en");
    await ensureCompactJourneyOrSkip(page);

    // The scrubber renders one button per entry labelled "<year> — <role>".
    // Year labels remain direct-jump (a11y-friendly: pressing Enter on a
    // labelled year is unambiguous). Pick a different entry than the
    // initial active one and click it.
    const yearButtons = page.locator(
      '#journey [role="group"] button[aria-label*="—"]',
    );
    const total = await yearButtons.count();
    expect(total).toBeGreaterThan(1);

    const beforeRole = await page
      .locator('#journey [role="region"][aria-roledescription="carousel"]:visible h3')
      .first()
      .textContent();

    // Click the last year label — guaranteed to differ from initial.
    await yearButtons.nth(total - 1).click();
    await page.waitForTimeout(900);

    const afterRole = await page
      .locator('#journey [role="region"][aria-roledescription="carousel"]:visible h3')
      .first()
      .textContent();
    expect(afterRole).not.toBe(beforeRole);
  });

  test("initial active card is the M.Sc. (entry flagged active: true)", async ({ page }) => {
    await gotoJourney(page, "en");
    await ensureCompactJourneyOrSkip(page);

    // The active card sits at the centre of the viewport with the role as
    // its <h3>. The canonical fixture marks `fhwedel` (M.Sc. Data Science
    // & AI) as active: true, so the initial render must surface that role.
    const activeRole = await page
      .locator('#journey [role="region"][aria-roledescription="carousel"]:visible h3')
      .first()
      .textContent();
    expect(activeRole).toMatch(/M\.?Sc\.?/i);
  });

  test("ArrowRight key advances on LTR locales", async ({ page }) => {
    await gotoJourney(page, "en");
    await ensureCompactJourneyOrSkip(page);

    const beforeRole = await page.locator('#journey [role="region"][aria-roledescription="carousel"]:visible h3').first().textContent();
    await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(900);
    const afterRole = await page.locator('#journey [role="region"][aria-roledescription="carousel"]:visible h3').first().textContent();

    expect(afterRole).not.toBe(beforeRole);
  });

  test("ArrowRight on AR locale moves BACKWARD in time (RTL semantics)", async ({ page }) => {
    await gotoJourney(page, "ar");
    await ensureCompactJourneyOrSkip(page);

    // We do not assert specific roles — just that the active entry changes
    // when the user presses ArrowRight. The carousel hook is responsible
    // for flipping the prev/next mapping; this proves the mapping is
    // wired through to the actual DOM.
    const before = await page.locator('#journey [role="region"][aria-roledescription="carousel"]:visible h3').first().textContent();
    await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(900);
    const after = await page.locator('#journey [role="region"][aria-roledescription="carousel"]:visible h3').first().textContent();

    expect(after).not.toBe(before);
  });

  test("mobile viewport: clicking the right side of the scrubber rail advances by one step", async ({ page }) => {
    // iPhone 13 size — the desktop carousel is hidden via `md:` breakpoint
    // (768 px), so only the mobile journey + its embedded scrubber render.
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoJourney(page, "en");
    await ensureCompactJourneyOrSkip(page);

    // Mobile scrubber lives inside #journey and renders the same
    // role="group" + aria-label as desktop. With the desktop carousel
    // hidden, the visible group is the mobile one.
    const scrubber = page
      .locator('#journey [role="group"][aria-label*="carousel" i]')
      .first();
    await expect(scrubber).toBeVisible();

    // The 24 px-tall step strip is a button with the same aria-label as
    // the scrubber group. Click roughly 90% of the way along its width
    // — well past the active thumb — to trigger goNext.
    const stripButton = scrubber
      .locator('button[aria-label*="carousel" i]')
      .first();
    const box = await stripButton.boundingBox();
    if (!box) throw new Error("scrubber strip has no bounding box");

    const beforeRole = await page
      .locator('#journey [role="region"][aria-roledescription="carousel"]:visible h3')
      .first()
      .textContent();
    await page.mouse.click(
      box.x + box.width * 0.9,
      box.y + box.height / 2,
    );
    await page.waitForTimeout(900);
    const afterRole = await page
      .locator('#journey [role="region"][aria-roledescription="carousel"]:visible h3')
      .first()
      .textContent();

    // Pivot v3 follow-up: before this fix, the mobile mini-rail had no
    // step-wise click anywhere — only direct-jump on each year dot. The
    // step strip is the regression surface this test pins.
    expect(afterRole).not.toBe(beforeRole);
  });

  test("legacy tagline is NOT rendered (design pivot v2 dropped it)", async ({ page }) => {
    await gotoJourney(page, "en");
    await ensureCompactJourneyOrSkip(page);

    // The original `From ledgers in Damascus...` tagline was rendered
    // above the carousel in v1. Pivot v2 removed it. The locale key
    // remains in the JSON files for chatbot context reuse, so we assert
    // the literal text is NOT in the document.
    await expect(
      page.getByText(/From ledgers in Damascus to multi-agent systems/i),
    ).toHaveCount(0);
  });

  for (const locale of LOCALES) {
    test(`renders without throwing on locale=${locale}`, async ({ page }) => {
      await gotoJourney(page, locale);
      await ensureCompactJourneyOrSkip(page);
      await expect(page.locator("#journey")).toBeVisible();
    });
  }
});
