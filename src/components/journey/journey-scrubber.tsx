"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { JourneyEntry } from "@/content/journey";
import { JourneyNode, type JourneyNodeState } from "./journey-node";

/**
 * JourneyScrubber — labelled timeline scrubber laid out as a single CSS
 * Grid. The grid does ALL position math; React passes only logical
 * indices. RTL mirroring is handled natively by `dir={direction}` on
 * the grid container — there are NO `isRtl` branches in the layout
 * (the only RTL conditional left is the linear-gradient angle on the
 * fill, which is a paint detail, not a position).
 *
 * Architecture (v3.3):
 *
 *   ┌──────────────────────────────────────────────────┐  outer grid
 *   │ display: grid                                    │  dir={dir}
 *   │ grid-template-columns: repeat(N, 1fr)            │
 *   │ ┌──────┬──────┬──────┬──────┬──────┬──────┐ row 1: labels
 *   │ │ 2014 │ 2016 │ 2022 │ 2024 │ 2024 │ 2025 │ each in its own cell
 *   │ ├──────┴──────┴──────┴──────┴──────┴──────┤ row 2: track strip
 *   │ │  ────●────────●────────●─────────────── │ col-span-full
 *   │ └──────────────────────────────────────────┘
 *   └──────────────────────────────────────────────────┘
 *
 * Why grid, not absolute pixel math (v3.3 lesson):
 *   - Labels and dots share ONE column template, so they cannot drift
 *     relative to each other. v3.0–3.2 ran two parallel pixel formulas
 *     (`labelX = i/(count-1) * 320` and `dotX = i/(count-1) * 320`),
 *     which looked identical but rounded differently at sub-pixel and
 *     produced visible misalignment in narrow viewports.
 *   - `dir="rtl"` on a grid container natively flips column 1 to the
 *     physical right edge and column N to the physical left. The
 *     browser does the mirror; we never write `isRtl ? a : b` for
 *     layout. Verified against MDN's Grid + writing-modes guide.
 *   - The container is fluid (`w-full max-w-[360px]`), so labels never
 *     clip on narrow mobile viewports. v3.0–3.2 had a hard 320 px
 *     width that overflowed labels past the container edges and got
 *     clipped against the screen edge in AR mobile (the "014" cropped
 *     leading "2" symptom).
 *
 * Track + fill + thumb use logical inset-inline-* properties so they
 * mirror automatically under `dir="rtl"`. The visible track is inset
 * by exactly half a column on each side (`50% / N`) so it spans the
 * first dot's centre to the last dot's centre — never overshooting.
 *
 *   Fill width   = active × 100% / N
 *   Fill start   = 50% / N
 *
 *   At active=0       → width 0       (no visible fill)
 *   At active=k       → fill ends at column (k+1)'s centre, which is
 *                        dot[k]'s position. By construction, exact.
 *   At active=count-1 → fill ends at the final dot's centre.
 *
 * Thumb (non-`showDots`):
 *
 *   inset-inline-start = (2·active + 1) × 50% / N
 *
 *   This is column (active+1)'s centre as a percentage. Animates
 *   smoothly as `active` changes via a CSS transition gated by
 *   `reducedMotion`.
 *
 * Step-strip click semantics (the ONE place that reads physical
 * coords): the transparent overlay maps the click's physical x to
 * logical (xLogical = rect.width − xPhysical when RTL), then compares
 * against the active fraction `(active + 0.5) / count`. Click before
 * → goPrev; click after → goNext. No layout side-effects.
 */

interface JourneyScrubberProps {
  entries: JourneyEntry[];
  active: number;
  /** Step-wise nav handlers from the parent carousel. */
  goPrev: () => void;
  goNext: () => void;
  /** Direct-jump (year labels and `showDots` dots). */
  setActive: (i: number) => void;
  /** Reading direction. Drives the entire mirror via `dir={direction}`. */
  direction?: "ltr" | "rtl";
  reducedMotion?: boolean;
  /**
   * When `true`, render a `<JourneyNode>` per entry (mobile parity
   * with the desktop curved-path timeline) and suppress the 8 px
   * thumb. Each dot is a direct-jump button; the underlying click
   * strip still owns step-wise clicks between dots via
   * `pointer-events-none` on the dot overlay container.
   */
  showDots?: boolean;
}

