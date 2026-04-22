"use client";

/**
 * ChatLayoutContext — publishes the live bounding rects of the chat widget's
 * button and dialog (plus its open state) so any other fixed/floating UI
 * element on the page can position itself *relative to* the chat without
 * brittle DOM queries.
 *
 * Originally written so the CV MorphingDownloadCta FAB can sit above the
 * chat button (when closed) or above the chat dialog (when open), at every
 * viewport size, without colliding — independent of mount order and
 * z-index. The previous cv-download-fab.tsx did this with a
 * `document.querySelector("[class*='fixed bottom-24 end-6']...")` + a
 * global MutationObserver on document.body, which is fragile (breaks if
 * chat-widget's Tailwind classes change) and expensive (mutation events
 * fire on every keystroke in the chat input).
 *
 * Usage:
 *
 *   // In root layout:
 *   <ChatLayoutProvider>
 *     <Header /> <main>...</main> <ChatWidget /> <Footer />
 *   </ChatLayoutProvider>
 *
 *   // In ChatWidget:
 *   const buttonRef = useRef<HTMLButtonElement>(null);
 *   const dialogRef = useRef<HTMLDivElement>(null);
 *   useRegisterChatButton(buttonRef);
 *   useRegisterChatDialog(dialogRef, open);  // open = isOpen boolean
 *
 *   // In MorphingDownloadCta:
 *   const { buttonRect, dialogRect, isOpen } = useChatLayout();
 *
 * The rects update on:
 *   - mount / unmount                          (ref callback effect)
 *   - element size change                      (ResizeObserver)
 *   - window scroll / resize                   (rAF-throttled listeners)
 *   - chat dialog open/close                   (tracked via isOpen state)
 *
 * If the provider is missing (e.g. pages without chat), all hooks return
 * null/false so consumers can fall back gracefully.
 */

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";

// =============================================================================
// Types
// =============================================================================

/**
 * A plain rect snapshot. We don't expose the live DOMRect instance because
 * consumers expect stable object identity across re-renders when nothing
 * has changed; comparing DOMRect by reference would always be fresh.
 */
export interface LayoutRect {
  top: number;
  left: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}

interface ChatLayoutValue {
  /** Rect of the chat toggle button (always visible while chat is mounted). */
  buttonRect: LayoutRect | null;
  /** Rect of the chat dialog panel (non-null only while the chat is open). */
  dialogRect: LayoutRect | null;
  /** Is the chat dialog currently open? */
  isOpen: boolean;
  /**
   * Internal setters — exposed on the context value but intended for the
   * `useRegisterChat*` hooks below, not consumers.
   */
  _setButtonRect: (rect: LayoutRect | null) => void;
  _setDialogRect: (rect: LayoutRect | null) => void;
  _setIsOpen: (open: boolean) => void;
}

const NULL_VALUE: ChatLayoutValue = {
  buttonRect: null,
  dialogRect: null,
  isOpen: false,
  _setButtonRect: () => {},
  _setDialogRect: () => {},
  _setIsOpen: () => {},
};

const ChatLayoutContext = createContext<ChatLayoutValue>(NULL_VALUE);

// =============================================================================
// Provider
// =============================================================================

interface ProviderProps {
  children: ReactNode;
}

/**
 * Provider. Wrap the root layout with this (or any parent of both the chat
 * widget and any consumer of `useChatLayout`).
 */
export function ChatLayoutProvider({ children }: ProviderProps) {
  const [buttonRect, setButtonRect] = useState<LayoutRect | null>(null);
  const [dialogRect, setDialogRect] = useState<LayoutRect | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const value = useMemo<ChatLayoutValue>(
    () => ({
      buttonRect,
      dialogRect,
      isOpen,
      _setButtonRect: setButtonRect,
      _setDialogRect: setDialogRect,
      _setIsOpen: setIsOpen,
    }),
    [buttonRect, dialogRect, isOpen],
  );

  return <ChatLayoutContext.Provider value={value}>{children}</ChatLayoutContext.Provider>;
}

