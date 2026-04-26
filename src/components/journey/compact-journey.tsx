"use client";

import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import { TransitionLink } from "@/components/shared/transition-link";
import { useHorizontalCarousel } from "@/hooks/use-horizontal-carousel";
import {
  getDefaultActiveIndex,
  journeyEntries,
  type JourneyEntry,
  type JourneyLocale,
} from "@/content/journey";
import { cn } from "@/lib/utils";
import { JourneyCard, type JourneyCardState } from "./journey-card";
import { JourneyCurvedPath, journeyNodeYOffset } from "./journey-curved-path";
import { JourneyEdgeZones } from "./journey-edge-zones";
import { JourneyMobile } from "./journey-mobile";
import { JourneyNode, type JourneyNodeState } from "./journey-node";
import { JourneyScrubber } from "./journey-scrubber";

/**
 * CompactJourney — cinematic horizontal carousel for the homepage About
 * section. Replaces the long-form vertical timeline when
 * `features.compactTimeline` is on.
 *
 * Layout (desktop, ≥ md):
 *   - Full-bleed viewport that escapes the parent `mx-auto max-w-4xl` so
 *     `translateX(50vw - activeX)` actually centers the active node under
 *     the viewport center.
 *   - Curved dashed sine path threading through every node.
 *   - Dot nodes (`<JourneyNode />`) at xPhysical(i) on the rail. Cards
 *     alternate above/below the rail.
 *   - Pure-visual edge zones rendered as 80 px-wide strips at the inline
 *     edges, displaying a soft gradient + vertical PREV/NEXT label when
 *     the cursor is anywhere past the active node.
 *   - Step-wise click anywhere on the viewport advances by one step
 *     (prev/next) based on which side of viewport-center the click lands.
 *   - Scrubber at the bottom, in normal flow under the viewport so the
 *     viewport's measured height fully contains the active card.
 *
 * Pivot v3 highlights vs v2:
 *   1. Stable viewport height — measured from a hidden ghost layer of
 *      every entry rendered in active state, so a 4-line Arabic tagline
 *      gets the same vertical breathing room as a 1-line English one,
 *      and the scrubber never overlaps the card text.
 *   2. Connector gradient flipped: amber sits at the dot, fading to
 *      transparent toward the card text (was the inverse).
 *   3. Foreground accent uses `--accent-warm-fg` instead of `--gallery-warm`
 *      so light-mode contrast is WCAG AA. The gallery glow token is
 *      reserved for the lamp / soft tints.
 *   4. Click-anywhere step-wise nav at the viewport level, with
 *      `overscroll-behavior-x: contain` on `<body>` (in `globals.css`)
 *      to suppress macOS history-swipe gesture.
 *   5. Hover anywhere past the active node (left or right of viewport
 *      center) reveals the corresponding edge label, not just hover on
 *      the 80 px strip.
 *   6. True RTL mirror: chronology flips so newest sits on the physical
 *      right; track translate sign reverses; scrubber thumb anchors
 *      to inline-start (physical right in RTL) and slides toward the
 *      left as `active` grows.
 *   7. Initial state always lands on the entry flagged `active: true`
 *      via `getDefaultActiveIndex()` (with a year-fallback for safety).
 *
 * Reduced motion: collapses to a static spread (active card + step row
 * + scrubber). Transform/transitions are gated by Tailwind's
 * `motion-reduce:` modifier; the carousel hook also respects the system
 * preference.
 */

// ---------------------------------------------------------------------------
// Layout primitives — used both for live layout and for measurement.
// ---------------------------------------------------------------------------

/** Horizontal distance between adjacent nodes, px. */
const STEP = 320;
/** Horizontal padding before the first / after the last node, px. */
const CENTER_OFFSET = 360;
/** Sine-wave amplitude for the rail's organic curve, px. */
const SINE_AMPLITUDE = 22;
/** Vertical distance from the rail to the card's nearest edge, px. */
const CARD_OFFSET_FROM_RAIL = 110;
/**
 * Lower bound on rail center Y. The `useCardMeasurement` hook may push
 * this larger if the tallest above-card needs more room above the rail.
 */
const MIN_RAIL_CENTER_Y = 290;
/**
 * Lower bound on track height. The hook may push this larger if the
 * tallest below-card needs more room below the rail.
 */
const MIN_TRACK_HEIGHT = 540;
/** Card width in px (matches max-w-[340px] on `<JourneyCard>`). */
const CARD_WIDTH = 340;
/** Padding above the tallest above-card (top of viewport). */
const ABOVE_GUTTER = 16;
/** Padding below the tallest below-card (above the scrubber). */
const BELOW_GUTTER = 20;

