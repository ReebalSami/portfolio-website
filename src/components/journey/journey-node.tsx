"use client";

import { cn } from "@/lib/utils";

/**
 * Journey milestone node — a small amber dot that sits on the rail.
 *
 * Three states control size, glow, and opacity:
 *   - `active`   → 10 px filled circle + 36 px pulsing ring + amber glow
 *   - `adjacent` → 6 px filled circle, opacity 0.75 (immediate neighbours)
 *   - `inactive` → 6 px filled circle, opacity 0.5  (everyone else)
 *
 * Uses `--accent-warm-fg` as the fill — a foreground-readable warm
 * accent calibrated for ~4.7:1 WCAG contrast on the light page background
 * (`--gallery-warm` itself is reserved for the lamp / soft glow tints,
 * which would render as pale peach on white). Both tokens share the same
 * hue family so brand unity is preserved across modes.
 *
 * The pulsing ring is rendered via Tailwind's `animate-pulse`; in
 * `prefers-reduced-motion: reduce` the `motion-reduce:animate-none`
 * modifier disables the pulse so users with vestibular sensitivity get a
 * static ring instead.
 *
 * Sizing matches Claude's reference `dot` style in
 * `docs/design/timeline-redesign-homepage/components/TimelineShared.jsx`.
 */

export type JourneyNodeState = "active" | "adjacent" | "inactive";

interface JourneyNodeProps {
  state: JourneyNodeState;
  className?: string;
}

export function JourneyNode({ state, className }: JourneyNodeProps) {
  const isActive = state === "active";
  const isAdjacent = state === "adjacent";

  // Inner dot diameter (px).
  const dotSize = isActive ? 10 : 6;
  // Active state opacity is 1; adjacent 0.75; inactive 0.5. Bumped from
  // v2 (0.6 / 0.35) so dim dots remain legible against light-mode bg.
  const opacity = isActive ? 1 : isAdjacent ? 0.75 : 0.5;

  return (
    <div
      className={cn(
        "relative grid place-items-center transition-all duration-300",
        "h-10 w-10",
        className,
      )}
      data-state={state}
      aria-hidden="true"
    >
      {/* Active pulsing ring — 36 px, 1 px amber border, 0.45 opacity, pulses. */}
      {isActive && (
        <div
          className="pointer-events-none absolute rounded-full border border-[var(--accent-warm-fg)] animate-pulse motion-reduce:animate-none"
          style={{
            width: 36,
            height: 36,
            opacity: 0.45,
          }}
        />
      )}

      {/* Filled amber dot. Glow shadow only on active to draw the eye. */}
      <div
        className="rounded-full bg-[var(--accent-warm-fg)] transition-all duration-300"
        style={{
          width: dotSize,
          height: dotSize,
          opacity,
          boxShadow: isActive
            ? "0 0 22px var(--accent-warm-fg)"
            : "none",
        }}
      />
    </div>
  );
}
