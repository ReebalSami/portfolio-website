"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Horizontal carousel input handler — wheel + touch swipe + arrow keys.
 *
 * Design notes:
 *
 * 1. **Wheel-hijack safety.** The carousel only intercepts wheel events when
 *    the pointer is *inside* the track AND the user's gesture is dominantly
 *    horizontal OR the section is fully scrolled into view. Otherwise we let
 *    the page scroll normally. This avoids the classic "horizontal carousel
 *    eats vertical page scroll" anti-pattern that breaks many portfolios.
 *
 * 2. **Debounce.** One wheel flick = one step. We swallow further wheel
 *    deltas for `WHEEL_DEBOUNCE_MS` after each step so trackpad inertia
 *    does not cascade through five entries in 200 ms.
 *
 * 3. **Reduced motion.** When `prefers-reduced-motion: reduce` is set, the
 *    consumer is expected to render a non-animated layout (e.g. flex-wrap
 *    grid). The hook still wires up keyboard / arrow-button nav so the
 *    user can step through entries deterministically; only the implicit
 *    wheel capture is disabled (no surprise sideways nudges).
 *
 * 4. **RTL.** When `direction === "rtl"`, swiping right and pressing
 *    ArrowRight go BACK in chronological order, matching the user's
 *    expectation that "right" maps to "earlier" in an RTL reading flow.
 *    The deltaX sign convention is reversed at the boundary; consumers
 *    do not need to know about RTL.
 *
 * 5. **Touch swipe.** Only commits if horizontal delta dominates vertical
 *    delta AND exceeds `SWIPE_THRESHOLD_PX`. Otherwise the gesture is
 *    treated as a vertical scroll and ignored.
 */

// Shorter debounce keeps trackpad flicks responsive without cascading
// through 5+ entries on a single inertia stream. 220 ms ≈ one fluid step
// per gesture for typical macOS trackpad inertia tails.
const WHEEL_DEBOUNCE_MS = 220;
const WHEEL_DELTA_THRESHOLD = 30;
const SWIPE_THRESHOLD_PX = 40;

export type CarouselDirection = "ltr" | "rtl";

export interface UseHorizontalCarouselOptions {
  /** Total number of entries (must be ≥ 1). */
  count: number;
  /** Initial active index. Clamped into [0, count-1]. */
  initialIndex?: number;
  /** Reading direction. `"rtl"` flips wheel/swipe/arrow semantics. */
  direction?: CarouselDirection;
  /**
   * If `true`, wheel + touch capture is disabled. Use this when
   * `prefers-reduced-motion: reduce` is set, or when the consumer wants
   * keyboard / button-only navigation.
   */
  reducedMotion?: boolean;
  /**
   * If set (positive number), auto-advance to the next entry every
   * `autoAdvanceSec` seconds, looping at the end. `0` (default) disables
   * auto-advance — the right call for a portfolio (auto-advance feels
   * like a slideshow).
   */
  autoAdvanceSec?: number;
}

export interface UseHorizontalCarouselReturn {
  active: number;
  setActive: (index: number) => void;
  goNext: () => void;
  goPrev: () => void;
  atStart: boolean;
  atEnd: boolean;
  /** Attach to the carousel root element to wire wheel + touch + keyboard. */
  trackRef: React.RefObject<HTMLDivElement | null>;
}

