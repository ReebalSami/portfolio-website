"use client";

/**
 * MorphingDownloadCta — a single download button that physically travels
 * between three anchor points as the user scrolls the CV:
 *
 *   [top slot]    inline in the hero, right below the profile summary
 *       ↓ (user scrolls past the hero)
 *   [fab slot]    fixed over the chat widget, circular, icon-only
 *       ↓ (user reaches the footer CTA section)
 *   [bottom slot] inline in the "Take it with you" footer section
 *
 * ## Design (iter-4 rewrite, fixes #46)
 *
 * **One** `<motion.button>` is mounted once, inside a React portal attached
 * to `document.body`. Its `top`, `left`, `width`, `height`, and
 * `borderRadius` are driven by the `animate` prop targeting the bounding
 * rect of whichever slot is currently active. The slot components
 * themselves render a visually-identical placeholder (to reserve layout
 * space) and publish their rect via `ResizeObserver` + scroll listeners to
 * a local context. The button is never unmounted, so Framer always has a
 * valid source and target rect → smooth spring interpolation with no
 * intermediate states, no darts, no empty layout boxes.
 *
 * The previous implementation mounted the button three times (one in each
 * slot's `<AnimatePresence>`) and relied on `layoutId` to animate between
 * mount sites. When `AnimatePresence` unmounted the old slot before the
 * new slot committed layout, Framer fell back to the element's origin,
 * producing the "small rectangle mid-screen" / "dart off-screen upward"
 * glitches reported in #46.
 *
 * ## FAB positioning
 *
 * The FAB's target rect is *derived* from the chat widget's live rect via
 * `useChatLayout()`. When the chat dialog is closed, the FAB sits above
 * the chat button (with a 12 px gap). When the dialog is open, it sits
 * above the dialog. Works at every viewport, independent of mount order
 * and z-index, no DOM queries.
 *
 * ## Choice panel
 *
 * The ATS / Visual / Print panel lives in the same portal, positioned
 * against the button's active-slot rect. Top anchor drops the panel
 * below the button; FAB and bottom anchors raise it above. Panel
 * auto-closes when the user scrolls into a different slot (derived state,
 * not a `useEffect` — matches React 19's `react-hooks/set-state-in-effect`
 * rule).
 *
 * ## Accessibility / reduced motion
 *
 * `useReducedMotion()` swaps the spring for an instant transition, and
 * disables the magnetic-hover effect on hero + footer slots.
 *
 * Scope: wired on the canonical `/cv` (Editorial theme). Other preview
 * themes keep their existing `<CvDownloadFab />` + `<CvDownloadCta />`.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useLayoutEffect,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import {
  animate,
  AnimatePresence,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useSpring,
  type AnimationPlaybackControls,
  type MotionValue,
} from "framer-motion";
import { Download, FileText, Printer, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useChatLayout, type LayoutRect } from "@/lib/layout/chat-layout-context";
import { cn } from "@/lib/utils";

// =============================================================================
// SSR-safe mount detection — `useSyncExternalStore` returns the server
// snapshot (false) during SSR and the client snapshot (true) after hydration,
// with no setState and no effect, which keeps React 19's
// `react-hooks/set-state-in-effect` rule happy. The empty-subscribe callback
// is fine because we never need to "re-subscribe" — the value flips once
// per document lifetime.
// =============================================================================

const emptySubscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

function useHasMounted(): boolean {
  return useSyncExternalStore(emptySubscribe, getClientSnapshot, getServerSnapshot);
}

// =============================================================================
// Types
// =============================================================================

type MorphState = "top" | "fab" | "bottom";

export interface DownloadTheme {
  id: string;
  name: string;
  description: string;
  pdfUrl: string;
}

/**
 * Default download themes. Mirrors `CvDownloadFab`'s defaults so zero-prop
 * usage still ships the correct PDFs.
 */
