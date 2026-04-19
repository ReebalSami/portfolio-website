import { test, expect } from "@playwright/test";

test.describe("Tech Stack — Homepage marquee", () => {
  test("renders 6 category sections", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/en");
    const rows = page.locator("section.tech-marquee-row");
    await expect(rows).toHaveCount(6);
  });

  test("each category has a primary <ul> + at least one aria-hidden duplicate per sub-row", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/en");
    const rows = page.locator("section.tech-marquee-row");
    const count = await rows.count();
    for (let i = 0; i < count; i++) {
      const row = rows.nth(i);
      const primaries = row.locator("ul:not([aria-hidden])");
      const dupes = row.locator('ul[aria-hidden="true"]');
      const primaryCount = await primaries.count();
      const dupeCount = await dupes.count();
      expect(primaryCount).toBeGreaterThanOrEqual(1);
      // 2 aria-hidden duplicates per sub-row
      expect(dupeCount).toBe(primaryCount * 2);
    }
  });

  test("at 1440px: long categories (AI/ML, Frameworks) split into >= 2 sub-rows, short ones stay at 1", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/en");

    // Category #1 is AI / Machine Learning (21 skills), #2 is Frameworks (25).
    const aiRow = page.locator("section.tech-marquee-row").nth(1);
    const frameworksRow = page.locator("section.tech-marquee-row").nth(2);
    // Short categories
    const dbRow = page.locator("section.tech-marquee-row").nth(4); // Databases (4)
    const toolsRow = page.locator("section.tech-marquee-row").nth(5); // Tools (6)

    const aiSubrows = await aiRow.locator("[data-subrow]").count();
    const fwSubrows = await frameworksRow.locator("[data-subrow]").count();
    const dbSubrows = await dbRow.locator("[data-subrow]").count();
    const toolsSubrows = await toolsRow.locator("[data-subrow]").count();

    expect(aiSubrows).toBeGreaterThanOrEqual(2);
    expect(fwSubrows).toBeGreaterThanOrEqual(2);
    expect(dbSubrows).toBe(1);
    expect(toolsSubrows).toBe(1);
  });

  test("every skill from tech-stack.ts appears at least once in the DOM (no lost items)", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/en");

    // Spot-check some known long-category skills that would otherwise be
    // hidden off-screen on the first paint.
    const section = page.locator('[data-section="tech-stack"]');
    const text = await section.innerText();
    // AI/ML tail-end skills (previously queued behind the scroll):
    expect(text).toMatch(/\bStatistical Modeling\b/);
    expect(text).toMatch(/\bTime Series\b/);
    // Frameworks tail-end:
    expect(text).toMatch(/\bSeaborn\b/);
    // Short-category items still present:
    expect(text).toMatch(/\bJupyter\b/);
  });

  test("sub-rows alternate animation direction within a multi-row category", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/en");

    const aiRow = page.locator("section.tech-marquee-row").nth(1);
    const primaries = aiRow.locator("ul:not([aria-hidden])");
    const n = await primaries.count();
    expect(n).toBeGreaterThanOrEqual(2);
    const cls0 = (await primaries.nth(0).getAttribute("class")) ?? "";
    const cls1 = (await primaries.nth(1).getAttribute("class")) ?? "";
    const rev0 = cls0.includes("[animation-direction:reverse]");
    const rev1 = cls1.includes("[animation-direction:reverse]");
    expect(rev0).not.toBe(rev1);
  });

  test("hovering any sub-row pauses every sub-row of that category; other categories keep running", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/en");

    const rows = page.locator("section.tech-marquee-row");
    // Pick AI/ML (index 1) because it's guaranteed to be multi-row at 1440px.
    const targetCategory = rows.nth(1);
    const otherCategory = rows.nth(2);

    // Hover only the FIRST sub-row inside AI/ML.
    const firstSubrow = targetCategory.locator("[data-subrow]").first();
    await firstSubrow.hover();
    await page.waitForTimeout(150);

    // EVERY animate-marquee track inside the hovered category must be paused,
    // including the tracks of sub-rows we did not directly hover.
    const targetStates = await targetCategory
      .locator("ul.animate-marquee")
      .evaluateAll((els) => els.map((el) => getComputedStyle(el).animationPlayState));
    expect(targetStates.length).toBeGreaterThan(0);
    targetStates.forEach((s) => expect(s).toBe("paused"));

    // Every track in a different category must still be running.
    const otherStates = await otherCategory
      .locator("ul.animate-marquee")
      .evaluateAll((els) => els.map((el) => getComputedStyle(el).animationPlayState));
    expect(otherStates.length).toBeGreaterThan(0);
    otherStates.forEach((s) => expect(s).toBe("running"));
  });

  test("touch-hold on a category pauses its tracks; releasing resumes them", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/en");

    const rows = page.locator("section.tech-marquee-row");
    const targetCategory = rows.nth(1); // AI/ML
    const otherCategory = rows.nth(2); // Frameworks

    // Baseline: all tracks running.
    const before = await targetCategory
      .locator("ul.animate-marquee")
      .evaluateAll((els) => els.map((el) => getComputedStyle(el).animationPlayState));
    before.forEach((s) => expect(s).toBe("running"));

    // Synthesise a touchstart inside the category's <section>.
    await targetCategory.dispatchEvent("touchstart", {
      bubbles: true,
      cancelable: true,
      touches: [{ identifier: 1, clientX: 100, clientY: 100 }],
      targetTouches: [{ identifier: 1, clientX: 100, clientY: 100 }],
      changedTouches: [{ identifier: 1, clientX: 100, clientY: 100 }],
    });
    await page.waitForTimeout(80);

    const paused = await targetCategory
      .locator("ul.animate-marquee")
      .evaluateAll((els) => els.map((el) => getComputedStyle(el).animationPlayState));
    paused.forEach((s) => expect(s).toBe("paused"));

    // Other categories unaffected.
    const otherDuringTouch = await otherCategory
      .locator("ul.animate-marquee")
      .evaluateAll((els) => els.map((el) => getComputedStyle(el).animationPlayState));
    otherDuringTouch.forEach((s) => expect(s).toBe("running"));

    // Release the touch.
    await targetCategory.dispatchEvent("touchend", {
      bubbles: true,
      cancelable: true,
      touches: [],
      targetTouches: [],
      changedTouches: [{ identifier: 1, clientX: 100, clientY: 100 }],
    });
    await page.waitForTimeout(80);

    const after = await targetCategory
      .locator("ul.animate-marquee")
      .evaluateAll((els) => els.map((el) => getComputedStyle(el).animationPlayState));
    after.forEach((s) => expect(s).toBe("running"));
  });

  test("respects prefers-reduced-motion", async ({ browser }) => {
    const context = await browser.newContext({
      reducedMotion: "reduce",
      viewport: { width: 1440, height: 900 },
    });
    const page = await context.newPage();
    await page.goto("/en");
    const track = page
      .locator("section.tech-marquee-row")
      .first()
      .locator("ul.animate-marquee")
      .first();
    const durationStr = await track.evaluate((el) => getComputedStyle(el).animationDuration);
    // Global `prefers-reduced-motion: reduce` rule in globals.css sets
    // `animation-duration: 0.01ms !important`. Browsers may normalise that
    // value as `0.01ms`, `1e-05s`, or `0s` — they're all effectively zero.
    // We accept anything below 1ms.
    const m = durationStr.match(/^([0-9eE.+-]+)(ms|s)$/);
    expect(m, `unexpected animation-duration format: ${durationStr}`).not.toBeNull();
    const value = parseFloat(m![1]);
    const unitMs = m![2] === "s" ? 1000 : 1;
    expect(value * unitMs).toBeLessThan(1);
    await context.close();
  });
});

test.describe("Badge text-extraction — bug regression", () => {
  test("homepage tech stack: innerText yields separated skill tokens", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/en");
    const section = page.locator('[data-section="tech-stack"]');
    const text = await section.innerText();
    expect(text).toMatch(/\bPython\b/);
    expect(text).toMatch(/\bTypeScript\b/);
    expect(text).toMatch(/\bJavaScript\b/);
    expect(text).toMatch(/\bJava\b/);
    expect(text).not.toMatch(/PythonTypeScript(?!\s)/);
    expect(text).not.toMatch(/TypeScriptJavaScript(?!\s)/);
    expect(text).not.toMatch(/JavaScriptJava(?!\s)/);
  });

  test("CV page skills: innerText yields separated skill tokens", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/en/cv");
    const skillsSection = page.locator('section:has(h2:has-text("Skills"))').first();
    const text = await skillsSection.innerText();
    expect(text).toMatch(/\bPython\b/);
    expect(text).not.toMatch(/PythonTypeScript(?!\s)/);
  });
});
