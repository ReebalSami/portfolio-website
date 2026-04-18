"use client";

import type { ReactNode } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import Lightbox, {
  type ControllerRef,
  type Slide,
  type ZoomRef,
} from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";
import "yet-another-react-lightbox/styles.css";

interface GalleryProviderProps {
  children: ReactNode;
}

interface GalleryItemInput {
  src: string;
  alt: string;
  caption?: string;
  width?: number;
  height?: number;
  thumbSrc?: string;
}

interface GalleryEntry extends GalleryItemInput {
  id: string;
}

interface GalleryContextValue {
  registerItem: (id: string, item: GalleryItemInput) => void;
  unregisterItem: (id: string) => void;
  openItem: (id: string) => void;
}

const GalleryContext = createContext<GalleryContextValue | null>(null);

/**
 * Hook for blog image components to register themselves in the shared gallery.
 * If used outside `GalleryProvider`, the opener is a safe no-op.
 */
export function useBlogGalleryItem(item: GalleryItemInput) {
  const context = useContext(GalleryContext);
  const id = useId();

  const stableItem = useMemo(
    () => ({
      src: item.src,
      alt: item.alt,
      caption: item.caption,
      width: item.width,
      height: item.height,
      thumbSrc: item.thumbSrc,
    }),
    [item.alt, item.caption, item.height, item.src, item.thumbSrc, item.width]
  );

  useEffect(() => {
    if (!context) return;

    context.registerItem(id, stableItem);
    return () => {
      context.unregisterItem(id);
    };
  }, [context, id, stableItem]);

  const open = useCallback(() => {
    context?.openItem(id);
  }, [context, id]);

  return {
    open,
    isEnabled: Boolean(context),
  };
}

interface LightboxChromeProps {
  entries: readonly GalleryEntry[];
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  onJump: (target: number) => void;
}