const DEFAULT_DOWNLOAD_THEMES: DownloadTheme[] = [
  {
    id: "ats",
    name: "ATS-Friendly",
    description: "Single-column · Best for parsing & ATS systems",
    pdfUrl: "/cv/ats/resume_reebal_sami.pdf",
  },
  {
    id: "visual",
    name: "Visual",
    description: "Two-column · Best for reading & sharing",
    pdfUrl: "/cv/visual/resume_reebal_sami.pdf",
  },
];

// =============================================================================
// Target geometry — what the portal button animates toward
// =============================================================================

/** The fully-resolved rect the portal button should occupy right now. */
interface Target {
  top: number;
  left: number;
  width: number;
  height: number;
  borderRadius: number;
}

/** Pill corner radius — matches `rounded-md` in this project (--radius * 0.8 ≈ 10 px). */
const PILL_RADIUS = 10;

/** Spring config for state-change morphs and during-spring re-targets. */
const SPRING_OPTIONS = {
  type: "spring" as const,
  stiffness: 260,
  damping: 32,
  mass: 0.8,
};

/** FAB dimensions. */
const FAB_SIZE = 56; // h-14 w-14
const FAB_RADIUS = 9999;

/** Gap between the FAB and the chat widget (button or dialog). */
const FAB_GAP = 12;

/** Right-edge margin when there's no chat rect (fallback FAB position). */
const FAB_FALLBACK_MARGIN = 24;

/**
 * Pre-hydration / no-chat fallback bottom distance. Matches the legacy
 * `CvDownloadFab` production default (`bottom: 6rem`) so the portal button
 * lands ABOVE the chat widget's default `bottom-6 end-6` slot in the
 * brief window before the ChatLayoutContext publishes a real rect. The
 * old value (`FAB_FALLBACK_MARGIN` = 24 px) was causing the bug reported
 * in #46 where the FAB sat under the chat button on first paint.
 */
const FAB_FALLBACK_BOTTOM = 96; // 6rem

// =============================================================================
// Context
// =============================================================================

interface MorphContextValue {
  state: MorphState;
  panelOpen: boolean;
  setPanelOpen: (open: boolean) => void;
  setTopRect: (rect: LayoutRect | null) => void;
  setBottomRect: (rect: LayoutRect | null) => void;
  setTopSentinel: (el: Element | null) => void;
  setBottomSentinel: (el: Element | null) => void;
  themes: DownloadTheme[];
  label: string;
}

/**
 * Pure, side-effect-free target derivation. Called from a motion-value
 * subscription on each rect change — must NOT touch React state.
 */
function computeTarget(
  state: MorphState,
  topRect: LayoutRect | null,
  bottomRect: LayoutRect | null,
  chatButton: LayoutRect | null,
  chatDialog: LayoutRect | null,
  chatOpen: boolean,
): Target | null {
  if (state === "top" && topRect) {
    return {
      top: topRect.top,
      left: topRect.left,
      width: topRect.width,
      height: topRect.height,
      borderRadius: PILL_RADIUS,
    };
  }
  if (state === "bottom" && bottomRect) {
    return {
      top: bottomRect.top,
      left: bottomRect.left,
      width: bottomRect.width,
      height: bottomRect.height,
      borderRadius: PILL_RADIUS,
    };
  }
  if (typeof window === "undefined") return null;
  const vh = window.innerHeight;
  const vw = window.innerWidth;
  let bottomPx: number;
  let rightPx: number;
  if (chatOpen && chatDialog) {
    bottomPx = vh - chatDialog.top + 20;
    rightPx = vw - chatDialog.right;
  } else if (chatButton) {
    bottomPx = vh - chatButton.top + FAB_GAP;
    rightPx = vw - chatButton.right;
  } else {
    bottomPx = FAB_FALLBACK_BOTTOM;
    rightPx = FAB_FALLBACK_MARGIN;
  }
  return {
    top: vh - bottomPx - FAB_SIZE,
    left: vw - rightPx - FAB_SIZE,
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_RADIUS,
  };
}

const MorphContext = createContext<MorphContextValue | null>(null);

