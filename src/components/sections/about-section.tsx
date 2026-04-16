"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import { Briefcase, Brain, Globe, GraduationCap } from "lucide-react";
import { SectionHeading } from "@/components/shared/section-heading";
import { TechBadge } from "@/components/shared/tech-badge";
import { Card, CardContent } from "@/components/ui/card";
import { timelineData, type TimelineEntry } from "@/content/timeline";
import { techStackData } from "@/content/tech-stack";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const differentiatorKeys = [
  { icon: Briefcase, key: "business" },
  { icon: Brain, key: "builder" },
  { icon: Globe, key: "multilingual" },
  { icon: GraduationCap, key: "education" },
] as const;

const typeColors: Record<TimelineEntry["type"], string> = {
  work: "bg-primary",
  education: "bg-gallery-warm",
  transition: "bg-gallery-warm-muted",
};

interface AboutSectionProps {
  downloadCvEnabled: boolean;
}

export function AboutSection({ downloadCvEnabled }: AboutSectionProps) {
  const t = useTranslations("about");
  const tBtn = useTranslations("common.buttons");
  const locale = useLocale();
  const prefersReducedMotion = useReducedMotion();

  const inViewProps = prefersReducedMotion
    ? {}
    : {
        variants: fadeUp,
        initial: "hidden" as const,
        whileInView: "visible" as const,
        viewport: { once: true, margin: "-50px" },
      };

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
            <motion.div
              key={item.key}
              {...inViewProps}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="h-full">
                <CardContent className="flex gap-4 pt-6">
                  <div className="shrink-0 flex h-10 w-10 items-center justify-center rounded-lg bg-gallery-warm/20">
                    <item.icon className="h-5 w-5 text-foreground" />
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">{t(`cards.${item.key}.title`)}</h4>
                    <p className="text-sm text-muted-foreground">
                      {t(`cards.${item.key}.description`)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium uppercase tracking-widest text-muted-foreground mb-6">
          {t("timeline")}
        </h3>
        <div className="relative ms-4 border-s-2 border-border ps-8 space-y-8">
          {timelineData.map((entry, i) => (
            <motion.div
              key={entry.date + entry.title}
              className="relative"
              {...inViewProps}
              transition={{ delay: i * 0.08 }}
            >
              <div
                className={`absolute -start-[2.6rem] top-1 h-3 w-3 rounded-full ${typeColors[entry.type]}`}
              />
              <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-1">
                {entry.date}
              </p>
              <h4 className="font-medium">{entry.title}</h4>
              <p className="text-sm text-muted-foreground">{entry.company}</p>
              <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                {entry.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium uppercase tracking-widest text-muted-foreground mb-6">
          {t("techStack")}
        </h3>
        <div className="space-y-6">
          {techStackData.map((group) => (
            <div key={group.label}>
              <p className="text-xs font-medium text-muted-foreground mb-2">
                {group.label}
              </p>
              <div className="flex flex-wrap gap-2">
                {group.skills.map((skill) => (
                  <TechBadge
                    key={skill.name}
                    name={skill.name}
                    category={skill.category}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {downloadCvEnabled && (
        <div className="pt-2">
          <a
            href={`/${locale}/cv`}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground underline underline-offset-4 decoration-muted-foreground/40 hover:text-foreground hover:decoration-foreground/60 transition-colors"
          >
            {tBtn("viewCV")}
            <span aria-hidden="true" className="text-xs">&rarr;</span>
          </a>
        </div>
      )}
    </div>
  );
}
