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
  useReducedMotion,
  useSpring,
  type AnimationPlaybackControls,
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
  target: Target | null;
  panelOpen: boolean;
  setPanelOpen: (open: boolean) => void;
  setTopRect: (rect: LayoutRect | null) => void;
  setBottomRect: (rect: LayoutRect | null) => void;
  setTopSentinel: (el: Element | null) => void;
  setBottomSentinel: (el: Element | null) => void;
  themes: DownloadTheme[];
  label: string;
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
  target: Target | null;
  state: MorphState;
  label: string;
  panelOpen: boolean;
  onClick: () => void;
}

function PortalButton({ target, state, label, panelOpen, onClick }: PortalButtonProps) {
  const prefersReducedMotion = useReducedMotion();
  const mounted = useHasMounted();
  const isFab = state === "fab";

  // ---------------------------------------------------------------------------
  // Motion values drive the button's position + size. Using motion values
  // (not Framer's `animate={...}` prop) gives us two superpowers:
  //   1. Intra-state scroll updates can `.set()` the values INSTANTLY —
  //      the button sticks to its placeholder's live rect every frame,
  //      no spring dancing as the target changes pixel-by-pixel.
  //   2. Inter-state transitions use imperative `animate()` with a spring —
  //      exactly one clean spring per state change, with generation-based
  //      interruption handling so a mid-flight state change cleanly
  //      re-targets without leaving `animatingRef` stuck true.
  //
  // This fixes the "button dances while scrolling in the top slot" bug
  // reported in #46 — the old implementation's `animate={{top, left,...}}`
  // restarted the spring on every scroll tick because `target` was a
  // fresh object from `useMemo` each render.
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

  useLayoutEffect(() => {
    if (!target) return;
    const stateChanged = prevStateRef.current !== state;
    prevStateRef.current = state;

    // Spring fires on state change, AND continues "chasing" the live
    // target during an in-flight spring (so e.g. a top→fab transition
    // interrupted by the chat dialog opening still lands on the correct
    // final rect). Idle renders (intra-state scroll) snap instantly.
    const shouldSpring =
      !prefersReducedMotion && (stateChanged || animatingRef.current);

    if (shouldSpring) {
      animControlsRef.current.forEach((c) => c.stop());
      const gen = ++animGenRef.current;
      animatingRef.current = true;

      const spring = {
        type: "spring" as const,
        stiffness: 260,
        damping: 32,
        mass: 0.8,
      };

      animControlsRef.current = [
        animate(top, target.top, spring),
        animate(left, target.left, spring),
        animate(width, target.width, spring),
        animate(height, target.height, spring),
        animate(borderRadius, target.borderRadius, spring),
      ];

      Promise.allSettled(
        animControlsRef.current.map((c) => c.finished),
      ).then(() => {
        // Generation guard — only clear the flag if we're still on the
        // latest set of animations. An interrupting state change bumps
        // the generation and keeps the flag true.
        if (animGenRef.current === gen) {
          animatingRef.current = false;
        }
      });
    } else {
      // Idle — snap to the latest target. No spring, no dancing.
      top.set(target.top);
      left.set(target.left);
      width.set(target.width);
      height.set(target.height);
      borderRadius.set(target.borderRadius);
    }
  }, [state, target, prefersReducedMotion, top, left, width, height, borderRadius]);

  // Stop any in-flight animations on unmount so their promises don't leak.
  useEffect(() => {
    return () => {
      animControlsRef.current.forEach((c) => c.stop());
    };
  }, []);

  if (!mounted || !target) return null;

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
  target: Target | null;
  state: MorphState;
  themes: DownloadTheme[];
  open: boolean;
  onClose: () => void;
}

