"use client";

import { useTranslations, useLocale } from "next-intl";
import { Briefcase, Brain, Globe, GraduationCap } from "lucide-react";
import { SectionHeading } from "@/components/shared/section-heading";
import { TechMarquee } from "@/components/shared/tech-marquee";
import { DifferentiatorCard } from "@/components/cards/differentiator-card";
import { TimelineEntryCard } from "@/components/cards/timeline-entry";
import { TransitionLink } from "@/components/shared/transition-link";
import { CompactJourney } from "@/components/journey/compact-journey";
import { timelineData } from "@/content/timeline";
import { techStackData } from "@/content/tech-stack";
import type { JourneyLocale } from "@/content/journey";

const differentiatorKeys = [
  { icon: Briefcase, key: "business" as const },
  { icon: Brain, key: "builder" as const },
  { icon: Globe, key: "multilingual" as const },
  { icon: GraduationCap, key: "education" as const },
];

interface AboutSectionProps {
  downloadCvEnabled: boolean;
  /**
   * Plumbed from `features.compactTimeline` in the page server-component.
   * - `false` → render the legacy vertical `TimelineEntryCard` list inside
   *   the Journey subsection (current production behaviour).
   * - `true`  → render the new horizontal `<CompactJourney />` carousel.
   *
   * Either way, the About section is split into three anchored
   * subsections (`#who`, `#journey`, `#tech`) that the new About nav
   * dropdown can target.
   */
  compactTimelineEnabled: boolean;
}

export function AboutSection({
  downloadCvEnabled,
  compactTimelineEnabled,
}: AboutSectionProps) {
  const t = useTranslations("about");
  const tBtn = useTranslations("common.buttons");
  const locale = useLocale();
  const journeyLocale = locale as JourneyLocale;
  const isRtl = locale === "ar";

  return (
    <div className="space-y-20">
      {/*
       * Block 1: WHO  —  intro + differentiators.
       * Anchor `#who` is the target of the About → Who dropdown item
       * AND keeps the existing `#about` parent anchor that everything
       * inside this section relies on.
       */}
      <div id="who" className="scroll-mt-20">
        <SectionHeading title={t("title")} subtitle={t("subtitle")} />
        <div className="max-w-2xl space-y-4">
          <p className="text-muted-foreground leading-relaxed">
            {t("summary1")}
          </p>
          <p className="text-muted-foreground leading-relaxed">
            {t("summary2")}
          </p>
        </div>

        <div className="mt-12">
          <h3 className="text-sm font-medium uppercase tracking-widest text-muted-foreground mb-6">
            {t("differentiators")}
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {differentiatorKeys.map((item, i) => (
              <DifferentiatorCard
                key={item.key}
                cardKey={item.key}
                icon={item.icon}
                index={i}
              />
            ))}
          </div>
        </div>
      </div>

      {/*
       * Block 2: JOURNEY  —  the timeline. Flag-gated:
       *   compactTimelineEnabled = false → legacy vertical list (no change)
       *   compactTimelineEnabled = true  → new cinematic horizontal carousel
       *
       * `scroll-mt-20` accounts for the sticky header height so the
       * heading stays in view when the dropdown scrolls here.
       */}
      <div id="journey" className="scroll-mt-20">
        <h3 className="text-sm font-medium uppercase tracking-widest text-muted-foreground mb-4">
          {t("timeline")}
        </h3>
        {compactTimelineEnabled ? (
          <CompactJourney locale={journeyLocale} isRtl={isRtl} />
        ) : (
          <div className="relative ms-4 border-s-2 border-border ps-8 space-y-8">
            {timelineData.map((entry, i) => (
              <TimelineEntryCard
                key={entry.date + entry.title}
                entry={entry}
                index={i}
              />
            ))}
          </div>
        )}
      </div>

      {/*
       * Block 3: TECH  —  tech stack marquees.
       * `data-section="tech-stack"` retained for any existing analytics /
       * scroll selectors that might depend on it.
       */}
      <div id="tech" data-section="tech-stack" className="scroll-mt-20">
        <h3 className="text-sm font-medium uppercase tracking-widest text-muted-foreground mb-6">
          {t("techStack")}
        </h3>
        <div className="space-y-6">
          {techStackData.map((group, i) => (
            <TechMarquee
              key={group.label}
              group={group}
              index={i}
              isRtl={isRtl}
            />
          ))}
        </div>
      </div>

      {downloadCvEnabled && (
        <div className="pt-2">
          <TransitionLink
            href="/cv"
            className="group inline-flex items-baseline gap-1.5 text-xs font-heading uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors"
          >
            <span className="border-b border-foreground/40 group-hover:border-[var(--accent-warm-fg)] transition-colors pb-0.5">
              {tBtn("viewCV")}
            </span>
            <span
              aria-hidden="true"
              className="rtl:rotate-180 transition-transform group-hover:translate-x-0.5 motion-reduce:group-hover:translate-x-0"
            >
              →
            </span>
          </TransitionLink>
        </div>
      )}
    </div>
  );
}
