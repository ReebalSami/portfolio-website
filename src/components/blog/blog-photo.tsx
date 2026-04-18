"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { useBlogGalleryItem } from "./gallery-provider";

interface BlogPhotoProps {
  src: string;
  alt: string;
  caption?: string;
  width?: number;
  height?: number;
  priority?: boolean;
}

/**
 * Editorial photo block for blog posts.
 * Soft-framed image + italic caption, subtle scroll-reveal.
 * Optimized via next/image. Click opens a full-screen lightbox (shared
 * gallery provided by <GalleryProvider> at the blog page level).
 */
export function BlogPhoto({
  src,
  alt,
  caption,
  width = 1600,
  height = 1200,
  priority = false,
}: BlogPhotoProps) {
  const prefersReducedMotion = useReducedMotion();
  const { open, isEnabled } = useBlogGalleryItem({
    src,
    alt,
    caption,
    width,
    height,
    thumbSrc: src,
  });

  return (
    <motion.figure
      initial={prefersReducedMotion ? undefined : { opacity: 0, y: 14 }}
      whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="not-prose my-10"
    >
      <button
        type="button"
        onClick={open}
        aria-label={`Open photo: ${alt}`}
        className="group block w-full overflow-hidden rounded-xl border border-border bg-muted/30 text-left shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
      >
        <div className={isEnabled ? "cursor-zoom-in" : "cursor-default"}>
          <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            priority={priority}
            sizes="(min-width: 1024px) 768px, 100vw"
            className="block h-auto w-full transition-transform duration-300 group-hover:scale-[1.01]"
          />
        </div>
      </button>
      {caption ? (
        <figcaption className="mt-3 text-sm italic text-muted-foreground text-center">
          {caption}
        </figcaption>
      ) : null}
    </motion.figure>
  );
}