// ---------------------------------------------------------------------------
// Public component
// ---------------------------------------------------------------------------

interface CompactJourneyProps {
  locale: JourneyLocale;
  /** RTL locale flag from the page (e.g. `locale === "ar"`). */
  isRtl: boolean;
}

export function CompactJourney({ locale, isRtl }: CompactJourneyProps) {
  const t = useTranslations("about.journey");
  const tBtn = useTranslations("common.buttons");
  const prefersReducedMotion = useReducedMotion() ?? false;

  // Newest-first feels most editorial on a portfolio (most recent role at
  // the start in LTR, at the visual right in RTL after mirroring).
  const orderedEntries = [...journeyEntries].reverse();
  const count = orderedEntries.length;
  const trackWidth = (count - 1) * STEP + 2 * CENTER_OFFSET;

  const initialIndex = getDefaultActiveIndex(orderedEntries);

  const { active, setActive, goNext, goPrev, atStart, atEnd, trackRef } =
    useHorizontalCarousel({
      count,
      initialIndex,
      direction: isRtl ? "rtl" : "ltr",
      reducedMotion: prefersReducedMotion,
    });

  return (
    <>
      {/* Mobile: vertical stack with the same scrubber as desktop. */}
      <div className="md:hidden">
        <JourneyMobile
          entries={orderedEntries}
          locale={locale}
          active={active}
          setActive={setActive}
          isRtl={isRtl}
        />
      </div>

      {/* Desktop: horizontal cinematic carousel. */}
      <div className="hidden md:block">
        <DesktopCarousel
          entries={orderedEntries}
          locale={locale}
          isRtl={isRtl}
          active={active}
          setActive={setActive}
          goNext={goNext}
          goPrev={goPrev}
          atStart={atStart}
          atEnd={atEnd}
          trackRef={trackRef as React.RefObject<HTMLDivElement>}
          trackWidth={trackWidth}
          viewFullCvLabel={t("viewFullCv")}
          viewCVAriaLabel={tBtn("viewCV")}
          reducedMotion={prefersReducedMotion}
        />
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Card-height measurement hook — drives the stable viewport dimensions.
// ---------------------------------------------------------------------------

/**
 * Measures the rendered height of every entry's active-state card and
 * returns the maximum (so the viewport can be sized once and never need
 * to grow as the user navigates). Uses a hidden off-screen ghost layer
 * so the live carousel doesn't paint flicker.
 *
 * The caller registers each ghost element via the returned `register`
 * callback, then renders that element with the JourneyCard active state
 * at the same `width: CARD_WIDTH` it uses live. A `ResizeObserver`
 * re-measures on font/layout changes; a manual measurement also fires
 * on mount and locale change to handle SSR → client hand-off.
 */
function useCardMeasurement(
  entries: JourneyEntry[],
  locale: JourneyLocale,
): {
  maxHeight: number | null;
  register: (id: string, el: HTMLDivElement | null) => void;
} {
  const refs = useRef<Map<string, HTMLDivElement>>(new Map());
  const [maxHeight, setMaxHeight] = useState<number | null>(null);

  const register = useCallback((id: string, el: HTMLDivElement | null) => {
    if (el) refs.current.set(id, el);
    else refs.current.delete(id);
  }, []);

  useLayoutEffect(() => {
    const measure = () => {
      const heights = Array.from(refs.current.values()).map(
        (el) => el.getBoundingClientRect().height,
      );
      if (heights.length === 0) return;
      const next = Math.max(...heights);
      setMaxHeight((prev) => (prev !== next ? next : prev));
    };

    // Initial sync measurement.
    measure();

    // Live re-measure on font load / viewport resize / locale-driven
    // tagline length changes.
    const observer = new ResizeObserver(measure);
    refs.current.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
    // entries identity is stable per locale because journeyEntries is
    // const and we only call .reverse() once at module load. Locale
    // changes the resolved tagline strings → re-run.
  }, [entries, locale]);

  return { maxHeight, register };
}

// ---------------------------------------------------------------------------
// Desktop carousel
// ---------------------------------------------------------------------------

interface DesktopCarouselProps {
  entries: JourneyEntry[];
  locale: JourneyLocale;
  isRtl: boolean;
  active: number;
  setActive: (i: number) => void;
  goNext: () => void;
  goPrev: () => void;
  atStart: boolean;
  atEnd: boolean;
  trackRef: React.RefObject<HTMLDivElement>;
  trackWidth: number;
  viewFullCvLabel: string;
  viewCVAriaLabel: string;
  reducedMotion: boolean;
}

function DesktopCarousel({
  entries,
  locale,
  isRtl,
  active,
  setActive,
  goNext,
  goPrev,
  atStart,
  atEnd,
  trackRef,
  trackWidth,
  viewFullCvLabel,
  viewCVAriaLabel,
  reducedMotion,
}: DesktopCarouselProps) {
  const count = entries.length;

  // ---- Card height measurement → stable viewport dims ---------------------
  const { maxHeight, register } = useCardMeasurement(entries, locale);
  const cardH = maxHeight ?? 200; // Fallback used pre-measurement.
  // Rail center Y must leave room above for the tallest card + offset.
  const railCenterY = Math.max(
    MIN_RAIL_CENTER_Y,
    Math.ceil(CARD_OFFSET_FROM_RAIL + cardH + ABOVE_GUTTER),
  );
  // Total track height must additionally fit the tallest below-card.
  const trackHeight = Math.max(
    MIN_TRACK_HEIGHT,
    Math.ceil(railCenterY + CARD_OFFSET_FROM_RAIL + cardH + BELOW_GUTTER),
  );

  // ---- Hover state for edge labels ----------------------------------------
  // Driven by viewport-level mousemove so labels appear when the cursor
  // is anywhere past the active node, not just inside the 80 px strip.
  const [hoverLeft, setHoverLeft] = useState(false);
  const [hoverRight, setHoverRight] = useState(false);

  // ---- Logical X (independent of direction) -------------------------------
  // entry 0 → CENTER_OFFSET; entry N-1 → trackWidth - CENTER_OFFSET.
  const xLocal = (i: number): number => CENTER_OFFSET + i * STEP;
  // Physical X within the track-internal coordinate space.
  // RTL mirrors so the newest entry (i=0) sits at the physical right edge.
  const xPhysical = (i: number): number =>
    isRtl ? trackWidth - xLocal(i) : xLocal(i);

  // ---- Track translation --------------------------------------------------
  // LTR: track origin is the wrapper's left edge (block-flow inline-start).
  //      Active node at xLocal(active) → translate +(50vw − xLocal).
  // RTL: track origin is wrapper_right − trackWidth (block-flow inline-start
  //      = physical right). Active node at viewport_x = 100vw − xLocal(active)
  //      → translate +(xLocal − 50vw).
  const trackTransform = isRtl
    ? `translateX(calc(${xLocal(active)}px - 50vw))`
    : `translateX(calc(50vw - ${xLocal(active)}px))`;

  // ---- Reduced-motion fallback --------------------------------------------
  if (reducedMotion) {
    return (
      <ReducedMotionLayout
        entries={entries}
        locale={locale}
        active={active}
        setActive={setActive}
        goNext={goNext}
        goPrev={goPrev}
        isRtl={isRtl}
        viewFullCvLabel={viewFullCvLabel}
        viewCVAriaLabel={viewCVAriaLabel}
      />
    );
  }

  // ---- Viewport-level click + hover ---------------------------------------
  // Click anywhere on the viewport → step-wise navigation. Direction-aware:
  // in LTR the visual left half maps to "earlier" (goPrev), in RTL it maps
  // to "older = goNext" because the carousel mirrors.
  const handleViewportClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Future-proof escape hatch: if a click landed on a real interactive
    // descendant (none today, but TransitionLinks might be added later),
    // let it own the click.
    if ((e.target as HTMLElement).closest("button[data-journey-stop]")) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const isLeftHalf = e.clientX - rect.left < rect.width / 2;
    // "wantsForward" = "the user wants to advance to the NEXT chronological entry"
    const wantsForward = isRtl ? isLeftHalf : !isLeftHalf;
    if (wantsForward && !atEnd) goNext();
    if (!wantsForward && !atStart) goPrev();
  };

  const handleViewportMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const isLeftHalf = e.clientX - rect.left < rect.width / 2;
    setHoverLeft(isLeftHalf);
    setHoverRight(!isLeftHalf);
  };

  const handleViewportMouseLeave = () => {
    setHoverLeft(false);
    setHoverRight(false);
  };

  // Cursor reflects the action the next click would take.
  let cursor = "default";
  if (hoverLeft) {
    const leftDisabled = isRtl ? atEnd : atStart;
    cursor = leftDisabled ? "default" : "w-resize";
  } else if (hoverRight) {
    const rightDisabled = isRtl ? atStart : atEnd;
    cursor = rightDisabled ? "default" : "e-resize";
  }

  return (
    <div className="relative">
      {/* Hidden measurement layer — paints once, off-screen. Each ghost
          card is rendered in the active state at CARD_WIDTH so its
          measured height matches what the live carousel will need. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute opacity-0"
        style={{ top: -99999, left: -99999, width: CARD_WIDTH }}
      >
        {entries.map((entry) => (
          <div
            key={`measure-${entry.id}`}
            ref={(el) => register(entry.id, el)}
            style={{ width: CARD_WIDTH }}
          >
            <JourneyCard
              entry={entry}
              state="active"
              locale={locale}
              above
            />
          </div>
        ))}
      </div>

      {/*
       * Full-bleed viewport — escapes the parent `max-w-4xl` so
       * `translateX(50vw − xLocal(active))` lands the active node at
       * viewport-center regardless of parent constraints.
       */}
      <div
        ref={trackRef}
        dir={isRtl ? "rtl" : "ltr"}
        onClick={handleViewportClick}
        onMouseMove={handleViewportMouseMove}
        onMouseLeave={handleViewportMouseLeave}
        className="relative w-screen overflow-hidden"
        style={
          {
            height: trackHeight,
            insetInlineStart: "calc(50% - 50vw)",
            position: "relative",
            cursor,
            // Allow vertical page scroll, suppress horizontal gestures
            // from being interpreted as browser navigation.
            touchAction: "pan-y pinch-zoom",
          } as CSSProperties
        }
        role="region"
        aria-roledescription="carousel"
        tabIndex={0}
      >
        {/* Pure-visual edge label overlay — gradient + vertical PREV/NEXT. */}
        <JourneyEdgeZones
          hoverLeft={hoverLeft}
          hoverRight={hoverRight}
          atStart={atStart}
          atEnd={atEnd}
          direction={isRtl ? "rtl" : "ltr"}
          reducedMotion={reducedMotion}
        />

        <div
          className="relative h-full transition-transform duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none"
          style={{
            width: trackWidth,
            transform: trackTransform,
          }}
        >
          {/* Curved dashed path threading every node. */}
          <JourneyCurvedPath
            count={count}
            step={STEP}
            startX={CENTER_OFFSET}
            centerY={railCenterY}
            amplitude={SINE_AMPLITUDE}
            trackWidth={trackWidth}
            height={trackHeight}
            rtl={isRtl}
          />

          {/* Entries — node + connector + card per entry. */}
          {entries.map((entry, i) => {
            const x = xPhysical(i);
            // Sine offset uses logical index so the wave shape matches
            // the path drawn above.
            const y = railCenterY + journeyNodeYOffset(i, SINE_AMPLITUDE);
            const dist = Math.abs(i - active);
            const cardState: JourneyCardState =
              dist === 0 ? "active" : dist === 1 ? "adjacent" : "inactive";
            const nodeState: JourneyNodeState = cardState;
            // Cards alternate above/below the rail by logical index so the
            // pattern is identical in both directions.
            const above = i % 2 === 0;

            return (
              <div
                key={entry.id}
                className="absolute"
                style={{
                  left: x,
                  top: y,
                  transform: "translate(-50%, -50%)",
                }}
              >
                {/*
                 * Vertical connector line from node to card.
                 * Gradient direction puts the SOLID amber end at the node
                 * and fades to transparent toward the card text — the
                 * opposite of v2's orientation. The connector renders for
                 * active + adjacent only.
                 *
                 * - `above=true`  → connector grows UPWARD from the node
                 *                   (bottom edge anchored at the node, top
                 *                   edge near the card text). Use
                 *                   `bg-gradient-to-t from-…` so amber
                 *                   sits at the bottom (near node) and
                 *                   fades upward (toward text).
                 * - `above=false` → connector grows DOWNWARD from the node.
                 *                   Use `bg-gradient-to-b from-…` so amber
                 *                   sits at the top (near node) and fades
                 *                   downward (toward text).
                 */}
                {cardState !== "inactive" && (
                  <div
                    aria-hidden="true"
                    className={cn(
                      "absolute left-1/2 -translate-x-1/2 w-px",
                      cardState === "active"
                        ? above
                          ? "bg-gradient-to-t from-[var(--accent-warm-fg)] to-transparent"
                          : "bg-gradient-to-b from-[var(--accent-warm-fg)] to-transparent"
                        : above
                          ? "bg-gradient-to-t from-foreground/50 to-transparent"
                          : "bg-gradient-to-b from-foreground/50 to-transparent",
                    )}
                    style={{
                      [above ? "bottom" : "top"]: "100%",
                      height: 100,
                    }}
                  />
                )}

                {/*
                 * Node — non-interactive in v3 (per "all clicks step-wise"
                 * decision). Clicks on the dot bubble up to the viewport
                 * handler which decides prev/next based on click side.
                 * Keyboard nav is handled by the carousel region's ←/→
                 * keys via `useHorizontalCarousel`.
                 */}
                <div className="relative z-[2] pointer-events-none">
                  <JourneyNode state={nodeState} />
                </div>

                {/* Card — absolutely positioned so it doesn't push layout. */}
                <div
                  className="absolute left-1/2 -translate-x-1/2"
                  style={{
                    width: CARD_WIDTH,
                    [above ? "bottom" : "top"]: CARD_OFFSET_FROM_RAIL,
                  }}
                >
                  <JourneyCard
                    entry={entry}
                    state={cardState}
                    locale={locale}
                    above={above}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom controls: scrubber + résumé link. */}
      <div className="relative flex flex-col items-center gap-3 mt-4">
        <JourneyScrubber
          entries={entries}
          active={active}
          goPrev={goPrev}
          goNext={goNext}
          setActive={setActive}
          direction={isRtl ? "rtl" : "ltr"}
          reducedMotion={reducedMotion}
        />
        <TransitionLink
          href="/cv"
          className="group inline-flex items-baseline gap-1.5 text-xs font-heading uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors"
          aria-label={viewCVAriaLabel}
        >
          <span className="border-b border-foreground/40 group-hover:border-[var(--accent-warm-fg)] transition-colors pb-0.5">
            {viewFullCvLabel}
          </span>
          <span
            aria-hidden="true"
            className="rtl:rotate-180 transition-transform group-hover:translate-x-0.5 motion-reduce:group-hover:translate-x-0"
          >
            →
          </span>
        </TransitionLink>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Reduced-motion layout
// ---------------------------------------------------------------------------

interface ReducedMotionLayoutProps {
  entries: JourneyEntry[];
  locale: JourneyLocale;
  active: number;
  setActive: (i: number) => void;
  goPrev: () => void;
  goNext: () => void;
  isRtl: boolean;
  viewFullCvLabel: string;
  viewCVAriaLabel: string;
}

/**
 * Reduced-motion fallback for desktop.
 *
 * Renders a static editorial spread: the active card alone, full-fidelity,
 * with the scrubber and a clickable year row for stepping. No transforms,
 * no transitions — meets the WCAG `prefers-reduced-motion` contract.
 */
function ReducedMotionLayout({
  entries,
  locale,
  active,
  setActive,
  goPrev,
  goNext,
  isRtl,
  viewFullCvLabel,
  viewCVAriaLabel,
}: ReducedMotionLayoutProps) {
  const entry = entries[active];

  return (
    <div className="relative w-full">
      <div className="flex flex-col items-center gap-6">
        {/* Active card centered, full fidelity. */}
        <JourneyCard entry={entry} state="active" locale={locale} above />

        {/* Compact year row showing all entries — clickable, direct-jump
            (acceptable here because the layout is static; no risk of
            disorientation from a sudden carousel slide). */}
        <div
          className={cn(
            "flex items-center gap-3 mt-4 flex-wrap justify-center",
            isRtl && "flex-row-reverse",
          )}
        >
          {entries.map((e, i) => {
            const isActive = i === active;
            return (
              <button
                key={e.id}
                type="button"
                onClick={() => setActive(i)}
                className={cn(
                  "px-3 py-1 text-xs font-heading uppercase tracking-[0.15em] border rounded-sm transition-colors",
                  isActive
                    ? "border-[var(--accent-warm-fg)] text-[var(--accent-warm-fg)]"
                    : "border-foreground/25 text-muted-foreground hover:text-foreground",
                )}
                aria-current={isActive ? "true" : undefined}
              >
                {e.year}
              </button>
            );
          })}
        </div>

        <JourneyScrubber
          entries={entries}
          active={active}
          goPrev={goPrev}
          goNext={goNext}
          setActive={setActive}
          direction={isRtl ? "rtl" : "ltr"}
          reducedMotion
        />

        <TransitionLink
          href="/cv"
          className="group inline-flex items-baseline gap-1.5 text-xs font-heading uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors"
          aria-label={viewCVAriaLabel}
        >
          <span className="border-b border-foreground/40 group-hover:border-[var(--accent-warm-fg)] transition-colors pb-0.5">
            {viewFullCvLabel}
          </span>
          <span aria-hidden="true" className="rtl:rotate-180">
            →
          </span>
        </TransitionLink>
      </div>
    </div>
  );
}

// Suppress the unused import warning for the SSR fallback path that