function useMorphContext(componentName: string): MorphContextValue {
  const ctx = useContext(MorphContext);
  if (!ctx) {
    throw new Error(
      `<MorphingDownloadCta.${componentName}> must be rendered inside <MorphingDownloadCta>.`,
    );
  }
  return ctx;
}

// =============================================================================
// Magnetic wrapper — drifts toward the cursor within a radius. Only active
// on top/bottom slots; disabled on the FAB (too subtle to matter at 56 px
// and would fight the chat-widget neighbour) and under reduced motion.
// =============================================================================

function MagneticWrap({
  children,
  enabled,
  strength = 0.35,
  radius = 140,
  className,
}: {
  children: ReactNode;
  enabled: boolean;
  strength?: number;
  radius?: number;
  className?: string;
}) {
  const prefersReducedMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 220, damping: 22, mass: 0.4 });
  const springY = useSpring(y, { stiffness: 220, damping: 22, mass: 0.4 });

  useEffect(() => {
    if (prefersReducedMotion || !enabled) {
      x.set(0);
      y.set(0);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const handle = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.hypot(dx, dy);
      if (dist < radius) {
        const falloff = 1 - dist / radius;
        x.set(dx * strength * falloff);
        y.set(dy * strength * falloff);
      } else {
        x.set(0);
        y.set(0);
      }
    };
    const leave = () => {
      x.set(0);
      y.set(0);
    };
    window.addEventListener("mousemove", handle, { passive: true });
    el.addEventListener("mouseleave", leave);
    return () => {
      window.removeEventListener("mousemove", handle);
      el.removeEventListener("mouseleave", leave);
    };
  }, [prefersReducedMotion, enabled, radius, strength, x, y]);

  return (
    <motion.div
      ref={ref}
      style={{ x: springX, y: springY }}
      className={cn("pointer-events-none absolute inset-0", className)}
    >
      {children}
    </motion.div>
  );
}

// =============================================================================
// Portal button — the ONE `<motion.button>` that travels between slots.
// =============================================================================

interface PortalButtonProps {
  topRectMV: MotionValue<LayoutRect | null>;
  bottomRectMV: MotionValue<LayoutRect | null>;
  state: MorphState;
  label: string;
  panelOpen: boolean;
  onClick: () => void;
}

