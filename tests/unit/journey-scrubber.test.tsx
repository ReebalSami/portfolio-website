import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";

import { JourneyScrubber } from "@/components/journey/journey-scrubber";
import type { JourneyEntry } from "@/content/journey";

const MESSAGES = {
  about: {
    journey: {
      aria: {
        carousel: "Career journey carousel",
        previous: "Previous entry",
        next: "Next entry",
        goToEntry: "Go to entry {n}",
      },
    },
  },
};

/**
 * Minimal 6-entry fixture sufficient to exercise the geometry. The
 * `year`, `role`, and `org` fields are the only ones the scrubber
 * reads; everything else is inert filler.
 */
const ENTRIES: JourneyEntry[] = Array.from({ length: 6 }).map((_, i) => ({
  id: `entry-${i}`,
  year: `20${String(10 + i).padStart(2, "0")}`,
  yearRange: `20${String(10 + i).padStart(2, "0")} — present`,
  role: `Role ${i}`,
  org: `Org ${i}`,
  place: "Hamburg",
  keywords: [],
  chapter: { en: "", de: "", es: "", ar: "" },
  tagline: { en: "", de: "", es: "", ar: "" },
}));

const COUNT = ENTRIES.length;

function renderScrubber(opts: {
  direction: "ltr" | "rtl";
  active: number;
  showDots?: boolean;
}) {
  const locale = opts.direction === "rtl" ? "ar" : "en";
  return render(
    <NextIntlClientProvider locale={locale} messages={MESSAGES}>
      <JourneyScrubber
        entries={ENTRIES}
        active={opts.active}
        goPrev={vi.fn()}
        goNext={vi.fn()}
        setActive={vi.fn()}
        direction={opts.direction}
        showDots={opts.showDots}
      />
    </NextIntlClientProvider>,
  );
}

/**
 * Year-label buttons: aria-label format is "<year> — <role>" with NO
 * trailing org segment. The dot buttons (when `showDots`) use
 * "<year> — <role>, <org>" so the trailing org disambiguates.
 */
function getLabelButtons(container: HTMLElement): HTMLButtonElement[] {
  return Array.from(
    container.querySelectorAll<HTMLButtonElement>("button"),
  ).filter((btn) => {
    const label = btn.getAttribute("aria-label") ?? "";
    return /^\d{4} — [^,]+$/.test(label);
  });
}

function getDotButtons(container: HTMLElement): HTMLButtonElement[] {
  return Array.from(
    container.querySelectorAll<HTMLButtonElement>("button"),
  ).filter((btn) => {
    const label = btn.getAttribute("aria-label") ?? "";
    return /^\d{4} — .+, .+/.test(label);
  });
}

function getRoot(container: HTMLElement): HTMLElement {
  const root = container.querySelector<HTMLElement>('[role="group"]');
  expect(root).not.toBeNull();
  return root!;
}

/**
 * jsdom (and browsers) simplify `calc(N * 100% / D)` at parse time
 * into the equivalent `calc(<percentage>%)`. Tests that assert against
 * the original literal string would be brittle — instead we extract
 * the numeric percentage and compare it to the expected fraction.
 */
function parseCalcPercent(value: string): number {
  // Match "calc(<number>%)" — handles the simplified form jsdom emits.
  const m = value.match(/calc\(([-\d.]+)%\)/);
  if (m) return parseFloat(m[1]);
  // Fallback: if the literal form is preserved, evaluate it.
  const literal = value.match(/calc\(([\d.]+)\s*\*\s*([\d.]+)%\s*\/\s*([\d.]+)\)/);
  if (literal) {
    const [, a, b, c] = literal;
    return (parseFloat(a) * parseFloat(b)) / parseFloat(c);
  }
  throw new Error(`Unrecognised calc() form: ${value}`);
}

function getTrackRow(container: HTMLElement): HTMLElement {
  // The track row is a `relative col-span-full h-2` div, the only
  // element with `col-span-full` in the rendered subtree.
  const row = container.querySelector<HTMLElement>(".col-span-full");
  expect(row).not.toBeNull();
  return row!;
}

