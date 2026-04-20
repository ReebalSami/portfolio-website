"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

interface HeroSectionProps {
  name: string;
  title: string;
  tagline: string;
  photoSrc: string;
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

function scrollToSection(sectionId: string) {
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({ behavior: "smooth" });
  }
}

export function HeroSection({
  name,
  title,
  tagline,
  photoSrc,
}: HeroSectionProps) {
  const t = useTranslations();
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return (
      <div className="grid min-h-0 items-center gap-8 px-4 py-12 sm:px-6 sm:py-16 md:min-h-[calc(100vh-4rem)] md:grid-cols-2 md:gap-12 lg:gap-20">
        <div className="relative order-1 md:order-1 overflow-hidden">
          <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
            <div className="absolute -top-4 -left-4 h-48 w-48 rounded-full bg-gallery-warm/30 sm:h-60 sm:w-60 md:-top-8 md:-left-8 md:h-80 md:w-80 lg:h-96 lg:w-96" />
            <div className="absolute -bottom-2 -right-2 h-32 w-44 rounded-[2rem] bg-gallery-warm-muted/25 rotate-6 sm:h-40 sm:w-56 md:-bottom-4 md:-right-4 md:h-56 md:w-72" />
            <div className="absolute top-1/2 -left-3 h-20 w-20 rounded-[1.5rem] bg-gallery-warm-light/30 -rotate-12 sm:h-28 sm:w-28 md:-left-6 md:h-32 md:w-32" />
          </div>

          <div
            className="relative mx-auto max-w-[80%] overflow-hidden rounded-[2rem] sm:max-w-[70%]"
            style={{ viewTransitionName: "hero-photo" }}
          >
            <Image
              src={photoSrc}
              alt={`Portrait of ${name}`}
              width={600}
              height={750}
              priority
              sizes="(max-width: 640px) 80vw, (max-width: 768px) 70vw, (max-width: 1280px) 45vw, 35vw"
              className="h-auto w-full object-cover grayscale contrast-[1.1]"
            />
          </div>
        </div>

        <div className="order-2 md:order-2">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground mb-4">{title}</p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl mb-4">{name}</h1>
          <p className="text-base text-muted-foreground mb-6 max-w-lg leading-relaxed sm:text-lg">{tagline}</p>
          <p className="text-sm text-muted-foreground mb-8 max-w-lg leading-relaxed sm:text-base">{t("home.hero.intro")}</p>
          <div className="flex flex-wrap gap-4">
            <Button
              size="lg"
              className="cursor-pointer"
              onClick={() => scrollToSection("projects")}
            >
              {t("common.buttons.viewProjects")}
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="cursor-pointer"
              onClick={() => scrollToSection("contact")}
            >
              {t("common.buttons.getInTouch")}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="grid min-h-0 items-center gap-8 px-4 py-12 sm:px-6 sm:py-16 md:min-h-[calc(100vh-4rem)] md:grid-cols-2 md:gap-12 lg:gap-20"
      variants={stagger}
      initial="hidden"
      animate="visible"
    >
      <motion.div className="relative order-1 md:order-1 overflow-hidden" variants={fadeScale}>
        <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
          <div className="absolute -top-4 -left-4 h-48 w-48 rounded-full bg-gallery-warm/30 sm:h-60 sm:w-60 md:-top-8 md:-left-8 md:h-80 md:w-80 lg:h-96 lg:w-96" />
          <div className="absolute -bottom-2 -right-2 h-32 w-44 rounded-[2rem] bg-gallery-warm-muted/25 rotate-6 sm:h-40 sm:w-56 md:-bottom-4 md:-right-4 md:h-56 md:w-72" />
          <div className="absolute top-1/2 -left-3 h-20 w-20 rounded-[1.5rem] bg-gallery-warm-light/30 -rotate-12 sm:h-28 sm:w-28 md:-left-6 md:h-32 md:w-32" />
        </div>

        <div
          className="relative mx-auto max-w-[80%] overflow-hidden rounded-[2rem] sm:max-w-[70%]"
          style={{ viewTransitionName: "hero-photo" }}
        >
          <Image
            src={photoSrc}
            alt={`Portrait of ${name}`}
            width={600}
            height={750}
            priority
            sizes="(max-width: 640px) 80vw, (max-width: 768px) 70vw, (max-width: 1280px) 45vw, 35vw"
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
            className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl mb-4"
            variants={fadeUp}
          >
            {name}
          </motion.h1>

          <motion.p
            className="text-base text-muted-foreground mb-6 max-w-lg leading-relaxed sm:text-lg"
            variants={fadeUp}
          >
            {tagline}
          </motion.p>

          <motion.p
            className="text-sm text-muted-foreground mb-8 max-w-lg leading-relaxed sm:text-base"
            variants={fadeUp}
          >
            {t("home.hero.intro")}
          </motion.p>

          <motion.div className="flex flex-wrap gap-4" variants={fadeUp}>
            <Button
              size="lg"
              className="cursor-pointer"
              onClick={() => scrollToSection("projects")}
            >
              {t("common.buttons.viewProjects")}
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="cursor-pointer"
              onClick={() => scrollToSection("contact")}
            >
              {t("common.buttons.getInTouch")}
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}
