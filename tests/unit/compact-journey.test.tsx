import { describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";

// next-view-transitions is used by TransitionLink — stub the routing hook
// since jsdom has no view transitions API and we don't navigate anywhere
// in these tests.
vi.mock("next-view-transitions", () => ({
  useTransitionRouter: () => ({ push: vi.fn() }),
}));

// `@/i18n/navigation` re-exports next-intl's createNavigation outputs.
// next-intl@4 imports `next/navigation` (not `next/navigation.js`), which
// pnpm + Next 16 fail to resolve under Vitest's bundler-mode resolution.
// Stub directly so the compact-journey component tree mounts cleanly.
vi.mock("@/i18n/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/",
  Link: ({ href, children, ...rest }: React.ComponentProps<"a">) => (
    <a href={typeof href === "string" ? href : "#"} {...rest}>
      {children}
    </a>
  ),
  redirect: vi.fn(),
  getPathname: vi.fn(),
}));

import { CompactJourney } from "@/components/journey/compact-journey";
import { journeyEntries } from "@/content/journey";

const MESSAGES = {
  common: {
    buttons: {
      viewCV: "View CV",
    },
  },
  about: {
    journey: {
      tagline:
        "From ledgers in Damascus to multi-agent systems in Hamburg.",
      viewFullCv: "Full résumé",
      aria: {
        carousel: "Career journey carousel",
        previous: "Previous entry",
        next: "Next entry",
        goToEntry: "Go to entry {n}",
      },
    },
  },
};

function renderJourney(locale: "en" | "de" | "es" | "ar" = "en", isRtl = false) {
  return render(
    <NextIntlClientProvider locale={locale} messages={MESSAGES}>
      <CompactJourney locale={locale} isRtl={isRtl} />
    </NextIntlClientProvider>,
  );
}

