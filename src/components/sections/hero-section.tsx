"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

interface HeroSectionProps {
  name: string;
  title: string;
  tagline: string;
  photoSrc: string;
  onViewProjects?: () => void;
  onContact?: () => void;
}

const stagger = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const fadeScale = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export function HeroSection({
  name,
  title,
  tagline,
  photoSrc,
  onViewProjects,
  onContact,
}: HeroSectionProps) {
  const t = useTranslations();

  return (
    <motion.div
      className="grid min-h-[calc(100vh-4rem)] items-center gap-8 px-6 py-16 md:grid-cols-2 md:gap-12 lg:gap-20"
      variants={stagger}
      initial="hidden"
      animate="visible"
    >
      <motion.div className="relative order-1 md:order-1" variants={fadeScale}>
        <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
          <div className="absolute -top-8 -left-8 h-72 w-72 rounded-full bg-gallery-warm/30 md:h-80 md:w-80 lg:h-96 lg:w-96" />
          <div className="absolute -bottom-4 -right-4 h-48 w-64 rounded-[2rem] bg-gallery-warm-muted/25 rotate-6 md:h-56 md:w-72" />
          <div className="absolute top-1/2 -left-6 h-32 w-32 rounded-[1.5rem] bg-gallery-warm-light/30 -rotate-12" />
        </div>

        <div className="relative mx-auto max-w-[70%] overflow-hidden rounded-[2rem]">
          <Image
            src={photoSrc}
            alt={`Portrait of ${name}`}
            width={600}
            height={750}
            priority
            className="h-auto w-full object-cover grayscale contrast-[1.1]"
          />
        </div>
      </motion.div>

      <div className="order-2 md:order-2">
        <motion.div variants={stagger} initial="hidden" animate="visible">
          <motion.p
            className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground mb-4"
            variants={fadeUp}
          >
            {title}
          </motion.p>

          <motion.h1
            className="text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl mb-4"
            variants={fadeUp}
          >
            {name}
          </motion.h1>

          <motion.p
            className="text-lg text-muted-foreground mb-6 max-w-lg leading-relaxed"
            variants={fadeUp}
          >
            {tagline}
          </motion.p>

          <motion.p
            className="text-base text-muted-foreground mb-8 max-w-lg leading-relaxed"
            variants={fadeUp}
          >
            {t("home.hero.intro")}
          </motion.p>

          <motion.div className="flex flex-wrap gap-4" variants={fadeUp}>
            <Button
              size="lg"
              className="cursor-pointer"
              onClick={onViewProjects}
            >
              {t("common.buttons.viewProjects")}
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="cursor-pointer"
              onClick={onContact}
            >
              {t("common.buttons.getInTouch")}
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}