function PortalButton({ topRectMV, bottomRectMV, state, label, panelOpen, onClick }: PortalButtonProps) {
  const prefersReducedMotion = useReducedMotion();
  const mounted = useHasMounted();
  const isFab = state === "fab";
  const { buttonRect: chatButton, dialogRect: chatDialog, isOpen: chatOpen } = useChatLayout();

  // ---------------------------------------------------------------------------
  // Motion values drive the button's position + size. Two key design moves:
  //   1. **Per-scroll updates bypass React entirely.** Slot rects live in
  //      `topRectMV` / `bottomRectMV` (Framer motion values, set by
  //      SlotPlaceholder on each scroll-rAF). We subscribe via
  //      `useMotionValueEvent` and snap our own position motion values
  //      synchronously — no React render, no `useMemo`, no
  //      `useLayoutEffect` per scroll tick. Fixes the mobile scroll
  //      wobble that the previous useState-based pipeline introduced
  //      (2-3 frames of render lag → visible trailing during fast scroll).
  //   2. **Inter-state transitions use imperative `animate()` with a spring**
  //      — exactly one clean spring per state change, with generation-based
  //      interruption handling so a mid-flight state change cleanly
  //      re-targets without leaving `animatingRef` stuck true.
  // ---------------------------------------------------------------------------
  const top = useMotionValue(0);
  const left = useMotionValue(0);
  const width = useMotionValue(0);
  const height = useMotionValue(0);
  const borderRadius = useMotionValue(PILL_RADIUS);

  const prevStateRef = useRef(state);
  const animatingRef = useRef(false);
  const animGenRef = useRef(0);
  const animControlsRef = useRef<AnimationPlaybackControls[]>([]);

  // Latest values readable inside motion-value subscriptions (which run
  // outside React's render cycle). The ref values are updated in a
  // useLayoutEffect after each commit — this satisfies the
  // react-hooks/refs rule ("don't update refs during render") while
  // still guaranteeing that any snap fired AFTER React commits a render
  // sees the latest props.
  const stateRef = useRef(state);
  const chatRef = useRef({ chatButton, chatDialog, chatOpen });
  useLayoutEffect(() => {
    stateRef.current = state;
    chatRef.current = { chatButton, chatDialog, chatOpen };
  });

  // Snap motion values to the current target.
  //
  // Two behaviors based on whether a state-change spring is in flight:
  //
  // **Idle path (no spring):** Instant `.set()` for all 5 values. This is
  //   the per-scroll path that eliminates the pill-state wobble — position
  //   updates with zero pipeline lag.
  //
  // **Spring-in-flight path:** Position must keep tracking the live rect
  //   while a state-change spring runs (otherwise during smooth-scroll
  //   transitions the spring locks onto a stale rect and the button lands
  //   at the wrong place). In rect-tracked states (top/bottom), we
  //   re-target the position spring via `animate()` — Framer smoothly
  //   continues from the current value+velocity to the new target. Shape
  //   (width/height/borderRadius) is left alone so the pill↔fab morph
  //   stays smooth. In fab state, position is chat-driven (not rect-
  //   driven), so we don't touch it here either.
  //
  // Note: `.set()` does NOT interrupt running animations in Framer Motion
  // v11+, which is why we use `animate()` to re-target instead.
  const snap = useCallback(() => {
    const target = computeTarget(
      stateRef.current,
      topRectMV.get(),
      bottomRectMV.get(),
      chatRef.current.chatButton,
      chatRef.current.chatDialog,
      chatRef.current.chatOpen,
    );
    if (!target) return;

    const isRectTracked =
      stateRef.current === "top" || stateRef.current === "bottom";

    // Position: in rect-tracked states (top/bottom), always snap to the
    // live rect. We must `.stop()` first because Framer Motion v11+ does
    // NOT interrupt running animations on `.set()` — without `.stop()` an
    // in-flight state-change spring would keep overwriting our snap.
    if (isRectTracked) {
      top.stop();
      left.stop();
      top.set(target.top);
      left.set(target.left);
    }

    // Shape (width, height, borderRadius): only snap when no spring is
    // in flight. During a state-change the shape is morphing pill ↔ fab
    // and we must not interrupt it.
    if (!animatingRef.current) {
      if (!isRectTracked) {
        // FAB state, idle: position is chat-driven, safe to snap now.
        top.set(target.top);
        left.set(target.left);
      }
      width.set(target.width);
      height.set(target.height);
      borderRadius.set(target.borderRadius);
    }
  }, [topRectMV, bottomRectMV, top, left, width, height, borderRadius]);

  // Per-scroll path: slot motion values fire `change` synchronously when
  // SlotPlaceholder calls `.set()`. We snap immediately. No React render.
  useMotionValueEvent(topRectMV, "change", snap);
  useMotionValueEvent(bottomRectMV, "change", snap);

  // State-change path: kicks off the morph spring. Also handles initial
  // mount (prevStateRef seeded with initial state == current → no spring).
  useLayoutEffect(() => {
    const target = computeTarget(state, topRectMV.get(), bottomRectMV.get(), chatButton, chatDialog, chatOpen);
    if (!target) return;

    const stateChanged = prevStateRef.current !== state;
    prevStateRef.current = state;

    const shouldSpring =
      !prefersReducedMotion && (stateChanged || animatingRef.current);

    if (shouldSpring) {
      animControlsRef.current.forEach((c) => c.stop());
      const gen = ++animGenRef.current;
      animatingRef.current = true;

      animControlsRef.current = [
        animate(top, target.top, SPRING_OPTIONS),
        animate(left, target.left, SPRING_OPTIONS),
        animate(width, target.width, SPRING_OPTIONS),
        animate(height, target.height, SPRING_OPTIONS),
        animate(borderRadius, target.borderRadius, SPRING_OPTIONS),
      ];

      Promise.allSettled(
        animControlsRef.current.map((c) => c.finished),
      ).then(() => {
        // Generation guard — only clear the flag if we're still on the
        // latest set of animations. An interrupting state change bumps
        // the generation and keeps the flag true.
        if (animGenRef.current === gen) {
          animatingRef.current = false;
          // After spring lands, snap to the live rect (which may have
          // moved during the animation, e.g. user kept scrolling).
          snap();
        }
      });
    } else {
      top.set(target.top);
      left.set(target.left);
      width.set(target.width);
      height.set(target.height);
      borderRadius.set(target.borderRadius);
    }
  }, [state, chatButton, chatDialog, chatOpen, prefersReducedMotion, snap, topRectMV, bottomRectMV, top, left, width, height, borderRadius]);

  // Stop any in-flight animations on unmount so their promises don't leak.
  useEffect(() => {
    return () => {
      animControlsRef.current.forEach((c) => c.stop());
    };
  }, []);

  if (!mounted) return null;

  const node = (
    <motion.div
      className="pointer-events-none fixed z-[60] print:hidden"
      style={{ position: "fixed", top, left, width, height }}
    >
      <MagneticWrap enabled={!isFab}>
        <motion.button
          type="button"
          onClick={onClick}
          aria-label={label}
          aria-haspopup="menu"
          aria-expanded={panelOpen}
          data-plausible-event="cv:download-open"
          data-plausible-event-source={state}
          className={cn(
            "pointer-events-auto inline-flex h-full w-full cursor-pointer items-center justify-center gap-2 whitespace-nowrap",
            "bg-gallery-warm text-neutral-950 shadow-lg shadow-black/10",
            "transition-colors hover:bg-gallery-warm/90",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gallery-warm focus-visible:ring-offset-2",
            "font-medium text-sm",
            isFab ? "justify-center px-0" : "px-6",
          )}
          style={{ borderRadius }}
        >
          <Download className="h-4 w-4 shrink-0" aria-hidden="true" />
          {/* Label fades out in the FAB state so the button reads as an
              icon-only circle. AnimatePresence keeps the text in the DOM
              during the morph so the visual transition is smooth. */}
          <AnimatePresence initial={false}>
            {!isFab && (
              <motion.span
                key="label"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.18 }}
                className="overflow-hidden whitespace-nowrap"
              >
                {label}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </MagneticWrap>
    </motion.div>
  );

  return createPortal(node, document.body);
}

