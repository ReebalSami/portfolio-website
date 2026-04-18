"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { useBlogGalleryItem } from "./gallery-provider";
import { cn } from "@/lib/utils";

interface PolaroidProps {
  src: string;
  alt: string;
  caption?: string;
  rotate?: number;
  align?: "left" | "center" | "right";
  width?: number;
  height?: number;
}

/**
 * Polaroid-style photo block for memoir-voice blog posts.
 * Tilted frame, soft shadow, handwritten-style caption (Caveat fallback to italic serif),
 * scroll-reveal with slight rotation. Click opens a full-screen lightbox (shared
 * gallery provided by <GalleryProvider> at the blog page level).
 *
 * Caption flows in normal document order so the paper frame grows to contain
 * multi-line captions cleanly.
 */
export function Polaroid({
  src,
  alt,
  caption,
  rotate = -2,
  align = "center",
  width = 1600,
  height = 1200,
}: PolaroidProps) {
  const prefersReducedMotion = useReducedMotion();
  const { open, isEnabled } = useBlogGalleryItem({
    src,
    alt,
    caption,
    width,
    height,
    thumbSrc: src,
  });

  const alignClass =
    align === "left"
      ? "mr-auto"
      : align === "right"
      ? "ml-auto"
      : "mx-auto";

  return (
    <motion.figure
      initial={
        prefersReducedMotion
          ? { opacity: 1, rotate }
          : { opacity: 0, y: 20, rotate: rotate - 3 }
      }
      animate={{ opacity: 1, y: 0, rotate }}
      transition={{
        duration: prefersReducedMotion ? 0 : 0.65,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={cn(
        "not-prose my-12 block max-w-sm sm:max-w-md",
        alignClass
      )}
    >
      <div className="rounded-[2px] bg-background p-3 pb-4 shadow-[0_10px_30px_-8px_rgba(0,0,0,0.25)] ring-1 ring-border/60 dark:shadow-[0_14px_40px_-10px_rgba(0,0,0,0.65)]">
        <button
          type="button"
          onClick={open}
          aria-label={`Open photo: ${alt}`}
          className="group block w-full overflow-hidden bg-muted/40 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
        >
          <div className={isEnabled ? "cursor-zoom-in" : "cursor-default"}>
            <Image
              src={src}
              alt={alt}
              width={width}
              height={height}
              sizes="(min-width: 640px) 448px, 90vw"
              className="block h-auto w-full transition-transform duration-300 group-hover:scale-[1.02]"
            />
          </div>
        </button>
        {caption ? (
          <figcaption
            className="mt-3 px-2 pb-1 text-center text-xl leading-snug text-foreground/90"
            style={{
              fontFamily:
                "var(--font-handwritten), 'Caveat', 'Kalam', 'Patrick Hand', ui-sans-serif, system-ui, cursive",
            }}
          >
            {caption}
          </figcaption>
        ) : null}
      </div>
    </motion.figure>
  );
}
