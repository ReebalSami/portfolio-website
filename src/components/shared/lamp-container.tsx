"use client";

/**
 * LampBackdrop — canonical Aceternity Lamp, fully controlled by YAML config.
 *
 * iter-4 v5 rewrite:
 *
 * - Anchored in the caller's parent via YAML `lamp.anchor.{x,y}`.
 *   `lamp.{x,y}` are a `translate(x, y)` delta on top of that anchor.
 * - `wallMode === "drop"` removes BOTH the wall div AND the 2-px horizon
 *   line, because visually both read as "walls".
 * - `lamp.animation.mode` controls playback:
 *   - `replay`: animation runs each mount (unless reduced motion).
 *   - `static`: renders end-state immediately (ideal for visual tuning).
 * - Dark-mode detection via `MutationObserver` + `useSyncExternalStore`.
 *
 * ## Rendering model
 *
 * The component is an absolute-positioned sibling inside the hero's right
 * column (caller's parent must be `position: relative`). It does NOT wrap
 * the text; text renders as a separate sibling with native theme colours.
 * The parent column has no `overflow-hidden`, so beams radiate freely
 * past the column edges into adjacent grid cells and sections.
 */

import {
  useSyncExternalStore,
  type CSSProperties,
} from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { MOBILE_QUERY } from "@/lib/breakpoints";
import type { HeroLampConfig } from "@/types/config";

// =============================================================================
// SSR-safe mount detection
// =============================================================================

const emptySubscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

function useHasMounted(): boolean {
  return useSyncExternalStore(emptySubscribe, getClientSnapshot, getServerSnapshot);
}

// =============================================================================
// Dark-mode detection via MutationObserver on <html> class
// =============================================================================

function subscribeToDarkModeClass(onStoreChange: () => void): () => void {
  const observer = new MutationObserver(onStoreChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  return () => observer.disconnect();
}

const getDarkSnapshot = (): boolean =>
  document.documentElement.classList.contains("dark");

const getDarkServerSnapshot = (): boolean => false;

function useIsDarkMode(): boolean {
  return useSyncExternalStore(
    subscribeToDarkModeClass,
    getDarkSnapshot,
    getDarkServerSnapshot,
  );
}

function subscribeToMobileLayout(onStoreChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const mql = window.matchMedia(MOBILE_QUERY);
  const listener = () => onStoreChange();

  if (typeof mql.addEventListener === "function") {
    mql.addEventListener("change", listener);
    return () => mql.removeEventListener("change", listener);
  }

  mql.addListener(listener);
  return () => mql.removeListener(listener);
}

const getMobileLayoutSnapshot = (): boolean =>
  window.matchMedia(MOBILE_QUERY).matches;

const getMobileLayoutServerSnapshot = (): boolean => false;

function useIsMobileLayout(): boolean {
  return useSyncExternalStore(
    subscribeToMobileLayout,
    getMobileLayoutSnapshot,
    getMobileLayoutServerSnapshot,
  );
}

// =============================================================================
// RTL detection via MutationObserver on <html dir>
// =============================================================================

function subscribeToDirAttr(onStoreChange: () => void): () => void {
  const observer = new MutationObserver(onStoreChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["dir"],
  });
  return () => observer.disconnect();
}

const getRtlSnapshot = (): boolean =>
  document.documentElement.dir === "rtl";

const getRtlServerSnapshot = (): boolean => false;

function useIsRtl(): boolean {
  return useSyncExternalStore(
    subscribeToDirAttr,
    getRtlSnapshot,
    getRtlServerSnapshot,
  );
}

// =============================================================================
// Public component
// =============================================================================

interface LampBackdropProps {
  /** YAML-backed visual configuration. */
  lamp: HeroLampConfig;
  /** Extra classes merged onto the absolute-positioned outer div. */
  className?: string;
}

/**
 * Outer gate — returns null until post-hydration so the inner motion tree
 * mounts FRESH with the correct `initial` values. Without this gate the
 * motion.divs would render at SSR with `initial=end-state` and Framer
 * would treat the reveal as a no-op.
 */
export function LampBackdrop({ lamp, className }: LampBackdropProps) {
  const mounted = useHasMounted();
  const isMobile = useIsMobileLayout();
  // On mobile the Framer Motion animation tree is skipped entirely so
  // conic-gradient animations don't cause lag on low-power devices.
  if (!mounted || isMobile) return null;
  return <LampBackdropInner lamp={lamp} className={className} />;
}

