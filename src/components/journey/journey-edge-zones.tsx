"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

/**
 * JourneyEdgeZones — visual-only edge labels on the carousel viewport.
 *
 * Pivot v3 split: this component is now PURE PRESENTATIONAL. The parent
 * (`DesktopCarousel` in `compact-journey.tsx`) owns:
 *   - the click handler (viewport-wide step-wise navigation)
 *   - the mousemove handler (drives `hoverLeft` / `hoverRight` from
 *     cursor X relative to viewport center, so the labels appear when
 *     the cursor is anywhere past the active node, not only when it
 *     enters the 80 px strip)
 *   - the cursor (`w-resize` / `e-resize` / `not-allowed`) on the viewport
 *
 * What this component still owns:
 *   - the 80 px-wide visual anchor strips at the physical left + right
 *     edges where the gradient blooms in and the vertical PREV / NEXT
 *     label reads
 *   - the locale-aware label text via `about.journey.aria.{previous,next}`
 *
 * RTL: pass `direction="rtl"` so the labels swap (visual left edge in
 * RTL semantically means "next" because the chronology mirrors). The
 * vertical text rotation flips so the label always reads top-to-bottom
 * along the inline-start side and bottom-to-top along the inline-end.
 *
 * Pointer events are set to `none` so this overlay never intercepts
 * clicks meant for the parent viewport's onClick handler.
 */

interface JourneyEdgeZonesProps {
  /** Whether the cursor is anywhere left of viewport center. */
  hoverLeft: boolean;
  /** Whether the cursor is anywhere right of viewport center. */
  hoverRight: boolean;
  /** True at carousel index 0 — left zone (LTR) suppresses gradient + label. */
  atStart: boolean;
  /** True at carousel index N-1 — right zone (LTR) suppresses gradient + label. */
  atEnd: boolean;
  /** Reading direction. RTL flips which side maps to PREV vs NEXT semantically. */
  direction?: "ltr" | "rtl";
  /** Reduced-motion fallback: removes the hover gradient transition. */
  reducedMotion?: boolean;
}

const ZONE_WIDTH_PX = 80;

export function JourneyEdgeZones({
  hoverLeft,
  hoverRight,
  atStart,
  atEnd,
  direction = "ltr",
  reducedMotion = false,
}: JourneyEdgeZonesProps) {
  const t = useTranslations("about.journey.aria");
  const isRtl = direction === "rtl";

  // In RTL the chronology mirrors: visual LEFT edge = older = NEXT (forward
  // in time means moving inline-start in RTL); visual RIGHT edge = newer = PREV.
  // In LTR, visual LEFT = PREV, visual RIGHT = NEXT.
  const leftLabel = isRtl ? t("next") : t("previous");
  const rightLabel = isRtl ? t("previous") : t("next");
  // The boundary that suppresses each side:
  //   - LTR: left disabled at start, right disabled at end
  //   - RTL: left disabled at end (since left = NEXT in RTL), right at start
  const leftDisabled = isRtl ? atEnd : atStart;
  const rightDisabled = isRtl ? atStart : atEnd;

  return (
    <>
      {/* LEFT visual zone */}
      <div
        aria-hidden="true"
        className={cn(
          "absolute inset-y-0 left-0 z-30 flex items-center justify-start ps-5",
          "pointer-events-none",
          "transition-[background] duration-300",
          reducedMotion && "transition-none",
        )}
        style={{
          width: ZONE_WIDTH_PX,
          background:
            hoverLeft && !leftDisabled
              ? "linear-gradient(90deg, color-mix(in oklch, var(--accent-warm-fg) 22%, transparent), transparent)"
              : "transparent",
        }}
      >
        {hoverLeft && !leftDisabled && (
          <span
            className="font-heading text-[10px] tracking-[0.3em] uppercase text-[var(--accent-warm-fg)]"
            style={{
              writingMode: "vertical-rl",
              transform: "rotate(180deg)",
              opacity: 0.9,
            }}
          >
            {leftLabel}
          </span>
        )}
      </div>

      {/* RIGHT visual zone */}
      <div
        aria-hidden="true"
        className={cn(
          "absolute inset-y-0 right-0 z-30 flex items-center justify-end pe-5",
          "pointer-events-none",
          "transition-[background] duration-300",
          reducedMotion && "transition-none",
        )}
        style={{
          width: ZONE_WIDTH_PX,
          background:
            hoverRight && !rightDisabled
              ? "linear-gradient(270deg, color-mix(in oklch, var(--accent-warm-fg) 22%, transparent), transparent)"
              : "transparent",
        }}
      >
        {hoverRight && !rightDisabled && (
          <span
            className="font-heading text-[10px] tracking-[0.3em] uppercase text-[var(--accent-warm-fg)]"
            style={{
              writingMode: "vertical-rl",
              opacity: 0.9,
            }}
          >
            {rightLabel}
          </span>
        )}
      </div>
    </>
  );
}
