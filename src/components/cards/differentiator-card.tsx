"use client";

import { useState, type ComponentType } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DifferentiatorCardProps {
  cardKey: "business" | "builder" | "multilingual" | "education";
  icon: ComponentType<{ className?: string }>;
  index: number;
}

export function DifferentiatorCard({ cardKey, icon: Icon, index }: DifferentiatorCardProps) {
  const [open, setOpen] = useState(false);
  const t = useTranslations("about");
  const prefersReducedMotion = useReducedMotion();

  const title = t(`cards.${cardKey}.title`);
  const description = t(`cards.${cardKey}.description`);
  const expanded = t.raw(`cards.${cardKey}.expanded`) as string[] | undefined;
  const hasExpanded = Array.isArray(expanded) && expanded.length > 0;

  const inViewProps = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 20 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: "-50px" },
        transition: {
          duration: 0.5,
          delay: index * 0.1,
          ease: [0.22, 1, 0.36, 1] as const,
        },
      };

  return (
    <>
      <motion.div {...inViewProps}>
        <Card
          role={hasExpanded ? "button" : undefined}
          tabIndex={hasExpanded ? 0 : undefined}
          aria-haspopup={hasExpanded ? "dialog" : undefined}
          aria-expanded={hasExpanded ? open : undefined}
          aria-label={hasExpanded ? `${title}. ${t("cardExpand")}` : undefined}
          onClick={hasExpanded ? () => setOpen(true) : undefined}
          onKeyDown={
            hasExpanded
              ? (e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setOpen(true);
                  }
                }
              : undefined
          }
          className={
            hasExpanded
              ? "group h-full cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gallery-warm"
              : "h-full"
          }
        >
          <CardContent className="flex gap-4 pt-6">
            <div className="shrink-0 flex h-10 w-10 items-center justify-center rounded-lg bg-gallery-warm/20">
              <Icon className="h-5 w-5 text-foreground" />
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-medium mb-1">{title}</h4>
                {hasExpanded && (
                  <Plus
                    className="h-4 w-4 shrink-0 text-foreground opacity-0 scale-75 transition-all duration-200 ease-out group-hover:opacity-100 group-hover:scale-100 motion-reduce:opacity-100 motion-reduce:scale-100 motion-reduce:transition-none"
                    aria-hidden="true"
                  />
                )}
              </div>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {hasExpanded && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center gap-3 mb-1">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gallery-warm/20">
                  <Icon className="h-5 w-5 text-foreground" />
                </div>
                <DialogTitle className="text-xl">{title}</DialogTitle>
              </div>
              <DialogDescription className="text-sm leading-relaxed">
                {description}
              </DialogDescription>
            </DialogHeader>

            <div className="pt-2">
              <h5 className="text-sm font-medium mb-3">{t("cardDetails")}</h5>
              <ul className="space-y-2">
                {expanded!.map((item) => (
                  <li key={item} className="text-sm text-muted-foreground flex gap-2 leading-relaxed">
                    <span className="text-gallery-warm mt-1.5 shrink-0">▸</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