// =============================================================================
// Choice panel — portal-anchored, positioned against the active-slot rect.
// =============================================================================

interface PortalPanelProps {
  topRectMV: MotionValue<LayoutRect | null>;
  bottomRectMV: MotionValue<LayoutRect | null>;
  state: MorphState;
  themes: DownloadTheme[];
  open: boolean;
  onClose: () => void;
}

// Anchor geometry: top slot drops the panel below the button; bottom + fab
// raise it above. The same `panelTop`/`panelLeft` motion values are written
// from a shared subscription so per-scroll updates skip React entirely
// (matches the PortalButton path).
const PANEL_WIDTH = 256; // w-64
const PANEL_HEIGHT_APPROX = 260;
const PANEL_GAP = 12;

function computePanelPosition(
  state: MorphState,
  target: Target,
): { top: number; left: number } {
  let panelTop: number;
  let panelLeft: number;
  if (state === "top") {
    panelTop = target.top + target.height + PANEL_GAP;
    panelLeft = target.left;
  } else if (state === "fab") {
    // FAB is at the far end; panel rises above and aligns its right edge
    // with the FAB's right edge so it reads from the button downward.
    panelTop = target.top - PANEL_GAP - PANEL_HEIGHT_APPROX;
    panelLeft = target.left + target.width - PANEL_WIDTH;
  } else {
    // bottom slot — inline; panel rises above its inline-start.
    panelTop = target.top - PANEL_GAP - PANEL_HEIGHT_APPROX;
    panelLeft = target.left;
  }
  if (typeof window !== "undefined") {
    panelLeft = Math.max(16, Math.min(panelLeft, window.innerWidth - PANEL_WIDTH - 16));
    panelTop = Math.max(16, panelTop);
  }
  return { top: panelTop, left: panelLeft };
}

