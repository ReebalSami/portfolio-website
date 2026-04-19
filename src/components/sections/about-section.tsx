"use client";

import { useTranslations, useLocale } from "next-intl";
import { Briefcase, Brain, Globe, GraduationCap } from "lucide-react";
import { SectionHeading } from "@/components/shared/section-heading";
import { TechMarquee } from "@/components/shared/tech-marquee";
import { DifferentiatorCard } from "@/components/cards/differentiator-card";
import { TimelineEntryCard } from "@/components/cards/timeline-entry";
import { timelineData } from "@/content/timeline";
import { techStackData } from "@/content/tech-stack";

const differentiatorKeys = [
  { icon: Briefcase, key: "business" as const },
  { icon: Brain, key: "builder" as const },
  { icon: Globe, key: "multilingual" as const },
  { icon: GraduationCap, key: "education" as const },
];

interface AboutSectionProps {
  downloadCvEnabled: boolean;
}

export function AboutSection({ downloadCvEnabled }: AboutSectionProps) {
  const t = useTranslations("about");
  const tBtn = useTranslations("common.buttons");
  const locale = useLocale();

  return (
    <div className="space-y-20">
      <div>
        <SectionHeading title={t("title")} subtitle={t("subtitle")} />
        <div className="max-w-2xl space-y-4">
          <p className="text-muted-foreground leading-relaxed">
            {t("summary1")}
          </p>
          <p className="text-muted-foreground leading-relaxed">
            {t("summary2")}
          </p>
        </div>
      </div>

      <div>
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

      <div>
        <h3 className="text-sm font-medium uppercase tracking-widest text-muted-foreground mb-6">
          {t("timeline")}
        </h3>
        <div className="relative ms-4 border-s-2 border-border ps-8 space-y-8">
          {timelineData.map((entry, i) => (
            <TimelineEntryCard
              key={entry.date + entry.title}
              entry={entry}
              index={i}
            />
          ))}
        </div>
      </div>

      <div data-section="tech-stack">
        <h3 className="text-sm font-medium uppercase tracking-widest text-muted-foreground mb-6">
          {t("techStack")}
        </h3>
        <div className="space-y-6">
          {techStackData.map((group, i) => (
            <TechMarquee
              key={group.label}
              group={group}
              index={i}
              isRtl={locale === "ar"}
            />
          ))}
        </div>
      </div>

      {downloadCvEnabled && (
        <div className="pt-2">
          <a
            href={`/${locale}/cv`}
            className="group inline-flex items-baseline gap-2 text-base sm:text-lg font-black tracking-tight text-foreground transition-colors hover:text-foreground"
          >
            <span className="underline underline-offset-[6px] decoration-2 decoration-gallery-warm group-hover:decoration-[3px] group-hover:decoration-gallery-warm/90 transition-all">
              {tBtn("viewCV")}
            </span>
            <span
              aria-hidden="true"
              className="text-gallery-warm text-sm transition-transform duration-300 ease-out group-hover:translate-x-1.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
            >
              &rarr;
            </span>
          </a>
        </div>
      )}
    </div>
  );
}