function LampBackdropInner({
  lamp,
  className,
}: {
  lamp: HeroLampConfig;
  className?: string;
}) {
  const isDark = useIsDarkMode();
  const isMobileLayout = useIsMobileLayout();
  const isRtl = useIsRtl();
  const prefersReducedMotion = useReducedMotion();
  const shouldAnimate =
    lamp.animation.mode === "replay" && !prefersReducedMotion;

  // Palette — injected as CSS custom properties on the outer div so every
  // inner element can use them via `var(--lamp-*)`.
  const modePalette = isDark ? lamp.palette.dark : lamp.palette.light;
  const surfaceValue =
    lamp.surfaceMode === "background" ? "var(--background)" : "transparent";

  const palette: CSSProperties = {
    ["--lamp-surface" as string]: surfaceValue,
    ["--lamp-beam" as string]: modePalette.beam,
    ["--lamp-glow" as string]: modePalette.glow,
    ["--lamp-core" as string]: modePalette.core,
  };

  // Aceternity's reveal values — widths / sizes unchanged; only timing
  // is tunable so that the proportions stay correct.
  const beamEnd = { opacity: 1, width: "30rem" };
  const beamStart = { opacity: 0.5, width: "15rem" };
  const blobEnd = { width: "16rem" };
  const blobStart = { width: "8rem" };
  const lineEnd = { width: "30rem" };
  const lineStart = { width: "15rem" };

  const transition = {
    delay: lamp.animation.delaySec,
    duration: lamp.animation.durationSec,
    ease: "easeInOut" as const,
  };

  // "drop" mode hides both the wall (upper occluder) and the horizon line
  // (thin 2-px divider that Aceternity uses to suggest a ceiling edge).
  // Together they are what reads as "walls" to the viewer.
  const showWallAndLine = lamp.wallMode === "keep";
  // Mobile lamp is rendered natural-orientation (bulb at the top of the box,
  // primary beams fanning DOWNWARD onto the name) and positioned so the bulb
  // lands in the photo/text seam. YAML `lamp.{anchor,x,y}` is desktop-only;
  // mobile overrides these so a 60rem × 40rem YAML box doesn't blow out a
  // 375 px viewport. An additional mobile-only up-cast cone pair provides the
  // subtler upward glow that hits the photo bottom (per user request:
  // "upper light shines at the photo, under light shines at the text").
  const effectiveWidth = isMobileLayout ? "min(24rem, 82vw)" : lamp.width;
  const effectiveHeight = isMobileLayout ? "min(14rem, 42vh)" : lamp.height;
  // In RTL the lamp should anchor from the inline-start edge (physical right),
  // mirroring the LTR anchor.x. Mobile always centers at 50%.
  const desktopLeft = isRtl
    ? `calc(100% - (${lamp.anchor.x}))`
    : lamp.anchor.x;
  const effectiveLeft = isMobileLayout ? "50%" : desktopLeft;
  const effectiveTop = isMobileLayout ? "0" : lamp.anchor.y;
  const effectiveX = isMobileLayout ? "0" : lamp.x;
  const effectiveY = isMobileLayout ? "0" : lamp.y;
  const innerMask =
    "linear-gradient(to top, transparent 0%, black 18%, black 100%)";

  return (
    <div
      aria-hidden="true"
      data-lamp-dark={isDark ? "true" : "false"}
      data-lamp-layout={isMobileLayout ? "mobile" : "desktop"}
      data-lamp-wall-mode={lamp.wallMode}
      data-lamp-surface-mode={lamp.surfaceMode}
      data-lamp-animation-mode={lamp.animation.mode}
      data-lamp-anchor-x={lamp.anchor.x}
      data-lamp-anchor-y={lamp.anchor.y}
      className={cn(
        // Absolute in the caller's parent. Caller must be `position: relative`.
        // The physical anchor comes from YAML `lamp.anchor.{x,y}`.
        "pointer-events-none absolute",
        className,
      )}
      style={{
        ...palette,
        width: effectiveWidth,
        height: effectiveHeight,
        left: effectiveLeft,
        top: effectiveTop,
        // Base transform pins the lamp's center-top to the anchor point,
        // then applies lamp.x/lamp.y physical-axis deltas.
        transform: `translate(-50%, 0) translate(${effectiveX}, ${effectiveY})`,
      }}
    >
      <div
        className="relative flex h-full w-full scale-y-125 items-center justify-center isolate z-0"
        // Soft fade so beams dim into the page bg even if they extend past the
        // backdrop's bounding box. Direction flips on mobile so the bulb stays
        // in the opaque region after the outer `scaleY(-1)`.
        style={{
          WebkitMaskImage: innerMask,
          maskImage: innerMask,
        }}
      >
        {/* Left cone */}
        <motion.div
          initial={shouldAnimate ? beamStart : beamEnd}
          animate={beamEnd}
          transition={transition}
          style={{
            backgroundImage:
              "conic-gradient(from 70deg at center top, var(--lamp-beam), transparent 50%, transparent 100%)",
          }}
          className="absolute inset-auto right-1/2 h-56 overflow-visible w-[30rem] text-white"
        >
          <div
            className="absolute w-[100%] left-0 h-40 bottom-0 z-20 [mask-image:linear-gradient(to_top,white,transparent)]"
            style={{ backgroundColor: "var(--lamp-surface)" }}
          />
          <div
            className="absolute w-40 h-[100%] left-0 bottom-0 z-20 [mask-image:linear-gradient(to_right,white,transparent)]"
            style={{ backgroundColor: "var(--lamp-surface)" }}
          />
        </motion.div>

        {/* Right cone */}
        <motion.div
          initial={shouldAnimate ? beamStart : beamEnd}
          animate={beamEnd}
          transition={transition}
          style={{
            backgroundImage:
              "conic-gradient(from 290deg at center top, transparent 0%, transparent 50%, var(--lamp-beam))",
          }}
          className="absolute inset-auto left-1/2 h-56 w-[30rem] text-white"
        >
          <div
            className="absolute w-40 h-[100%] right-0 bottom-0 z-20 [mask-image:linear-gradient(to_left,white,transparent)]"
            style={{ backgroundColor: "var(--lamp-surface)" }}
          />
          <div
            className="absolute w-[100%] right-0 h-40 bottom-0 z-20 [mask-image:linear-gradient(to_top,white,transparent)]"
            style={{ backgroundColor: "var(--lamp-surface)" }}
          />
        </motion.div>

        {/* Mobile up-cast is rendered as a grid-level sibling in
            `hero-section.tsx` (`HeroMobileUpGlow`) so it can sit above the
            photo column's `z-20` stacking context. Lamp-internal up-cast
            cones were tried first but they render BEHIND the photo on mobile
            because the photo column's opaque image occludes them. */}

        {/* Soft radial blend layer to avoid rectangular horizon artifacts. */}
        <div
          className="pointer-events-none absolute top-1/2 z-20 h-56 w-[120%] -translate-y-1/2"
          style={{
            background:
              "radial-gradient(ellipse 70% 42% at 50% 62%, var(--lamp-surface) 0%, transparent 75%)",
            opacity: 0.18,
          }}
        />

        {/* Centre glow disc */}
        <div
          className="absolute inset-auto z-50 h-36 w-[28rem] -translate-y-1/2 rounded-full opacity-50 blur-3xl"
          style={{ backgroundColor: "var(--lamp-glow)" }}
        />

        {/* Inner blob — the "bulb". Always rendered (not wall-like). */}
        <motion.div
          initial={shouldAnimate ? blobStart : blobEnd}
          animate={blobEnd}
          transition={transition}
          className="absolute inset-auto z-30 h-36 w-64 -translate-y-[6rem] rounded-full blur-2xl"
          style={{ backgroundColor: "var(--lamp-core)" }}
        />

        {/* Horizon line — rendered only in "keep" mode. */}
        {showWallAndLine && (
          <motion.div
            initial={shouldAnimate ? lineStart : lineEnd}
            animate={lineEnd}
            transition={transition}
            className="absolute inset-auto z-50 h-0.5 w-[30rem] -translate-y-[7rem]"
            style={{ backgroundColor: "var(--lamp-core)" }}
          />
        )}

        {/* Top wall — rendered only in "keep" mode. */}
        {showWallAndLine && (
          <div
            className="absolute inset-auto z-40 h-44 w-full -translate-y-[12.5rem]"
            style={{ backgroundColor: "var(--lamp-surface)" }}
          />
        )}
      </div>
    </div>
  );
}
