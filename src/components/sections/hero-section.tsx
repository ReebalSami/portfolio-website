"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, MotionConfig } from "framer-motion";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { LampBackdrop } from "@/components/shared/lamp-container";
import { GeometricShapes } from "@/components/sections/hero/geometric-shapes";
import { DEFAULT_PHOTO_RELIGHT } from "@/types/config";
import type { HeroConfig, HeroPhotoRelightConfig } from "@/types/config";
import { HERO_PORTRAIT_SIZES } from "@/lib/image-sizes";
import { HERO_VIEW_TRANSITION_NAME } from "@/lib/view-transitions";

interface HeroSectionProps {
  name: string;
  title: string;
  tagline: string;
  photoSrc: string;
  hero: HeroConfig;
}

interface DevHeroConfigResponse {
  hero: HeroConfig;
  version: number;
}

const HERO_CONFIG_POLL_MS = 700;

const stagger = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

/**
 * Content fade-up matches the Aceternity lamp demo's headline animation
 * (`initial={{ opacity: 0.5, y: 100 }}` → `{ opacity: 1, y: 0 }`). Duration
 * / delay are read from YAML so the hero text reveal lands in sync with
 * the lamp backdrop reveal regardless of how Reebal tunes them.
 */
const makeFadeUp = (durationSec: number, delaySec: number) => ({
  hidden: { opacity: 0.5, y: 100 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: durationSec, ease: "easeInOut" as const, delay: delaySec },
  },
});

const CHROMA_MASK: Record<string, string> = {
  "right-to-left": "linear-gradient(to left, black, transparent)",
  "bottom-to-top": "linear-gradient(to top, black, transparent)",
  center: "radial-gradient(ellipse at center, black 0%, transparent 70%)",
};

function PhotoRelightStack({
  photoSrc,
  relight,
}: {
  photoSrc: string;
  relight: HeroPhotoRelightConfig;
}) {
  return (
    <div
      data-photo-relight-overlay="true"
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-10"
    >
      {relight.chromaOpacity > 0 && (
        <div
          className="absolute inset-0 overflow-hidden rounded-[2rem]"
          style={{
            opacity: relight.chromaOpacity,
            maskImage: CHROMA_MASK[relight.chromaDirection],
            WebkitMaskImage: CHROMA_MASK[relight.chromaDirection],
          }}
        >
          <Image
            src={photoSrc}
            alt=""
            fill
            className="object-cover saturate-150"
            sizes={HERO_PORTRAIT_SIZES}
            aria-hidden="true"
          />
        </div>
      )}
    </div>
  );
}

function HeroPhoto({
  name,
  photoSrc,
  relight,
}: {
  name: string;
  photoSrc: string;
  relight: HeroPhotoRelightConfig;
}) {
  return (
    <div
      className="relative isolate mx-auto max-w-[80%] overflow-hidden rounded-[2rem] sm:max-w-[70%]"
      style={{ viewTransitionName: HERO_VIEW_TRANSITION_NAME }}
      data-photo-relight-enabled={relight.enabled ? "true" : "false"}
      data-photo-relight-profile={relight.profile}
      data-photo-relight-tone={relight.baseTone}
    >
      <Image
        src={photoSrc}
        alt={`Portrait of ${name}`}
        width={600}
        height={750}
        priority
        sizes={HERO_PORTRAIT_SIZES}
        className="h-auto w-full object-cover grayscale contrast-[1.1]"
      />
      {relight.enabled && <PhotoRelightStack photoSrc={photoSrc} relight={relight} />}
    </div>
  );
}

function scrollToSection(sectionId: string) {
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({ behavior: "smooth" });
  }
}

/**
 * Layout contract (iter-4 v5 — simplified):
 *
 * - Outer grid: `items-center` (pre-lamp behaviour — both columns are
 *   natural-sized and their midpoints align vertically).
 * - Right column: plain block. Text block inside uses `max-w-xl mx-auto`
 *   so it horizontally centres in the column.
 * - `hero.textBlock.{x,y}` are applied as a `translate(x, y)` to the
 *   text block; lamp uses `hero.lamp.anchor.{x,y}` as base position plus
 *   `hero.lamp.{x,y}` translate deltas. Neither affects
 *   layout reflow, so tweaking them never nudges the photo column.
 */
