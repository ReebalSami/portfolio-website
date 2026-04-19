"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

import { TechBadge } from "@/components/shared/tech-badge";
import type { TechCategory, TechSkill } from "@/content/tech-stack";
import { cn } from "@/lib/utils";

interface TechMarqueeProps {
  group: TechCategory;
  index: number;
  isRtl?: boolean;
  className?: string;
}

/**
 * Gap between badges within a marquee row (must match the Tailwind
 * `[--gap:0.5rem]` utility applied on the marquee container).
 */
const GAP_PX = 8;

/**
 * Safety margin subtracted from the container width when computing the
 * greedy row-pack, so the edge fade mask has visual breathing room.
 */
const EDGE_SAFETY_PX = 24;

/**
 * SSR-safe layout effect: uses `useLayoutEffect` on the client to avoid
 * a flash from the 1-row SSR fallback to the measured N-row layout, and
 * falls back to `useEffect` on the server where neither would actually
 * run anyway.
 */
const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

interface MarqueeRowProps {
  skills: TechSkill[];
  reverse: boolean;
  duration: number;
  subRowIndex: number;
}

function MarqueeRow({ skills, reverse, duration, subRowIndex }: MarqueeRowProps) {
  const renderTrack = (ariaHidden: boolean, trackKey: string) => (
    <ul
      key={trackKey}
      aria-hidden={ariaHidden || undefined}
      className={cn(
        "flex shrink-0 items-center gap-(--gap) list-none p-0 m-0 py-1",
        "animate-marquee",
        reverse && "[animation-direction:reverse]",
        // Pause the whole category on desktop mouse hover (group is on the
        // <section> ancestor) and on mobile touch-hold (data-touch-active on
        // the same section, toggled by React touch handlers).
        "group-hover:[animation-play-state:paused]",
        "group-data-[touch-active=true]:[animation-play-state:paused]",
      )}
    >
      {skills.map((skill) => (
        <li key={skill.name} className="shrink-0">
          <TechBadge name={skill.name} category={skill.category} />
        </li>
      ))}
    </ul>
  );

  return (
    <div
      data-subrow={subRowIndex}
      className={cn(
        "relative flex gap-(--gap) overflow-hidden",
        "[--gap:0.5rem]",
        "[mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]",
        "[-webkit-mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]",
      )}
      style={{ "--duration": `${duration}s` } as React.CSSProperties}
    >
      {renderTrack(false, "primary")}
      {renderTrack(true, "dup-1")}
      {renderTrack(true, "dup-2")}
    </div>
  );
}

/**
 * Infinite-scrolling marquee row for one tech-stack category.
 *
 * Design notes:
 * - SSR default renders a single row containing all skills — matches the
 *   hydrated first-paint and gives crawlers / no-JS users the canonical list.
 * - After mount, a client-side measurement step reads the natural width of
 *   every badge in the primary `<ul>` (widths are cached in a ref) and
 *   greedy-packs the skill list into as many sub-rows as needed so that
 *   every badge is visible on initial paint at the current viewport.
 * - A `ResizeObserver` re-runs the pack on container resize.
 * - The primary `<ul>` in each sub-row is the canonical list (read by
 *   crawlers, LLM scrapers, screen readers). The two duplicate tracks exist
 *   only for the seamless CSS loop and are marked `aria-hidden`.
 * - Scroll direction alternates per sub-row (even = forward, odd = reverse).
 *   In RTL locales the pattern is inverted so row 0 still "flows forward"
 *   relative to the reader. Sub-rows within the same category continue the
 *   same alternation so multi-row categories get a zigzag motion feel.
 * - Duration scales with each sub-row's own skill count so perceived speed
 *   stays similar across short and long rows.
 * - Pause-on-interaction is scoped to the whole category via Tailwind
 *   `group` on the <section>: hovering anywhere in the category (desktop
 *   mouse) pauses every sub-row in that category; touching-and-holding
 *   anywhere in the category (mobile) does the same via the
 *   `data-touch-active` attribute toggled by React touch handlers. Other
 *   categories keep scrolling throughout.
 * - The global `prefers-reduced-motion: reduce` rule in globals.css stops
 *   all animations, so no per-row override is needed here.
 */