function PortalPanel({ topRectMV, bottomRectMV, state, themes, open, onClose }: PortalPanelProps) {
  const t = useTranslations("cv");
  const prefersReducedMotion = useReducedMotion();
  const mounted = useHasMounted();
  const { buttonRect: chatButton, dialogRect: chatDialog, isOpen: chatOpen } = useChatLayout();

  // Panel position written outside React's render cycle. Match the same
  // pattern as PortalButton: subscribe to slot motion values, recompute,
  // write to the panel's own position motion values, no React state.
  const panelTop = useMotionValue(0);
  const panelLeft = useMotionValue(0);

  const stateRef = useRef(state);
  const chatRef = useRef({ chatButton, chatDialog, chatOpen });
  useLayoutEffect(() => {
    stateRef.current = state;
    chatRef.current = { chatButton, chatDialog, chatOpen };
  });

  const recompute = useCallback(() => {
    const target = computeTarget(
      stateRef.current,
      topRectMV.get(),
      bottomRectMV.get(),
      chatRef.current.chatButton,
      chatRef.current.chatDialog,
      chatRef.current.chatOpen,
    );
    if (!target) return;
    const { top: pTop, left: pLeft } = computePanelPosition(stateRef.current, target);
    panelTop.set(pTop);
    panelLeft.set(pLeft);
  }, [topRectMV, bottomRectMV, panelTop, panelLeft]);

  // Per-scroll path: slot motion-value changes → immediate recompute.
  useMotionValueEvent(topRectMV, "change", recompute);
  useMotionValueEvent(bottomRectMV, "change", recompute);

  // State / chat changes → recompute. Also runs on mount.
  useEffect(() => {
    recompute();
  }, [state, chatButton, chatDialog, chatOpen, recompute]);

  // Close on Escape for keyboard users.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!mounted) return null;

  const node = (
    <AnimatePresence>
      {open && (
        <motion.div
          role="menu"
          aria-label={t("downloadPdf")}
          initial={{ opacity: 0, y: state === "top" ? -6 : 6, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: state === "top" ? -6 : 6, scale: 0.98 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.18 }}
          style={{
            position: "fixed",
            top: panelTop,
            left: panelLeft,
            width: PANEL_WIDTH,
            maxWidth: "calc(100vw - 2rem)",
          }}
          className="z-[61] rounded-xl border border-border bg-background/95 p-4 shadow-xl backdrop-blur-md print:hidden"
        >
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-medium">{t("downloadPdf")}</h3>
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-1.5">
            {themes.map((theme) => (
              <a
                key={theme.id}
                href={theme.pdfUrl}
                download
                role="menuitem"
                onClick={onClose}
                className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-start text-sm transition-colors hover:bg-muted"
                data-plausible-event="cv:download"
                data-plausible-event-theme={theme.id}
                data-plausible-event-source={state}
              >
                <FileText className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div>
                  <span className="font-medium">{theme.name}</span>
                  <p className="text-xs text-muted-foreground">{theme.description}</p>
                </div>
              </a>
            ))}
          </div>

          <div className="mt-3 border-t border-border pt-3">
            <a
              href="/cv/ats/resume_reebal_sami.pdf"
              target="_blank"
              rel="noopener noreferrer"
              role="menuitem"
              onClick={onClose}
              className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted"
              data-plausible-event="cv:print"
              data-plausible-event-source={state}
            >
              <Printer className="h-4 w-4 text-muted-foreground" />
              <span>{t("printVersion")}</span>
            </a>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(node, document.body);
}

// =============================================================================
// Root provider + portal host
// =============================================================================

interface RootProps {
  children: ReactNode;
  /** Accessible label + button text. Defaults to `cv.downloadPdf`. */
  label?: string;
  themes?: DownloadTheme[];
}

function MorphingDownloadCtaRoot({
  children,
  label,
  themes = DEFAULT_DOWNLOAD_THEMES,
}: RootProps) {
  const t = useTranslations("cv");
  const resolvedLabel = label ?? t("downloadPdf");

  // Slot rects — published by each inline placeholder via ResizeObserver +
  // window scroll/resize. Stored as Framer motion values (NOT React state)
  // so per-scroll publishes don't trigger React renders. PortalButton +
  // PortalPanel subscribe via `useMotionValueEvent` and recompute their
  // positions on each rect change without re-rendering. This is the fix
  // for the mobile pill-state scroll wobble (see top-of-file comment).
  const topRectMV = useMotionValue<LayoutRect | null>(null);
  const bottomRectMV = useMotionValue<LayoutRect | null>(null);

  const setTopRect = useCallback(
    (rect: LayoutRect | null) => {
      topRectMV.set(rect);
    },
    [topRectMV],
  );
  const setBottomRect = useCallback(
    (rect: LayoutRect | null) => {
      bottomRectMV.set(rect);
    },
    [bottomRectMV],
  );

  // Sentinel elements — one at the END of the top slot and one at the
  // START of the bottom slot. The viewport-midline test against these
  // sentinel rects drives the MorphState derivation.
  const [topSentinel, setTopSentinel] = useState<Element | null>(null);
  const [bottomSentinel, setBottomSentinel] = useState<Element | null>(null);

  const [state, setState] = useState<MorphState>("top");

  // Panel-open tied to the slot in which it was opened — when the user
  // scrolls into a different slot the panel auto-closes via derivation.
  // (React 19's `react-hooks/set-state-in-effect` rule blocks the
  // alternative `useEffect(() => setPanelOpen(false), [state])` pattern.)
  const [panelOpenSlot, setPanelOpenSlot] = useState<MorphState | null>(null);
  const panelOpen = panelOpenSlot === state;
  const setPanelOpen = useCallback(
    (open: boolean) => {
      setPanelOpenSlot(open ? state : null);
    },
    [state],
  );

  // ---------------------------------------------------------------------------
  // State derivation — rAF-throttled scroll + resize listeners on the two
  // sentinels. Same midline logic as iter-4 v1; it worked, we just had to
  // decouple it from the button's mount point.
  // ---------------------------------------------------------------------------
  useEffect(() => {
    function update() {
      const mid = window.innerHeight / 2;
      const topSentinelRect = topSentinel?.getBoundingClientRect();
      // For the bottom trigger we read the SLOT's rect (via sentinel's
      // parent, which is the inline wrapper around the placeholder), not
      // the sentinel's own (0×0) rect. Check if the whole slot has
      // entered the viewport from below — this fires naturally as the
      // user approaches the end of the page, even on short CV content
      // where the slot would never reach the viewport midline.
      const bottomSlotEl = bottomSentinel?.parentElement;
      const bottomSlotRect = bottomSlotEl?.getBoundingClientRect();

      let next: MorphState = "fab";
      if (topSentinelRect && topSentinelRect.top > mid) {
        // Top slot's visual bottom (sentinel sits at its bottom-end) is
        // still in the lower half of the viewport → user is in the hero.
        next = "top";
      } else if (
        bottomSlotRect &&
        bottomSlotRect.bottom <= window.innerHeight
      ) {
        // Bottom slot is fully visible → user has scrolled to the end.
        next = "bottom";
      }
      setState((prev) => (prev === next ? prev : next));
    }
    update();

    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [topSentinel, bottomSentinel]);

  // ---------------------------------------------------------------------------
  // Target derivation now lives inside PortalButton + PortalPanel (each
  // subscribes to the slot motion values + chat layout context and
  // computes its own target). The Root no longer holds a `target`
  // useMemo because doing so would re-run on every scroll publish,
  // re-introducing the React render lag we're trying to avoid.
  // ---------------------------------------------------------------------------

  const value = useMemo<MorphContextValue>(
    () => ({
      state,
      panelOpen,
      setPanelOpen,
      setTopRect,
      setBottomRect,
      setTopSentinel,
      setBottomSentinel,
      themes,
      label: resolvedLabel,
    }),
    [state, panelOpen, setPanelOpen, setTopRect, setBottomRect, themes, resolvedLabel],
  );

  return (
    <MorphContext.Provider value={value}>
      {children}
      <PortalButton
        topRectMV={topRectMV}
        bottomRectMV={bottomRectMV}
        state={state}
        label={resolvedLabel}
        panelOpen={panelOpen}
        onClick={() => setPanelOpen(!panelOpen)}
      />
      <PortalPanel
        topRectMV={topRectMV}
        bottomRectMV={bottomRectMV}
        state={state}
        themes={themes}
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
      />
    </MorphContext.Provider>
  );
}

// =============================================================================
// Slot placeholders — visually-identical, non-interactive, rect-publishing.
// =============================================================================

/**
 * Shared placeholder that mirrors the portal button's visual size so the
 * inline layout reserves correct space. `opacity-0 pointer-events-none`
 * hides it; the portal button overlays exactly on top via the reported
 * bounding rect. Publishes its rect to the provider via ResizeObserver +
 * scroll/resize listeners.
 */
function SlotPlaceholder({
  variant,
  label,
  setRect,
  children,
}: {
  variant: "top" | "bottom";
  label: string;
  setRect: (rect: LayoutRect | null) => void;
  children?: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) {
      setRect(null);
      return;
    }

    let frame = 0;
    const publish = () => {
      const r = el.getBoundingClientRect();
      setRect({
        top: r.top,
        left: r.left,
        right: r.right,
        bottom: r.bottom,
        width: r.width,
        height: r.height,
      });
    };
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(publish);
    };

    publish();
    const ro = new ResizeObserver(schedule);
    ro.observe(el);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      setRect(null);
    };
  }, [setRect]);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      data-morph-slot={variant}
      className="inline-flex h-12 cursor-default items-center justify-center gap-2 whitespace-nowrap rounded-md bg-gallery-warm px-6 text-sm font-medium text-neutral-950 opacity-0"
    >
      <Download className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span>{label}</span>
      {children}
    </div>
  );
}