export function HeroSection({
  name,
  title,
  tagline,
  photoSrc,
  hero,
}: HeroSectionProps) {
  const t = useTranslations();
  const [liveHero, setLiveHero] = useState(hero);
  const latestVersionRef = useRef<number | null>(null);

  // Dev-only live config polling so editing config/site.yaml updates the
  // hero immediately without manual browser refresh.
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;

    let cancelled = false;

    const pollHeroConfig = async () => {
      try {
        const response = await fetch("/api/dev/hero-config", {
          cache: "no-store",
        });

        if (!response.ok || cancelled) return;

        const payload = (await response.json()) as Partial<DevHeroConfigResponse>;
        if (!payload.hero || typeof payload.version !== "number") return;

        if (latestVersionRef.current !== payload.version) {
          latestVersionRef.current = payload.version;
          setLiveHero(payload.hero);
        }
      } catch {
        // Ignore transient fetch errors in dev polling loop.
      }
    };

    void pollHeroConfig();
    const timer = window.setInterval(() => {
      void pollHeroConfig();
    }, HERO_CONFIG_POLL_MS);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, []);

  // Desktop vs. mobile text-block translate. Each set of axis values is
  // exposed as a CSS custom property so the responsive switch happens in
  // CSS (no JS/hydration flash). The Tailwind arbitrary-value utility
  // below picks the desktop values at `md:` and up, falling back to the
  // mobile values otherwise.
  const textBlockStyle: React.CSSProperties = {
    ["--hero-tx" as string]: liveHero.textBlock.x,
    ["--hero-ty" as string]: liveHero.textBlock.y,
    ["--hero-tx-m" as string]: liveHero.textBlockMobile.x,
    ["--hero-ty-m" as string]: liveHero.textBlockMobile.y,
  };
  const textBlockClassName =
    "relative z-10 mx-auto w-full max-w-xl " +
    "[transform:translate(var(--hero-tx-m),var(--hero-ty-m))] " +
    "md:[transform:translate(var(--hero-tx),var(--hero-ty))]";
  const fadeUp = makeFadeUp(
    liveHero.lamp.animation.durationSec,
    liveHero.lamp.animation.delaySec,
  );
  const photoRelight = liveHero.photoRelight ?? DEFAULT_PHOTO_RELIGHT;

  // Grid is always `items-center` — both columns centre vertically as a
  // pair. No `overflow-hidden` on the right column so the lamp beams
  // bleed freely into adjacent cells.
  const gridClassName =
    "relative grid min-h-0 items-center gap-8 px-4 py-12 sm:px-6 sm:py-16 md:min-h-[calc(100vh-4rem)] md:grid-cols-2 md:gap-12 lg:gap-20";

  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        className={gridClassName}
        variants={stagger}
        initial="hidden"
        animate="visible"
      >
        {/* @starting-style fires on first CSS frame — no Framer Motion hydration needed → LCP fix.
            Use transform:scale() (not scale:) so transition:transform covers the scale animation. */}
        <div className="relative z-20 order-1 md:order-1 overflow-hidden opacity-100 [transform:scale(1)] [transition:opacity_0.8s_cubic-bezier(0.22,1,0.36,1),transform_0.8s_cubic-bezier(0.22,1,0.36,1)] [@starting-style]:[transform:scale(0.92)] [@starting-style]:opacity-0 motion-reduce:[transition:none]">
          <GeometricShapes />
          <HeroPhoto
            name={name}
            photoSrc={photoSrc}
            relight={photoRelight}
          />
        </div>

        <div className="relative z-0 order-2 overflow-hidden md:order-2 md:overflow-visible">
          <LampBackdrop lamp={liveHero.lamp} />
          <motion.div
            className={textBlockClassName}
            style={textBlockStyle}
            variants={stagger}
            initial="hidden"
            animate="visible"
          >
            <motion.p
              className="text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground mb-4"
              variants={fadeUp}
            >
              {title}
            </motion.p>

            <motion.h1
              className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl mb-4 text-foreground"
              variants={fadeUp}
            >
              {name}
            </motion.h1>

            <motion.p
              className="text-base mb-6 max-w-lg leading-relaxed sm:text-lg text-muted-foreground"
              variants={fadeUp}
            >
              {tagline}
            </motion.p>

            <motion.p
              className="text-sm mb-8 max-w-lg leading-relaxed sm:text-base text-muted-foreground"
              variants={fadeUp}
            >
              {t("home.hero.intro")}
            </motion.p>

            <motion.div className="flex flex-wrap gap-4 justify-start" variants={fadeUp}>
              <Button
                size="lg"
                className="cursor-pointer bg-gallery-warm text-neutral-950 hover:bg-gallery-warm/90"
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
    </MotionConfig>
  );
}
