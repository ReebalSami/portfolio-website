"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { TransitionLink } from "@/components/shared/transition-link";
import {
  resolveJourneyString,
  type JourneyEntry,
  type JourneyLocale,
} from "@/content/journey";
import { JourneyScrubber } from "./journey-scrubber";

/**
 * Mobile journey variant — vertical stack with a fixed-width scrubber.
 *
 * Below `md:` (768 px) the desktop horizontal carousel does not fit. We
 * trade the curved-path drama for a clean focused view: the active card
 * sits in the centre, full-fidelity, and the user picks entries from a
 * fixed-width 320 px scrubber at the bottom.
 *
 * Why a scrubber instead of the previous scrollable mini-rail:
 *   - The mini-rail (6 × 80 px = 500 px of content) overflows any mobile
 *     viewport and got cut at the inline edge in both LTR (right edge)
 *     and RTL (left edge) per user feedback v3.
 *   - The mini-rail had no step-wise click — only direct-jump on each
 *     dot. The user wants "click on rail = step" parity with desktop.
 *   - Reusing `<JourneyScrubber showDots />` gives mobile the same
 *     interaction grammar as desktop (year labels above = direct-jump,
 *     rail click strip = step-wise) while keeping the visible per-year
 *     dots that match the desktop timeline's <JourneyNode> styling.
 *
 * Receives `active` + `setActive` from the parent so state stays
 * synchronised between mobile and desktop layouts (only one is visible
 * at a time, but if the user resizes mid-session they see the same
 * entry focused).
 */

interface JourneyMobileProps {
  entries: JourneyEntry[];
  locale: JourneyLocale;
  active: number;
  setActive: (i: number) => void;
  /** RTL flag from the page so the scrubber mirrors correctly. */
  isRtl: boolean;
}

export function JourneyMobile({ entries, locale, active, setActive, isRtl }: JourneyMobileProps) {
  const tBtn = useTranslations("common.buttons");
  const tFull = useTranslations("about.journey");
  const tAria = useTranslations("about.journey.aria");
  const count = entries.length;
  const entry = entries[active];

  const chapter = resolveJourneyString(entry.chapter, locale);
  const tagline = resolveJourneyString(entry.tagline, locale);

  const goPrev = () => setActive(Math.max(active - 1, 0));
  const goNext = () => setActive(Math.min(active + 1, count - 1));
  const atStart = active === 0;
  const atEnd = active === count - 1;

  return (
    <div className="relative w-full">
      {/* Active card */}
      <div
        className="relative px-4 text-center"
        role="region"
        aria-roledescription="carousel"
        aria-label={tAria("carousel")}
      >
        <div className="font-heading text-[10px] tracking-[0.3em] text-muted-foreground uppercase mb-2">
          <span className="opacity-70">·</span>{" "}
          <span>{chapter}</span>{" "}
          <span className="opacity-70">·</span>
        </div>
        <div className="font-sans text-[11px] tracking-[0.18em] text-[var(--accent-warm-fg)] uppercase mb-2">
          {entry.yearRange}
        </div>
        <h3 className="font-heading text-xl font-semibold leading-tight uppercase tracking-tight text-foreground mb-1.5">
          {entry.role}
        </h3>
        <div className="font-sans text-[13px] text-muted-foreground mb-3.5">
          <span>{entry.org}</span>{" "}
          <span className="opacity-50">·</span>{" "}
          <span className="opacity-70">{entry.place}</span>
        </div>
        <p className="font-sans text-[13.5px] italic leading-snug text-foreground/85 max-w-prose mx-auto">
          &ldquo;{tagline}&rdquo;
        </p>
      </div>

      {/* Scrubber — 320 px wide, fits any mobile viewport, fixed inset.
          Year labels above = direct-jump; click strip on rail = step-wise;
          per-entry dots (showDots) = direct-jump. Same interaction grammar
          as desktop. */}
      <div className="mt-8 flex justify-center">
        <JourneyScrubber
          entries={entries}
          active={active}
          goPrev={goPrev}
          goNext={goNext}
          setActive={setActive}
          direction={isRtl ? "rtl" : "ltr"}
          showDots
        />
      </div>

      {/* Bottom controls: counter + arrow nav + view-cv link */}
      <div className="mt-6 flex flex-col items-center gap-4 px-4">
        <div className="flex items-center justify-between w-full max-w-xs">
          <div className="font-heading text-[11px] tracking-[0.25em] text-muted-foreground">
            <span className="text-[var(--accent-warm-fg)]">
              {String(active + 1).padStart(2, "0")}
            </span>
            <span className="opacity-50"> / {String(count).padStart(2, "0")}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={goPrev}
              disabled={atStart}
              aria-label={tAria("previous")}
              className="size-10 grid place-items-center rounded-sm border border-foreground/20 text-muted-foreground hover:text-[var(--accent-warm-fg)] hover:border-[var(--accent-warm-fg)] disabled:opacity-25 disabled:hover:text-muted-foreground disabled:hover:border-foreground/20 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeftIcon className="size-4 rtl:rotate-180" />
            </button>
            <button
              type="button"
              onClick={goNext}
              disabled={atEnd}
              aria-label={tAria("next")}
              className="size-10 grid place-items-center rounded-sm border border-foreground/20 text-muted-foreground hover:text-[var(--accent-warm-fg)] hover:border-[var(--accent-warm-fg)] disabled:opacity-25 disabled:hover:text-muted-foreground disabled:hover:border-foreground/20 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRightIcon className="size-4 rtl:rotate-180" />
            </button>
          </div>
        </div>

        <TransitionLink
          href="/cv"
          className="group inline-flex items-baseline gap-1.5 text-xs font-heading uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors"
          aria-label={tBtn("viewCV")}
        >
          <span className="border-b border-foreground/40 group-hover:border-[var(--accent-warm-fg)] transition-colors pb-0.5">
            {tFull("viewFullCv")}
          </span>
          <span aria-hidden="true" className="rtl:rotate-180">
            →
          </span>
        </TransitionLink>
      </div>
    </div>
  );
}