/**
 * Top slot — drop this inline in the hero where the download CTA should
 * first appear. Renders a zero-opacity placeholder that reserves the
 * layout space of the real button, plus a zero-size sentinel at the end
 * of the slot (used for the midline state test).
 */
function MorphingDownloadCtaTopSlot({ className }: { className?: string }) {
  const ctx = useMorphContext("TopSlot");
  const sentinelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    ctx.setTopSentinel(sentinelRef.current);
    return () => ctx.setTopSentinel(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={cn("relative inline-block print:hidden", className)}>
      <SlotPlaceholder variant="top" label={ctx.label} setRect={ctx.setTopRect} />
      <span
        ref={sentinelRef}
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 end-0 h-0 w-0"
      />
    </div>
  );
}

/**
 * Bottom slot — drop this inline in the footer CTA section. Mirrors the
 * top slot; sentinel lives at the START (so "past the sentinel" = "the
 * user has reached the footer band").
 */
function MorphingDownloadCtaBottomSlot({ className }: { className?: string }) {
  const ctx = useMorphContext("BottomSlot");
  const sentinelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    ctx.setBottomSentinel(sentinelRef.current);
    return () => ctx.setBottomSentinel(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={cn("relative inline-block print:hidden", className)}>
      <span
        ref={sentinelRef}
        aria-hidden="true"
        className="pointer-events-none absolute start-0 top-0 h-0 w-0"
      />
      <SlotPlaceholder variant="bottom" label={ctx.label} setRect={ctx.setBottomRect} />
    </div>
  );
}

// =============================================================================
// Exports — plain named exports. Earlier iterations used Object.assign to
// expose a namespaced API, but that pattern breaks the React Server
// Component ↔ client boundary (attached properties don't survive RSC
// serialisation).
// =============================================================================

export {
  MorphingDownloadCtaRoot as MorphingDownloadCta,
  MorphingDownloadCtaTopSlot,
  MorphingDownloadCtaBottomSlot,
};
