"use client";

import { motion } from "framer-motion";
import { Briefcase, Brain, Globe, GraduationCap } from "lucide-react";
import { SectionHeading } from "@/components/shared/section-heading";
import { TechBadge } from "@/components/shared/tech-badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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

const differentiators = [
  {
    icon: Briefcase,
    title: "Business × Data",
    description:
      "5 years at Otto Group in corporate finance, now merging business acumen with AI/ML engineering.",
  },
  {
    icon: Brain,
    title: "End-to-End Builder",
    description:
      "From concept to MVP — multi-agent B2B pipeline that reduced manual workload by 53%.",
  },
  {
    icon: Globe,
    title: "Multilingual",
    description:
      "German (C1), English (fluent), Arabic (native), Spanish (elementary), French (elementary).",
  },
  {
    icon: GraduationCap,
    title: "M.Sc. Candidate",
    description:
      "Data Science & AI at FH Wedel — deep learning, NLP, computer vision, econometrics.",
  },
];

const typeColors: Record<TimelineEntry["type"], string> = {
  work: "bg-primary",
  education: "bg-gallery-warm",
  transition: "bg-gallery-warm-muted",
};

interface AboutSectionProps {
  downloadCvEnabled: boolean;
}

export function AboutSection({ downloadCvEnabled }: AboutSectionProps) {
  return (
    <div className="space-y-20">
      <div>
        <SectionHeading title="About" subtitle="Who I Am" />
        <div className="max-w-2xl space-y-4">
          <p className="text-muted-foreground leading-relaxed">
            Data Scientist and AI Engineer merging 5 years of corporate finance
            experience (Otto Group) with cutting-edge AI/ML skills. M.Sc.
            candidate in Data Science & AI at FH Wedel.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Proven end-to-end delivery — from multi-agent B2B sales pipelines
            to plant health detection with deep learning. I build intelligent
            solutions that create measurable business impact.
          </p>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium uppercase tracking-widest text-muted-foreground mb-6">
          What Sets Me Apart
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {differentiators.map((item, i) => (
            <motion.div
              key={item.title}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="h-full">
                <CardContent className="flex gap-4 pt-6">
                  <div className="shrink-0 flex h-10 w-10 items-center justify-center rounded-lg bg-gallery-warm/20">
                    <item.icon className="h-5 w-5 text-foreground" />
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">{item.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {item.description}
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
          Career Journey
        </h3>
        <div className="relative ms-4 border-s-2 border-border ps-8 space-y-8">
          {timelineData.map((entry, i) => (
            <motion.div
              key={entry.date + entry.title}
              className="relative"
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
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
          Tech Stack
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
        <div>
          <Button
            size="lg"
            className="cursor-pointer"
            nativeButton={false}
            render={<a href="/cv.pdf" download />}
          >
            Download CV
          </Button>
        </div>
      )}
    </div>
  );
}