function LightboxChrome({
  entries,
  index,
  onClose,
  onPrev,
  onNext,
  onJump,
}: LightboxChromeProps) {
  const count = entries.length;
  const caption = entries[index]?.caption ?? null;

  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 top-0 z-[60] flex items-start justify-between gap-4 p-4 md:p-6">
        <span className="pointer-events-auto select-none text-xs font-medium tabular-nums tracking-wide text-white/70 md:text-sm">
          {String(index + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
        </span>

        <div className="pointer-events-none flex min-h-[1.5rem] flex-1 items-center justify-center">
          <AnimatePresence mode="wait">
            {caption ? (
              <motion.p
                key={index}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                className="pointer-events-auto max-w-[32rem] text-center text-lg leading-snug text-white/90 md:text-xl"
                style={{
                  fontFamily:
                    "var(--font-handwritten), 'Caveat', 'Kalam', 'Patrick Hand', ui-sans-serif, system-ui, cursive",
                }}
              >
                {caption}
              </motion.p>
            ) : null}
          </AnimatePresence>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="pointer-events-auto -m-2 rounded-full p-2 text-white/70 transition-colors hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
        >
          <X className="h-6 w-6" strokeWidth={1.75} />
        </button>
      </div>

      {count > 1 ? (
        <>
          <button
            type="button"
            onClick={onPrev}
            aria-label="Previous photo"
            className="pointer-events-auto fixed left-2 top-1/2 z-[60] -translate-y-1/2 rounded-full p-2 text-white/60 transition-all hover:scale-105 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 md:left-6"
          >
            <ChevronLeft className="h-8 w-8 md:h-10 md:w-10" strokeWidth={1.5} />
          </button>
          <button
            type="button"
            onClick={onNext}
            aria-label="Next photo"
            className="pointer-events-auto fixed right-2 top-1/2 z-[60] -translate-y-1/2 rounded-full p-2 text-white/60 transition-all hover:scale-105 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 md:right-6"
          >
            <ChevronRight className="h-8 w-8 md:h-10 md:w-10" strokeWidth={1.5} />
          </button>
        </>
      ) : null}

      {count > 1 ? (
        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex justify-center p-4 md:p-6">
          <div className="pointer-events-auto flex max-w-[92vw] gap-2 overflow-x-auto rounded-full bg-black/40 p-2 backdrop-blur-sm">
            {entries.map((entry, i) => (
              <button
                key={entry.id}
                type="button"
                onClick={() => onJump(i)}
                aria-label={`Go to photo ${i + 1}`}
                aria-current={i === index ? "true" : undefined}
                className={cn(
                  "relative block h-10 w-14 shrink-0 overflow-hidden rounded-md transition-all md:h-12 md:w-16",
                  i === index
                    ? "opacity-100 ring-2 ring-white"
                    : "opacity-55 hover:opacity-90"
                )}
              >
                {entry.thumbSrc ?? entry.src ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={entry.thumbSrc ?? entry.src}
                    alt=""
                    draggable={false}
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </>
  );
}

export function GalleryProvider({ children }: GalleryProviderProps) {
  const [entries, setEntries] = useState<GalleryEntry[]>([]);
  const entriesRef = useRef<GalleryEntry[]>(entries);
  const [isOpen, setIsOpen] = useState(false);
  const [index, setIndex] = useState(0);

  const controllerRef = useRef<ControllerRef | null>(null);
  const zoomRef = useRef<ZoomRef | null>(null);

  useEffect(() => {
    entriesRef.current = entries;
  }, [entries]);

  const safeIndex = useMemo(
    () => (entries.length === 0 ? 0 : Math.min(index, entries.length - 1)),
    [entries.length, index]
  );

  const registerItem = useCallback((id: string, item: GalleryItemInput) => {
    setEntries((current) => {
      const nextEntry: GalleryEntry = {
        id,
        ...item,
      };

      const existingIndex = current.findIndex((entry) => entry.id === id);
      if (existingIndex === -1) {
        return [...current, nextEntry];
      }

      const next = [...current];
      next[existingIndex] = nextEntry;
      return next;
    });
  }, []);

  const unregisterItem = useCallback((id: string) => {
    setEntries((current) => current.filter((entry) => entry.id !== id));
  }, []);

  const openItem = useCallback((id: string) => {
    const nextIndex = entriesRef.current.findIndex((entry) => entry.id === id);
    if (nextIndex === -1) return;

    setIndex(nextIndex);
    setIsOpen(true);
  }, []);

  const contextValue = useMemo<GalleryContextValue>(
    () => ({
      registerItem,
      unregisterItem,
      openItem,
    }),
    [openItem, registerItem, unregisterItem]
  );

  const slides = useMemo<Slide[]>(
    () =>
      entries.map((entry) => ({
        src: entry.src,
        alt: entry.alt,
        width: entry.width,
        height: entry.height,
      })),
    [entries]
  );

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handlePrev = useCallback(() => {
    controllerRef.current?.prev();
  }, []);

  const handleNext = useCallback(() => {
    controllerRef.current?.next();
  }, []);

  const handleJump = useCallback((target: number) => {
    setIndex(target);
  }, []);

  return (
    <GalleryContext.Provider value={contextValue}>
      {children}

      <Lightbox
        open={isOpen && slides.length > 0}
        close={handleClose}
        index={safeIndex}
        slides={slides}
        plugins={[Zoom]}
        on={{
          view: ({ index: nextIndex }) => setIndex(nextIndex),
          exited: () => {
            zoomRef.current?.changeZoom(1, true);
          },
        }}
        carousel={{
          finite: false,
          preload: 2,
          imageFit: "contain",
          spacing: "18%",
          padding: "16px",
        }}
        animation={{
          fade: 260,
          swipe: 320,
          navigation: 260,
          easing: {
            fade: "ease",
            swipe: "cubic-bezier(0.22, 1, 0.36, 1)",
            navigation: "cubic-bezier(0.22, 1, 0.36, 1)",
          },
        }}
        controller={{
          ref: controllerRef,
          closeOnBackdropClick: true,
          closeOnPullDown: true,
          closeOnPullUp: false,
          disableSwipeNavigation: false,
        }}
        zoom={{
          ref: zoomRef,
          maxZoomPixelRatio: 2,
          zoomInMultiplier: 2,
          wheelZoomDistanceFactor: 120,
          scrollToZoom: false,
        }}
        toolbar={{
          buttons: [],
        }}
        styles={{
          container: {
            backgroundColor: "rgba(0, 0, 0, 0.95)",
          },
        }}
        render={{
          buttonPrev: () => null,
          buttonNext: () => null,
          buttonClose: () => null,
          buttonZoom: () => null,
          iconZoomIn: () => null,
          iconZoomOut: () => null,
          controls: () => (
            <LightboxChrome
              entries={entries}
              index={safeIndex}
              onClose={handleClose}
              onPrev={handlePrev}
              onNext={handleNext}
              onJump={handleJump}
            />
          ),
        }}
      />
    </GalleryContext.Provider>
  );
}
