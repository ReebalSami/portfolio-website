"use client";

import { cn } from "@/lib/utils";
import {
  resolveJourneyString,
  type JourneyEntry,
  type JourneyLocale,
} from "@/content/journey";

/**
 * Journey card — editorial copy block that sits above or below the rail.
 *
 * Three render states:
 *   - active   → editorial layout (chapter caps, year range, role,
 *                org · place, tagline)
 *   - adjacent → year + role only, dimmed
 *   - inactive → fully transparent (still occupies space for layout)
 *
 * Pure presentational. All text comes from the entry data; locale-aware
 * fields (`chapter`, `tagline`) are resolved via `resolveJourneyString`.
 */

export type JourneyCardState = "active" | "adjacent" | "inactive";

interface JourneyCardProps {
  entry: JourneyEntry;
  state: JourneyCardState;
  locale: JourneyLocale;
  /**
   * `true` if this card sits *above* the rail (cards alternate above/below).
   * Used only for hairline accent on the active card; layout is the
   * caller's responsibility.
   */
  above?: boolean;
}

export function JourneyCard({ entry, state, locale, above = true }: JourneyCardProps) {
  const isAdjacent = state === "adjacent";

  if (state === "inactive") {
    // Render an empty placeholder so layout reserves the slot but nothing
    // shows. Avoids cumulative-layout-shift when we transition between
    // states via opacity + transform.
    return <div aria-hidden="true" className="opacity-0" />;
  }

  if (isAdjacent) {
    return (
      <div className="text-center select-none opacity-50 transition-opacity duration-500">
        <div className="font-heading text-[11px] tracking-[0.2em] text-[var(--accent-warm-fg)] uppercase mb-1.5 opacity-90">
          {entry.year}
        </div>
        <div className="font-heading text-[13px] font-medium uppercase tracking-[0.05em] text-foreground/80 max-w-[180px] mx-auto">
          {entry.role}
        </div>
      </div>
    );
  }

  // Active — full editorial layout.
  const chapter = resolveJourneyString(entry.chapter, locale);
  const tagline = resolveJourneyString(entry.tagline, locale);
  return (
    <div
      className="text-center select-none transition-all duration-500"
      style={{ maxWidth: 340 }}
    >
      {/* Chapter caps */}
      <div className="font-heading text-[10px] tracking-[0.3em] text-muted-foreground uppercase mb-3">
        <span className="opacity-70">·</span>{" "}
        <span>{chapter}</span>{" "}
        <span className="opacity-70">·</span>
      </div>

      {/* Year range */}
      <div className="font-sans text-[11px] tracking-[0.18em] text-[var(--accent-warm-fg)] uppercase mb-2.5">
        {entry.yearRange}
      </div>

      {/* Role */}
      <h3
        className={cn(
          "font-heading text-2xl font-semibold leading-tight uppercase tracking-tight text-foreground mb-1.5",
          // Subtle hairline accent under the active role; flips to top
          // edge when the card sits below the rail (above=false), for
          // visual tension toward the rail.
          above
            ? "after:mt-2 after:block after:h-px after:w-12 after:mx-auto after:bg-[var(--accent-warm-fg)]"
            : "before:mb-2 before:block before:h-px before:w-12 before:mx-auto before:bg-[var(--accent-warm-fg)]",
        )}
      >
        {entry.role}
      </h3>

      {/* Org · place */}
      <div className="font-sans text-[13px] text-muted-foreground mb-3.5">
        <span>{entry.org}</span>{" "}
        <span className="opacity-50">·</span>{" "}
        <span className="opacity-70">{entry.place}</span>
      </div>

      {/* Tagline (italic, editorial pull-quote feel) */}
      <p className="font-sans text-[13.5px] italic leading-snug text-foreground/85 max-w-[300px] mx-auto">
        &ldquo;{tagline}&rdquo;
      </p>
    </div>
  );
}