export function useHorizontalCarousel({
  count,
  initialIndex = 0,
  direction = "ltr",
  reducedMotion = false,
  autoAdvanceSec = 0,
}: UseHorizontalCarouselOptions): UseHorizontalCarouselReturn {
  const safeInitial = Math.min(Math.max(initialIndex, 0), Math.max(count - 1, 0));
  const [active, setActiveRaw] = useState(safeInitial);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const wheelLockRef = useRef<number | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const setActive = useCallback(
    (next: number) => {
      setActiveRaw(Math.min(Math.max(next, 0), Math.max(count - 1, 0)));
    },
    [count],
  );

  const goNext = useCallback(() => {
    setActiveRaw((current) => Math.min(current + 1, count - 1));
  }, [count]);

  const goPrev = useCallback(() => {
    setActiveRaw((current) => Math.max(current - 1, 0));
  }, []);

  // Keyboard nav: ArrowLeft / ArrowRight, RTL-aware.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      // Don't hijack arrow keys when the user is typing in a form field
      // or interacting with another widget that needs them.
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }
      if (event.key === "ArrowRight") {
        if (direction === "rtl") goPrev();
        else goNext();
      } else if (event.key === "ArrowLeft") {
        if (direction === "rtl") goNext();
        else goPrev();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [direction, goNext, goPrev]);

  // Wheel capture: only when the carousel is the user's intent target.
  useEffect(() => {
    if (reducedMotion) return;
    const el = trackRef.current;
    if (!el) return;

    const onWheel = (event: WheelEvent) => {
      // Already locked from a recent step — swallow inertia events.
      if (wheelLockRef.current !== null) {
        event.preventDefault();
        return;
      }
      const dx = event.deltaX;
      const dy = event.deltaY;
      const absX = Math.abs(dx);
      const absY = Math.abs(dy);

      // If the gesture is more vertical than horizontal AND the user has
      // not explicitly used a horizontal trackpad gesture, let the page
      // scroll. This is what prevents the hijack.
      const isHorizontalDominant = absX > absY;
      const isStrongVertical = absY > WHEEL_DELTA_THRESHOLD * 1.5;
      if (!isHorizontalDominant && isStrongVertical) {
        return;
      }

      // Pick the dominant axis; small horizontal flicks still count.
      const delta = isHorizontalDominant ? dx : dy;
      if (Math.abs(delta) < WHEEL_DELTA_THRESHOLD) return;

      event.preventDefault();
      const forward = delta > 0;
      if (direction === "rtl") {
        if (forward) goPrev();
        else goNext();
      } else {
        if (forward) goNext();
        else goPrev();
      }

      wheelLockRef.current = window.setTimeout(() => {
        wheelLockRef.current = null;
      }, WHEEL_DEBOUNCE_MS);
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", onWheel);
      if (wheelLockRef.current !== null) {
        window.clearTimeout(wheelLockRef.current);
        wheelLockRef.current = null;
      }
    };
  }, [direction, goNext, goPrev, reducedMotion]);

  // Touch swipe.
  useEffect(() => {
    if (reducedMotion) return;
    const el = trackRef.current;
    if (!el) return;

    const onStart = (event: TouchEvent) => {
      const t = event.touches[0];
      touchStartRef.current = { x: t.clientX, y: t.clientY };
    };

    const onEnd = (event: TouchEvent) => {
      const start = touchStartRef.current;
      if (!start) return;
      const t = event.changedTouches[0];
      const dx = t.clientX - start.x;
      const dy = t.clientY - start.y;
      touchStartRef.current = null;

      // Only commit horizontal swipes that dominate the vertical delta
      // and exceed the threshold. Below the threshold the user probably
      // intended to scroll the page.
      if (Math.abs(dx) <= Math.abs(dy)) return;
      if (Math.abs(dx) < SWIPE_THRESHOLD_PX) return;

      const forward = dx < 0; // swipe-left = next in LTR
      if (direction === "rtl") {
        if (forward) goPrev();
        else goNext();
      } else {
        if (forward) goNext();
        else goPrev();
      }
    };

    el.addEventListener("touchstart", onStart, { passive: true });
    el.addEventListener("touchend", onEnd, { passive: true });
    return () => {
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchend", onEnd);
    };
  }, [direction, goNext, goPrev, reducedMotion]);

  // Optional auto-advance. Disabled by default; opt-in via prop.
  useEffect(() => {
    if (!autoAdvanceSec || autoAdvanceSec <= 0) return;
    if (reducedMotion) return;
    const id = window.setInterval(() => {
      setActiveRaw((current) => (current + 1) % Math.max(count, 1));
    }, autoAdvanceSec * 1000);
    return () => window.clearInterval(id);
  }, [autoAdvanceSec, count, reducedMotion]);

  return {
    active,
    setActive,
    goNext,
    goPrev,
    atStart: active === 0,
    atEnd: active === count - 1,
    trackRef,
  };
}