function PortalPanel({ target, state, themes, open, onClose }: PortalPanelProps) {
  const t = useTranslations("cv");
  const prefersReducedMotion = useReducedMotion();
  const mounted = useHasMounted();

  // Close on Escape for keyboard users.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!mounted || !target) return null;

  // Anchor: top slot drops the panel below the button; bottom + fab raise
  // it above. For all slots we align the panel's inline-end with the
  // button's inline-end (for a rightward FAB) OR its inline-start (for a
  // leftward inline button). We approximate "inline-end alignment" by
  // aligning `right` to the button's right in LTR; in RTL the same logic
  // still reads as "anchor to the nearer edge" because the page is
  // mirrored via `dir="rtl"` and `end-*` utilities. Since we're using
  // `left` here (not `inset-inline-end`), we compute both for clarity.
  const panelWidth = 256; // w-64
  const verticalGap = 12;

  let panelTop: number;
  let panelLeft: number;

  if (state === "top") {
    panelTop = target.top + target.height + verticalGap;
    panelLeft = target.left;
  } else if (state === "fab") {
    // FAB is at the far end; panel rises above and aligns its right edge
    // with the FAB's right edge so it reads from the button downward.
    panelTop = target.top - verticalGap - 260; // approx panel height
    panelLeft = target.left + target.width - panelWidth;
  } else {
    // bottom slot — inline; panel rises above its inline-start.
    panelTop = target.top - verticalGap - 260;
    panelLeft = target.left;
  }

  // Clamp inside viewport.
  if (typeof window !== "undefined") {
    panelLeft = Math.max(16, Math.min(panelLeft, window.innerWidth - panelWidth - 16));
    panelTop = Math.max(16, panelTop);
  }

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
            width: panelWidth,
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
  // window scroll/resize. Stored here so we can compute the active target
  // without lifting each slot into Redux-like state.
  const [topRect, setTopRect] = useState<LayoutRect | null>(null);
  const [bottomRect, setBottomRect] = useState<LayoutRect | null>(null);

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
  // Resolve the target rect the portal button should occupy right now.
  // Derives the FAB target from the ChatLayoutContext, falling back to a
  // viewport-anchored default when the chat widget isn't mounted.
  // ---------------------------------------------------------------------------
  const { buttonRect: chatButton, dialogRect: chatDialog, isOpen: chatOpen } = useChatLayout();

  const target: Target | null = useMemo(() => {
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
    // fab — derive vertical position from the chat widget's live rect.
    // Priority: dialog (if open) > button > pre-hydration fallback.
    if (typeof window === "undefined") return null;
    const vh = window.innerHeight;
    const vw = window.innerWidth;

    let bottomPx: number;
    let rightPx: number;
    if (chatOpen && chatDialog) {
      // 20 px above the dialog, right-aligned with it.
      bottomPx = vh - chatDialog.top + 20;
      rightPx = vw - chatDialog.right;
    } else if (chatButton) {
      // FAB_GAP px above the chat button, right-aligned with it.
      bottomPx = vh - chatButton.top + FAB_GAP;
      rightPx = vw - chatButton.right;
    } else {
      // No chat rect yet (pre-hydration / no chat feature): match the
      // legacy CvDownloadFab's `bottom: 6rem` default so we're safely
      // ABOVE the chat widget's standard `bottom-6 end-6` slot on first
      // paint. Fixes the collision reported in #46.
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
  }, [state, topRect, bottomRect, chatButton, chatDialog, chatOpen]);

  const value = useMemo<MorphContextValue>(
    () => ({
      state,
      target,
      panelOpen,
      setPanelOpen,
      setTopRect,
      setBottomRect,
      setTopSentinel,
      setBottomSentinel,
      themes,
      label: resolvedLabel,
    }),
    [state, target, panelOpen, setPanelOpen, themes, resolvedLabel],
  );

  return (
    <MorphContext.Provider value={value}>
      {children}
      <PortalButton
        target={target}
        state={state}
        label={resolvedLabel}
        panelOpen={panelOpen}
        onClick={() => setPanelOpen(!panelOpen)}
      />
      <PortalPanel
        target={target}
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
