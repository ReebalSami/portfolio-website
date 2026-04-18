"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import type { TimelineEntry as TimelineEntryData } from "@/content/timeline";
import { cn } from "@/lib/utils";

interface TimelineEntryProps {
  entry: TimelineEntryData;
  index: number;
}

const typeColors: Record<TimelineEntryData["type"], string> = {
  work: "bg-primary",
  education: "bg-gallery-warm",
  transition: "bg-gallery-warm-muted",
};

export function TimelineEntryCard({ entry, index }: TimelineEntryProps) {
  const [open, setOpen] = useState(false);
  const t = useTranslations("about");
  const prefersReducedMotion = useReducedMotion();
  const hasExpanded = Array.isArray(entry.expanded) && entry.expanded.length > 0;

  const inViewProps = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 20 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: "-50px" },
        transition: {
          duration: 0.5,
          delay: index * 0.08,
          ease: [0.22, 1, 0.36, 1] as const,
        },
      };

  const toggle = () => setOpen((v) => !v);

  return (
    <motion.div className="relative" {...inViewProps}>
      <div
        className={cn(
          "absolute -start-[2.6rem] top-1 h-3 w-3 rounded-full",
          typeColors[entry.type]
        )}
      />

      {hasExpanded ? (
        <div
          role="button"
          tabIndex={0}
          aria-expanded={open}
          aria-label={`${entry.title} — ${t("cardExpand")}`}
          onClick={toggle}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              toggle();
            }
          }}
          className="group flex items-start justify-between gap-3 -mx-2 rounded-lg px-2 py-1.5 cursor-pointer transition-colors hover:bg-gallery-warm/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gallery-warm"
        >
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-1">
              {entry.date}
            </p>
            <h4 className="font-medium">{entry.title}</h4>
            <p className="text-sm text-muted-foreground">{entry.company}</p>
            <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
              {entry.description}
            </p>
          </div>
          <span
            aria-hidden="true"
            className="shrink-0 mt-1 inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors group-hover:text-foreground group-hover:bg-gallery-warm/20"
          >
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform duration-200",
                open && "rotate-180"
              )}
            />
          </span>
        </div>
      ) : (
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-1">
              {entry.date}
            </p>
            <h4 className="font-medium">{entry.title}</h4>
            <p className="text-sm text-muted-foreground">{entry.company}</p>
            <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
              {entry.description}
            </p>
          </div>
        </div>
      )}

      {hasExpanded && (
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              key="expanded"
              initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
              animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, height: "auto" }}
              exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] as const }}
              className="overflow-hidden"
            >
              <ul className="mt-3 space-y-2 border-s-2 border-gallery-warm/40 ps-4">
                {entry.expanded!.map((item) => (
                  <li
                    key={item}
                    className="text-sm text-muted-foreground leading-relaxed flex gap-2"
                  >
                    <span className="text-gallery-warm mt-1.5 shrink-0">▸</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </motion.div>
  );
}