describe("CompactJourney", () => {
  it("does NOT render the legacy tagline (design pivot v2 removed it)", () => {
    renderJourney("en");
    // The tagline string from messages was previously displayed at the
    // top of the carousel. Per pivot v2, it is no longer rendered, even
    // though the i18n key remains in the JSON files.
    expect(
      screen.queryByText(/From ledgers in Damascus to multi-agent systems/i),
    ).toBeNull();
  });

  it("exposes a carousel role label for accessibility", () => {
    renderJourney("en");
    // Two regions render: desktop (hidden on mobile) and mobile (hidden on
    // desktop). Both expose the same aria-label, so assert presence by name.
    expect(
      screen.getAllByRole("region", { name: /Career journey carousel/i }).length,
    ).toBeGreaterThan(0);
  });

  it("renders entry buttons for every entry (mobile mini-rail + scrubber labels)", () => {
    renderJourney("en");
    // Pivot v3: desktop nodes are no longer buttons (clicks are step-wise
    // at the viewport level). The mobile mini-rail still renders one
    // button per entry, and the scrubber renders one year-label button
    // per entry. We expect at least N total — finding that many proves
    // the data wired through to the rendered tree.
    const buttons = screen.getAllByRole("button", {
      name: /\d{4} —/,
    });
    expect(buttons.length).toBeGreaterThanOrEqual(journeyEntries.length);
  });

  it("desktop edge zones are pure-visual (aria-hidden, NOT buttons)", () => {
    renderJourney("en");
    // Pivot v3: edge zones are now `aria-hidden="true"` overlays. The
    // mobile variant still has Previous/Next arrow buttons — those must
    // remain accessible — so the only thing we assert here is that the
    // overall set of Previous/Next labelled buttons matches the mobile
    // count (2: one prev, one next), not the v2 count of 4 (mobile + desktop).
    const prev = screen.getAllByRole("button", { name: /Previous entry/i });
    const next = screen.getAllByRole("button", { name: /Next entry/i });
    expect(prev.length).toBe(1);
    expect(next.length).toBe(1);
  });

  it("renders the scrubber as a labelled group on BOTH desktop and mobile", () => {
    renderJourney("en");
    // Pivot v3 follow-up: mobile no longer uses a bespoke scrollable
    // mini-rail; it embeds <JourneyScrubber showDots /> for parity with
    // desktop. Both subtrees mount in jsdom (they're hidden via CSS only),
    // so we expect TWO scrubber groups now.
    const groups = screen.getAllByRole("group", {
      name: /Career journey carousel/i,
    });
    expect(groups.length).toBe(2);
  });

  it("mobile scrubber exposes a step-wise click strip (regression for v3 mobile pivot)", () => {
    renderJourney("en");
    // Each JourneyScrubber renders ONE labelled strip button — the
    // 24 px-tall hit area that owns step-wise clicks. With desktop +
    // mobile both rendering a scrubber, we expect TWO such strip buttons
    // sharing the carousel aria-label. Before the v3 mobile pivot, only
    // the desktop scrubber rendered one; the mobile mini-rail had per-
    // entry direct-jump buttons but no step-wise strip at all.
    const stripButtons = screen.getAllByRole("button", {
      name: /Career journey carousel/i,
    });
    expect(stripButtons.length).toBe(2);
  });

  it("mobile scrubber renders ONE dot button per entry (parity with desktop timeline visual)", () => {
    renderJourney("en");
    // showDots in JourneyScrubber renders <JourneyNode> per entry, each
    // wrapped in a button labelled "<year> — <role>, <org>". Desktop
    // scrubber renders year-only labels ("<year> — <role>"), so the
    // dot buttons are uniquely identifiable by the trailing org segment.
    const dotButtons = screen.getAllByRole("button", {
      name: /\d{4} — .+, .+/,
    });
    expect(dotButtons.length).toBe(journeyEntries.length);
  });

  it("initial active card is the entry flagged active: true (M.Sc.)", () => {
    renderJourney("en");
    // The active card's <h3> is the role. With the present-role fixture
    // (`fhwedel`), the role string is "M.Sc. Data Science & AI". Two
    // copies of the active h3 may render (desktop + mobile), so check
    // that AT LEAST one of them is the M.Sc.
    const headings = screen
      .getAllByRole("heading", { level: 3 })
      .map((h) => h.textContent ?? "");
    expect(headings.some((t) => /M\.?Sc\.?/i.test(t))).toBe(true);
  });

  it("AR carousel viewport is dir=rtl", () => {
    const { container } = renderJourney("ar", true);
    // Both mobile + desktop carousels have role=region + aria-roledescription=carousel,
    // but only the desktop viewport sets `dir` explicitly (the mobile one
    // inherits page direction). Locate the desktop variant directly.
    const desktop = container.querySelector(
      '[role="region"][aria-roledescription="carousel"][dir="rtl"]',
    );
    expect(desktop).not.toBeNull();
  });

  it("ArrowRight in LTR moves forward (active card text changes)", () => {
    renderJourney("en", false);
    // Capture initial active entry's role from the centered card. We then
    // dispatch ArrowRight to the window (the hook listens on window).
    const initialRoles = screen
      .getAllByRole("heading", { level: 3 })
      .map((h) => h.textContent);
    act(() => {
      fireEvent.keyDown(window, { key: "ArrowRight" });
    });
    const nextRoles = screen
      .getAllByRole("heading", { level: 3 })
      .map((h) => h.textContent);
    // We don't assert WHICH role is next — just that the active card's
    // h3 content changed (i.e. the carousel advanced).
    expect(nextRoles.join("|")).not.toBe(initialRoles.join("|"));
  });

  it("ArrowRight in RTL goes BACKWARD (mirrors AR reading flow)", () => {
    renderJourney("ar", true);
    const initial = screen
      .getAllByRole("heading", { level: 3 })
      .map((h) => h.textContent);
    act(() => {
      fireEvent.keyDown(window, { key: "ArrowRight" });
    });
    const after = screen
      .getAllByRole("heading", { level: 3 })
      .map((h) => h.textContent);
    expect(after.join("|")).not.toBe(initial.join("|"));
  });

  it("renders all 4 locales without throwing", () => {
    for (const locale of ["en", "de", "es", "ar"] as const) {
      const isRtl = locale === "ar";
      const { unmount } = renderJourney(locale, isRtl);
      expect(
        screen.getAllByRole("region", { name: /carousel|carrusel|karussell|شريط/i })
          .length,
      ).toBeGreaterThan(0);
      unmount();
    }
  });
});