// =============================================================================
// Read hook
// =============================================================================

/**
 * Read the live chat layout. Safe to call in components that may render on
 * pages without the provider — in that case returns the NULL_VALUE defaults
 * (all nulls / false) so consumers can fall back.
 */
export function useChatLayout(): Pick<ChatLayoutValue, "buttonRect" | "dialogRect" | "isOpen"> {
  const ctx = useContext(ChatLayoutContext);
  return {
    buttonRect: ctx.buttonRect,
    dialogRect: ctx.dialogRect,
    isOpen: ctx.isOpen,
  };
}

// =============================================================================
// Register hooks — called from inside <ChatWidget />
// =============================================================================

/**
 * Helper: convert a DOMRect to our serialisable shape. Returning the same
 * object identity when nothing changed avoids unnecessary re-renders in
 * the provider's state; we do a shallow equality check against the
 * previous value before dispatching.
 */
function readRect(el: Element | null): LayoutRect | null {
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return {
    top: r.top,
    left: r.left,
    right: r.right,
    bottom: r.bottom,
    width: r.width,
    height: r.height,
  };
}

function rectsEqual(a: LayoutRect | null, b: LayoutRect | null): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  return (
    a.top === b.top &&
    a.left === b.left &&
    a.right === b.right &&
    a.bottom === b.bottom &&
    a.width === b.width &&
    a.height === b.height
  );
}

/**
 * Internal: start observing an element and publish its rect via the given
 * setter. Returns a cleanup. Handles ResizeObserver (size) + window scroll
 * + window resize (position). rAF-throttled so we never publish more than
 * once per animation frame.
 */
function observeElement(
  el: Element,
  setter: (rect: LayoutRect | null) => void,
  prevRef: { current: LayoutRect | null },
): () => void {
  let frame = 0;

  const publish = () => {
    const next = readRect(el);
    if (!rectsEqual(prevRef.current, next)) {
      prevRef.current = next;
      setter(next);
    }
  };

  const schedule = () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(publish);
  };

  // Immediate initial publish.
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
  };
}

/**
 * Observe a chat button ref and publish its rect to the context. Call this
 * from the ChatWidget component with the button ref.
 *
 * The button is assumed to always be mounted while the chat feature is
 * enabled, so we observe eagerly.
 */
export function useRegisterChatButton(ref: RefObject<HTMLElement | null>): void {
  const { _setButtonRect } = useContext(ChatLayoutContext);
  const prevRef = useRef<LayoutRect | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) {
      _setButtonRect(null);
      return;
    }
    const cleanup = observeElement(el, _setButtonRect, prevRef);
    return () => {
      cleanup();
      _setButtonRect(null);
      prevRef.current = null;
    };
    // ref is a ref object; its .current mutation is handled via the returned
    // cleanup when the component unmounts. We don't need to re-run on .current
    // changing because the ChatWidget button is stable for the widget's lifetime.
  }, [ref, _setButtonRect]);
}

/**
 * Observe a chat dialog ref and publish its rect + open state. Only active
 * while `isOpen` is true; when closed, clears the dialog rect and flips
 * `isOpen` off so consumers can choose "above the button" vs "above the
 * dialog" positioning.
 */
export function useRegisterChatDialog(
  ref: RefObject<HTMLElement | null>,
  isOpen: boolean,
): void {
  const { _setDialogRect, _setIsOpen } = useContext(ChatLayoutContext);
  const prevRef = useRef<LayoutRect | null>(null);

  useEffect(() => {
    _setIsOpen(isOpen);
    if (!isOpen) {
      _setDialogRect(null);
      prevRef.current = null;
      return;
    }
    const el = ref.current;
    if (!el) return;
    const cleanup = observeElement(el, _setDialogRect, prevRef);
    return () => {
      cleanup();
      // Keep isOpen=true if effect cleans up during a re-render while still
      // open; the next effect will re-publish. Only `open === false` clears.
    };
  }, [ref, isOpen, _setDialogRect, _setIsOpen]);
}