export function JourneyScrubber({
  entries,
  active,
  goPrev,
  goNext,
  setActive,
  direction = "ltr",
  reducedMotion = false,
  showDots = false,
}: JourneyScrubberProps) {
  const t = useTranslations("about.journey.aria");
  const count = entries.length;
  const isRtl = direction === "rtl";

  // Active dot's centre as a fraction of the track width (0–1).
  // Used by the step-strip click handler. Direction-agnostic.
  const activeFraction = count <= 1 ? 0 : (active + 0.5) / count;

  // Step-wise click handler. Reads physical click coords on the strip
  // and maps them to logical (inline-start-relative) coords for the
  // direction-aware before/after-thumb test. The ONLY direction-aware
  // code path in the file — and it's geometry, not layout.
  const handleStripClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const xFromStart = e.clientX - rect.left;
    const xLogical = isRtl ? rect.width - xFromStart : xFromStart;
    const beforeThumb = xLogical < activeFraction * rect.width;
    if (beforeThumb) goPrev();
    else goNext();
  };

  // Pre-compute the calc() strings so they appear ONCE in the render
  // (and the unit tests can match them exactly).
  const halfCellInset = `calc(50% / ${count})`;
  const fillWidth = `calc(${active} * 100% / ${count})`;
  const thumbInlineStart = `calc(${active * 2 + 1} * 50% / ${count})`;

  return (
    <div
      role="group"
      aria-label={t("carousel")}
      dir={direction}
      className="grid w-full mx-auto select-none"
      style={{
        maxWidth: 360,
        gridTemplateColumns: `repeat(${count}, 1fr)`,
        rowGap: showDots ? 32 : 10,
      }}
    >
      {/* Row 1 — year labels. Each label is auto-flowed into its own
          column (no `gridColumn` prop needed). `text-center` centres
          the label inside its cell. Cell width is 1fr (≈ 60 px on a
          360 px container) — comfortably wider than any 4-digit year
          string, so labels never overflow or clip. */}
      {entries.map((e, i) => {
        const isActive = i === active;
        return (
          <button
            key={e.id}
            type="button"
            onClick={() => setActive(i)}
            aria-current={isActive ? "true" : undefined}
            aria-label={`${e.year} — ${e.role}`}
            className={cn(
              "bg-transparent border-0 p-0 cursor-pointer text-center",
              "font-heading text-[9px] tracking-[0.18em] uppercase",
              "transition-colors duration-300 motion-reduce:transition-none",
              "focus-visible:outline-none focus-visible:text-[var(--accent-warm-fg)]",
              isActive
                ? "text-[var(--accent-warm-fg)]"
                : "text-foreground/55 hover:text-foreground/80",
            )}
          >
            {e.year}
          </button>
        );
      })}

      {/* Row 2 — track strip. col-span-full stretches across all N
          columns of the outer grid. Inside, the track + fill + thumb
          use absolute positioning with logical inline-start/-end
          properties so they auto-mirror under `dir="rtl"`. The dot
          overlay (when `showDots`) uses its own `repeat(N, 1fr)` grid
          at full width — by construction, identical column centres
          to the outer grid above, so dots align with their labels. */}
      <div className="relative col-span-full h-2">
        {/* Base track: faint line spanning first-dot to last-dot. */}
        <div
          aria-hidden="true"
          className="absolute top-1/2 h-px -translate-y-1/2 rounded-[1px] bg-foreground/20"
          style={{
            insetInlineStart: halfCellInset,
            insetInlineEnd: halfCellInset,
          }}
        />

        {/* Fill: from first-dot centre to active-dot centre. */}
        <div
          aria-hidden="true"
          className={cn(
            "absolute top-1/2 h-px -translate-y-1/2 rounded-[1px]",
            reducedMotion
              ? "transition-none"
              : "transition-[width] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]",
          )}
          style={{
            insetInlineStart: halfCellInset,
            width: fillWidth,
            // The ONLY isRtl conditional in the file — gradient angle.
            // Layout is direction-agnostic; this is paint-only.
            background: isRtl
              ? "linear-gradient(270deg, color-mix(in oklch, var(--accent-warm-fg) 60%, transparent), var(--accent-warm-fg))"
              : "linear-gradient(90deg, color-mix(in oklch, var(--accent-warm-fg) 60%, transparent), var(--accent-warm-fg))",
          }}
        />

        {/* Thumb (non-showDots): 8 px glowing amber circle at the
            active dot's centre. Slides smoothly via transition on
            inset-inline-start. */}
        {!showDots && (
          <div
            aria-hidden="true"
            data-testid="scrubber-thumb"
            className={cn(
              "absolute top-1/2 rounded-full bg-[var(--accent-warm-fg)]",
              reducedMotion
                ? "transition-none"
                : "transition-[inset-inline-start] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]",
            )}
            style={{
              insetInlineStart: thumbInlineStart,
              width: 8,
              height: 8,
              transform: "translate(-50%, -50%)",
              boxShadow: "0 0 10px var(--accent-warm-fg)",
            }}
          />
        )}

        {/* Step-wise click strip — full inline width, 32 px tall hit
            area centred on the 2 px track. Behind the dot buttons in
            DOM order so per-dot clicks (when `showDots`) win the hit
            test on their footprint, while clicks between dots fall
            through to this strip. */}
        <button
          type="button"
          onClick={handleStripClick}
          aria-label={t("carousel")}
          className="absolute -inset-y-3 inset-x-0 bg-transparent border-0 p-0 cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent-warm-fg)] rounded-sm"
        />

        {/* Dot overlay (showDots only). A nested grid with the SAME
            `repeat(N, 1fr)` template as the outer grid, so each dot
            sits at the same column centre as its label above —
            structural alignment, not pixel math.
            `pointer-events-none` on the wrapper lets clicks between
            dots fall through to the click strip below; the dot
            buttons themselves opt back into pointer events. */}
        {showDots && (
          <div
            data-testid="scrubber-dot-overlay"
            className="absolute inset-x-0 top-1/2 -translate-y-1/2 grid place-items-center pointer-events-none"
            style={{ gridTemplateColumns: `repeat(${count}, 1fr)` }}
          >
            {entries.map((e, i) => {
              const dist = Math.abs(i - active);
              const state: JourneyNodeState =
                dist === 0 ? "active" : dist === 1 ? "adjacent" : "inactive";
              const isActive = i === active;
              return (
                <button
                  key={`dot-${e.id}`}
                  type="button"
                  onClick={() => setActive(i)}
                  aria-label={`${e.year} — ${e.role}, ${e.org}`}
                  aria-current={isActive ? "true" : undefined}
                  className="bg-transparent border-0 p-0 cursor-pointer pointer-events-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-warm-fg)] rounded-full"
                  style={{ gridColumn: i + 1 }}
                >
                  <JourneyNode state={state} />
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