function getBaseTrack(trackRow: HTMLElement): HTMLElement {
  // Base track is the first aria-hidden div with bg-foreground/20.
  const node = Array.from(
    trackRow.querySelectorAll<HTMLElement>('[aria-hidden="true"]'),
  ).find((el) => el.className.includes("bg-foreground/20"));
  expect(node).toBeTruthy();
  return node!;
}

function getFill(trackRow: HTMLElement): HTMLElement {
  // Fill is the aria-hidden div with `width` set in inline style.
  const node = Array.from(
    trackRow.querySelectorAll<HTMLElement>('[aria-hidden="true"]'),
  ).find((el) => el.style.width !== "");
  expect(node).toBeTruthy();
  return node!;
}

describe("JourneyScrubber — CSS Grid layout (v3.3)", () => {
  describe("outer grid container", () => {
    it("uses display: grid with repeat(N, 1fr) columns", () => {
      const { container } = renderScrubber({ direction: "ltr", active: 0 });
      const root = getRoot(container);
      // Tailwind's `grid` className → display: grid.
      expect(root.className).toContain("grid");
      // The column template is set inline so it scales with `count`.
      expect(root.style.gridTemplateColumns).toBe(`repeat(${COUNT}, 1fr)`);
    });

    it("carries dir={direction} so RTL mirroring is browser-native", () => {
      const ltr = renderScrubber({ direction: "ltr", active: 0 });
      const rtl = renderScrubber({ direction: "rtl", active: 0 });
      expect(getRoot(ltr.container).getAttribute("dir")).toBe("ltr");
      expect(getRoot(rtl.container).getAttribute("dir")).toBe("rtl");
    });

    it("DOM order of labels is identical in LTR and RTL (browser handles physical mirror)", () => {
      const ltr = renderScrubber({ direction: "ltr", active: 0 });
      const rtl = renderScrubber({ direction: "rtl", active: 0 });
      const ltrYears = getLabelButtons(ltr.container).map((b) => b.textContent);
      const rtlYears = getLabelButtons(rtl.container).map((b) => b.textContent);
      expect(rtlYears).toEqual(ltrYears);
    });

    it("rowGap is 32 px when showDots, 10 px otherwise", () => {
      const noDots = renderScrubber({ direction: "ltr", active: 0 });
      const withDots = renderScrubber({
        direction: "ltr",
        active: 0,
        showDots: true,
      });
      expect(getRoot(noDots.container).style.rowGap).toBe("10px");
      expect(getRoot(withDots.container).style.rowGap).toBe("32px");
    });

    it("max width caps at 360 px (fluid below)", () => {
      const { container } = renderScrubber({ direction: "ltr", active: 0 });
      expect(getRoot(container).style.maxWidth).toBe("360px");
    });

    it("contains NO inline `inset-inline-start: <px>` style — proves no pixel-math layout", () => {
      // v3.3 regression guard. The previous implementation set
      // inline pixel offsets like `style.insetInlineStart = "64px"`
      // on labels and dots. The grid version uses `gridColumn` for
      // dots and auto-flow for labels — no pixel offsets anywhere
      // on label or dot buttons.
      const { container } = renderScrubber({
        direction: "ltr",
        active: 1,
        showDots: true,
      });
      const labels = getLabelButtons(container);
      const dots = getDotButtons(container);
      [...labels, ...dots].forEach((btn) => {
        expect(btn.style.insetInlineStart).toBe("");
      });
    });
  });

  describe("year labels — auto-flowed into grid columns", () => {
    it("renders one label per entry, in DOM order", () => {
      const { container } = renderScrubber({ direction: "ltr", active: 0 });
      const labels = getLabelButtons(container);
      expect(labels.length).toBe(COUNT);
      labels.forEach((btn, i) => {
        expect(btn.textContent).toBe(ENTRIES[i].year);
      });
    });

    it("each label has text-center so it sits at its cell's centre", () => {
      const { container } = renderScrubber({ direction: "ltr", active: 0 });
      getLabelButtons(container).forEach((btn) => {
        expect(btn.className).toContain("text-center");
      });
    });

    it("active label carries aria-current='true'; others do not", () => {
      const { container } = renderScrubber({ direction: "ltr", active: 2 });
      getLabelButtons(container).forEach((btn, i) => {
        if (i === 2) expect(btn.getAttribute("aria-current")).toBe("true");
        else expect(btn.getAttribute("aria-current")).toBeNull();
      });
    });
  });

  describe("track + fill — logical inset properties", () => {
    it("base track is inset by half a column on both sides (50% / N)", () => {
      const { container } = renderScrubber({ direction: "ltr", active: 0 });
      const track = getBaseTrack(getTrackRow(container));
      // 50% / 6 = 8.3333%
      const expected = 50 / COUNT;
      expect(parseCalcPercent(track.style.insetInlineStart)).toBeCloseTo(
        expected,
        3,
      );
      expect(parseCalcPercent(track.style.insetInlineEnd)).toBeCloseTo(
        expected,
        3,
      );
    });

    it("fill width equals (active / N) of full container width", () => {
      const { container } = renderScrubber({ direction: "ltr", active: 1 });
      const fill = getFill(getTrackRow(container));
      // active=1 → 1/6 = 16.6667%
      expect(parseCalcPercent(fill.style.width)).toBeCloseTo(
        (1 / COUNT) * 100,
        3,
      );
    });

    it("fill at active=0 has zero width (no visible trail)", () => {
      const { container } = renderScrubber({ direction: "ltr", active: 0 });
      const fill = getFill(getTrackRow(container));
      expect(parseCalcPercent(fill.style.width)).toBeCloseTo(0, 3);
    });

    it("fill at active=count-1 spans the full visible track", () => {
      const { container } = renderScrubber({
        direction: "ltr",
        active: COUNT - 1,
      });
      const fill = getFill(getTrackRow(container));
      // active=5 → 5/6 = 83.3333% of the full container, which is
      // exactly the visible track length (the track itself is inset
      // by 50%/N = 1/12 on each side, so visible length = 1 − 2·(1/12)
      // = 5/6). Fill ends precisely at the last dot's centre.
      expect(parseCalcPercent(fill.style.width)).toBeCloseTo(
        ((COUNT - 1) / COUNT) * 100,
        3,
      );
    });

    it("fill anchored at the inline-start (logical), so RTL mirrors via `dir`", () => {
      const ltr = renderScrubber({ direction: "ltr", active: 2 });
      const rtl = renderScrubber({ direction: "rtl", active: 2 });
      const ltrFill = getFill(getTrackRow(ltr.container));
      const rtlFill = getFill(getTrackRow(rtl.container));
      // Same inline-start string in both — the BROWSER does the flip,
      // not our React code.
      expect(rtlFill.style.insetInlineStart).toBe(
        ltrFill.style.insetInlineStart,
      );
      expect(rtlFill.style.width).toBe(ltrFill.style.width);
    });
  });

  describe("thumb (non-showDots) — animatable percentage position", () => {
    function getThumb(container: HTMLElement): HTMLElement | null {
      return container.querySelector<HTMLElement>(
        '[data-testid="scrubber-thumb"]',
      );
    }

    it("renders the thumb when showDots is false", () => {
      const { container } = renderScrubber({ direction: "ltr", active: 0 });
      expect(getThumb(container)).not.toBeNull();
    });

    it("does NOT render the thumb when showDots is true", () => {
      const { container } = renderScrubber({
        direction: "ltr",
        active: 0,
        showDots: true,
      });
      expect(getThumb(container)).toBeNull();
    });

    it("thumb inset-inline-start equals column (active+1)'s centre as a percentage", () => {
      const { container } = renderScrubber({ direction: "ltr", active: 1 });
      const thumb = getThumb(container);
      expect(thumb).not.toBeNull();
      // active=1 → (2*1+1)*50% / 6 = 25% (column 2 centre on a 6-col grid)
      const expected = ((2 * 1 + 1) * 50) / COUNT;
      expect(parseCalcPercent(thumb!.style.insetInlineStart)).toBeCloseTo(
        expected,
        3,
      );
    });

    it("thumb position uses the same percentage in LTR and RTL — `dir` flips it", () => {
      const ltr = renderScrubber({ direction: "ltr", active: 3 });
      const rtl = renderScrubber({ direction: "rtl", active: 3 });
      expect(getThumb(rtl.container)!.style.insetInlineStart).toBe(
        getThumb(ltr.container)!.style.insetInlineStart,
      );
    });
  });

  describe("dots overlay (showDots) — nested grid with same column template", () => {
    function getOverlay(container: HTMLElement): HTMLElement | null {
      return container.querySelector<HTMLElement>(
        '[data-testid="scrubber-dot-overlay"]',
      );
    }

    it("overlay is a grid with `repeat(N, 1fr)` — identical column centres to the outer grid", () => {
      const { container } = renderScrubber({
        direction: "ltr",
        active: 0,
        showDots: true,
      });
      const overlay = getOverlay(container);
      expect(overlay).not.toBeNull();
      expect(overlay!.style.gridTemplateColumns).toBe(`repeat(${COUNT}, 1fr)`);
    });

    it("overlay has pointer-events-none so empty cells fall through to the click strip", () => {
      const { container } = renderScrubber({
        direction: "ltr",
        active: 0,
        showDots: true,
      });
      expect(getOverlay(container)!.className).toContain("pointer-events-none");
    });

    it("each dot button uses `gridColumn: i+1` (structural alignment with its label above)", () => {
      const { container } = renderScrubber({
        direction: "ltr",
        active: 0,
        showDots: true,
      });
      const dots = getDotButtons(container);
      expect(dots.length).toBe(COUNT);
      dots.forEach((btn, i) => {
        expect(btn.style.gridColumn).toBe(String(i + 1));
      });
    });

    it("each dot button has pointer-events-auto (opts back into clicks)", () => {
      const { container } = renderScrubber({
        direction: "ltr",
        active: 0,
        showDots: true,
      });
      getDotButtons(container).forEach((btn) => {
        expect(btn.className).toContain("pointer-events-auto");
      });
    });

    it("overlay's vertical centre aligns with the track line via top-1/2 + -translate-y-1/2", () => {
      // Regression guard for the v3.3 → v3.4 fix. The original code
      // used `absolute inset-0` which pinned the overlay to the 8-px
      // track row's box; the 40-px JourneyNode row inside then
      // started at the parent's top edge (align-content defaults to
      // `start`), pushing dot centres ~16 px BELOW the track line.
      // The fix is purely vertical: `top-1/2 -translate-y-1/2`
      // centres the overlay's box on the track line so the dots sit
      // ON the rail.
      const { container } = renderScrubber({
        direction: "ltr",
        active: 0,
        showDots: true,
      });
      const overlay = getOverlay(container)!;
      expect(overlay.className).toContain("top-1/2");
      expect(overlay.className).toContain("-translate-y-1/2");
      // And the overlay must NOT carry `inset-0` (that was the bug).
      // We match `\binset-0\b` to avoid colliding with `inset-x-0`.
      expect(overlay.className).not.toMatch(/(^|\s)inset-0(\s|$)/);
    });
  });

  describe("v3.0–3.2 regression guards", () => {
    it("contains NO `flex-row-reverse` className anywhere — `dir='rtl'` handles the mirror natively", () => {
      const { container } = renderScrubber({
        direction: "rtl",
        active: 0,
        showDots: true,
      });
      expect(container.querySelector(".flex-row-reverse")).toBeNull();
    });

    it("the only inline-style direction conditional is the linear-gradient angle on the fill", () => {
      // Render at both directions and diff their inline styles. The
      // fill should be the only element whose inline style differs.
      const ltrEl = renderScrubber({
        direction: "ltr",
        active: 1,
        showDots: true,
      });
      const rtlEl = renderScrubber({
        direction: "rtl",
        active: 1,
        showDots: true,
      });
      const ltrFill = getFill(getTrackRow(ltrEl.container));
      const rtlFill = getFill(getTrackRow(rtlEl.container));
      // Layout properties are identical.
      expect(rtlFill.style.insetInlineStart).toBe(ltrFill.style.insetInlineStart);
      expect(rtlFill.style.width).toBe(ltrFill.style.width);
      // Background gradient flips.
      expect(ltrFill.style.background).toContain("linear-gradient(90deg");
      expect(rtlFill.style.background).toContain("linear-gradient(270deg");
    });
  });
});