export function TechMarquee({
  group,
  index,
  isRtl = false,
  className,
}: TechMarqueeProps) {
  // Base direction for the category (alternates by category index).
  const baseReverse = isRtl ? index % 2 === 0 : index % 2 === 1;

  // SSR default: one sub-row containing all skills. This also matches the
  // first client render, which is what the measurement step reads from.
  const [rows, setRows] = useState<TechSkill[][]>(() => [group.skills]);

  // Mobile touch-hold pause: true while a finger is down inside the section.
  const [touched, setTouched] = useState(false);
  const releaseTouch = () => setTouched(false);

  const containerRef = useRef<HTMLElement>(null);
  const cachedWidthsRef = useRef<number[] | null>(null);

  useIsoLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const measureAndSplit = () => {
      // 1. Ensure we have cached per-skill widths. On first run the primary
      //    <ul> still holds every skill (SSR shape), so we measure from it.
      if (
        cachedWidthsRef.current === null ||
        cachedWidthsRef.current.length !== group.skills.length
      ) {
        const primary = container.querySelector<HTMLUListElement>(
          "ul:not([aria-hidden])",
        );
        if (!primary) return;
        const items = primary.querySelectorAll<HTMLLIElement>("li");
        if (items.length !== group.skills.length) return;
        const widths = Array.from(items).map(
          (li) => li.getBoundingClientRect().width,
        );
        if (widths.some((w) => !Number.isFinite(w) || w <= 0)) return;
        cachedWidthsRef.current = widths;
      }

      // 2. Greedy-pack using cached widths and current container width.
      const containerWidth = container.clientWidth;
      if (containerWidth <= 0) return;
      const maxRowWidth = Math.max(containerWidth - EDGE_SAFETY_PX, 0);
      const widths = cachedWidthsRef.current;
      const packed: TechSkill[][] = [[]];
      let used = 0;
      group.skills.forEach((skill, i) => {
        const needed = widths[i] + GAP_PX;
        const currentRow = packed[packed.length - 1];
        if (currentRow.length > 0 && used + needed > maxRowWidth) {
          packed.push([]);
          used = 0;
        }
        packed[packed.length - 1].push(skill);
        used += needed;
      });

      // 3. Update state only when the shape actually changes, to avoid
      //    triggering an unnecessary re-render loop under ResizeObserver.
      setRows((prev) => (sameShape(prev, packed) ? prev : packed));
    };

    measureAndSplit();

    const ro = new ResizeObserver(() => measureAndSplit());
    ro.observe(container);
    return () => ro.disconnect();
  }, [group.skills]);

  const labelId = `tech-marquee-label-${group.category}`;

  return (
    <section
      ref={containerRef}
      aria-labelledby={labelId}
      className={cn(
        "tech-marquee-row group touch-manipulation",
        className,
      )}
      data-touch-active={touched || undefined}
      onTouchStart={() => setTouched(true)}
      onTouchEnd={releaseTouch}
      onTouchCancel={releaseTouch}
    >
      <p
        id={labelId}
        className="text-xs font-medium text-muted-foreground mb-2"
      >
        {group.label}
      </p>

      <div className="space-y-2">
        {rows.map((rowSkills, subIdx) => {
          // Alternate direction per sub-row, starting from the category's
          // base direction. Example (LTR, category index 0): sub-row 0 →,
          // sub-row 1 ←, sub-row 2 →.
          const rowReverse = subIdx % 2 === 0 ? baseReverse : !baseReverse;
          const duration = Math.max(30, Math.round(rowSkills.length * 3.5));
          return (
            <MarqueeRow
              key={subIdx}
              subRowIndex={subIdx}
              skills={rowSkills}
              reverse={rowReverse}
              duration={duration}
            />
          );
        })}
      </div>
    </section>
  );
}

function sameShape(a: TechSkill[][], b: TechSkill[][]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i].length !== b[i].length) return false;
    for (let j = 0; j < a[i].length; j++) {
      if (a[i][j].name !== b[i][j].name) return false;
    }
  }
  return true;
}
