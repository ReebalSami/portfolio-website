import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Polaroid } from "./polaroid";

interface SplitRowProps {
  /** Which side the photo floats to on `md+` breakpoint. Mobile stacks naturally. */
  side?: "photo-left" | "photo-right";
  /** Image path (served from /public). */
  src: string;
  /** Alt text for accessibility. */
  alt: string;
  /** Optional handwritten-style caption under the photo. */
  caption?: string;
  /**
   * Tilt angle in degrees. Defaults to a gentle -2°.
   * Accepts string because `next-mdx-remote/rsc` drops numeric JSX expression
   * props (`rotate={-3}`) — MDX call sites pass e.g. `rotate="-3"`, and we
   * coerce internally. TS callers can still pass numbers directly.
   */
  rotate?: number | string;
  /** The narrative paragraph(s). MDX-rendered. */
  children: ReactNode;
}

/**
 * Memoir-voice "photo floats inside text" row.
 * - Mobile: photo block above text (natural flow, no float).
 * - Desktop (md+): photo floats left/right, text wraps around it so vertical
 *   space is used efficiently — magazine-style editorial layout.
 *
 * `flow-root` on the outer container creates a block formatting context that
 * contains the float, so the next heading starts cleanly below the whole unit.
 *
 * Flat props API because MDX's `components` map does not resolve uppercase JSX
 * inside expression props — this mirrors the working `<BlogPhoto>` pattern.
 */
export function SplitRow({
  side = "photo-right",
  src,
  alt,
  caption,
  rotate = -2,
  children,
}: SplitRowProps) {
  const rotateNum =
    typeof rotate === "number" ? rotate : Number.parseFloat(rotate);
  const safeRotate = Number.isFinite(rotateNum) ? rotateNum : -2;

  const floatClass =
    side === "photo-left"
      ? "md:float-left md:mr-8 lg:mr-10"
      : "md:float-right md:ml-8 lg:ml-10";

  return (
    <div className="flow-root my-12 md:my-16">
      <div
        className={cn(
          "not-prose mb-6 md:mb-4 md:mt-1 md:w-[22rem] lg:w-[24rem]",
          floatClass
        )}
      >
        <Polaroid
          src={src}
          alt={alt}
          caption={caption}
          rotate={safeRotate}
        />
      </div>
      {children}
    </div>
  );
}
