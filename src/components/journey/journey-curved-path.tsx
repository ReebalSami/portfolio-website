"use client";

import { useId } from "react";

/**
 * Dashed sine-wave path connecting all journey nodes.
 *
 * Why an SVG path instead of a CSS line: the Claude design (V4 Hybrid)
 * uses an *organic curved wave* — each node sits on a slight sine offset
 * and the connector flows between them via cubic Béziers. CSS can't do
 * that, but a single SVG path with a linear gradient stroke and dashed
 * pattern nails the "schematic / blueprint" feel from the brief.
 *
 * The gradient fades the path edges to 0 at the start/end so the line
 * does not visually collide with off-screen-clipped regions of the track.
 *
 * Pure presentational + deterministic — no animation here. The track
 * itself translates; the path moves with it.
 */

interface JourneyCurvedPathProps {
  /** Total number of nodes the path threads through. */
  count: number;
  /** Horizontal step between adjacent nodes, in px. */
  step: number;
  /** X position of the first node, in px. */
  startX: number;
  /** Y centre of the rail, in px (canvas height anchor). */
  centerY: number;
  /** Sine-wave amplitude in px (per-node Y offset peak). 0 = straight line. */
  amplitude?: number;
  /** Track total width so the SVG covers the full path. */
  trackWidth: number;
  /** Track height in px. */
  height: number;
  /**
   * When `true`, the path is drawn from right to left so the gradient
   * fade aligns with the visually-mirrored carousel (newest on the right).
   * Defaults to `false` (LTR).
   */
  rtl?: boolean;
}

export function JourneyCurvedPath({
  count,
  step,
  startX,
  centerY,
  amplitude = 22,
  trackWidth,
  height,
  rtl = false,
}: JourneyCurvedPathProps) {
  // Unique gradient ID so multiple instances on a page don't collide.
  const gradientId = useId();

  // Build a smooth path that THREADS THROUGH every node's physical
  // position. The previous implementation drew the path in *logical* x
  // coordinates (`startX + i * step`) while the nodes in `compact-journey`
  // render at *physical* x (`trackWidth − xLocal` in RTL). The two were
  // horizontal mirror images, so the dots never sat on the curve in RTL.
  //
  // Fix: compute physical x here too. Walk indices reversed in RTL so the
  // path renders left-to-right in physical space (k=0 = physical-left =
  // OLDEST entry in RTL; k=count-1 = physical-right = NEWEST). The sine
  // y offset stays tied to the *logical* index `i`, identical to the
  // node's own `journeyNodeYOffset(i)`.
  //
  // Cubic Bézier control points collapse to the shared midpoint
  // `(px + x) / 2`. Even though that places c1 and c2 at the same x, the
  // y values differ (py vs y), which produces a smooth S-curve. This
  // shape is rotation-invariant under horizontal mirror, so the visual
  // is identical in LTR and RTL.
  const segments: string[] = [];
  for (let k = 0; k < count; k += 1) {
    const i = rtl ? count - 1 - k : k;
    const xLocal = startX + i * step;
    const x = rtl ? trackWidth - xLocal : xLocal;
    const y = centerY + Math.sin(i * 1.2) * amplitude;
    if (k === 0) {
      segments.push(`M ${x} ${y}`);
      continue;
    }
    const prevI = rtl ? count - k : k - 1;
    const pxLocal = startX + prevI * step;
    const px = rtl ? trackWidth - pxLocal : pxLocal;
    const py = centerY + Math.sin(prevI * 1.2) * amplitude;
    const mid = (px + x) * 0.5;
    segments.push(`C ${mid} ${py}, ${mid} ${y}, ${x} ${y}`);
  }
  const d = segments.join(" ");

  return (
    <svg
      className="absolute pointer-events-none top-0 left-0"
      width={trackWidth}
      height={height}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--accent-warm-fg)" stopOpacity="0" />
          <stop offset="18%" stopColor="var(--accent-warm-fg)" stopOpacity="0.6" />
          <stop offset="82%" stopColor="var(--accent-warm-fg)" stopOpacity="0.6" />
          <stop offset="100%" stopColor="var(--accent-warm-fg)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d={d}
        stroke={`url(#${gradientId})`}
        strokeWidth="1"
        strokeDasharray="3 5"
        fill="none"
      />
    </svg>
  );
}

/**
 * Per-node Y offset matching the curve. Exported so node + card placement
 * can stay in sync with the path geometry without re-computing the sine.
 */
export function journeyNodeYOffset(index: number, amplitude: number = 22): number {
  return Math.sin(index * 1.2) * amplitude;
}
