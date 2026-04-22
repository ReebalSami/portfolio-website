"use client";

import Image from "next/image";
import { useRef, type CSSProperties } from "react";
import { Fraunces } from "next/font/google";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import { ArrowDown, Download, Mail, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GitHubIcon, LinkedInIcon } from "@/components/shared/brand-icons";

const scrollDisplay = Fraunces({
  variable: "--font-scroll-display",
  subsets: ["latin"],
  weight: ["300", "400", "700", "900"],
  display: "swap",
});

interface ScrollHeroClientProps {
  name: string;
  title: string;
  summary: string;
  email: string;
  location: string;
  photoSrc?: string;
  heroTransitionName: string;
  profiles: { network: string; url: string; username?: string }[];
  i18n: {
    title: string; // "Curriculum Vitae"
    downloadPdf: string;
    scrollHint: string;
  };
}

const networkIcons: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  LinkedIn: LinkedInIcon,
  GitHub: GitHubIcon,
};

/**
 * Scroll Hero — scroll-linked cinematic reveal.
 *
 * Addresses the iteration-1 complaint that Cinematic Split's photo "stays
 * there the whole time". Here the photo is full-bleed under the name on
 * mount, and as the user scrolls the hero range, the photo scales, blurs,
 * and fades out while the name translates up and fades with it. By the
 * time the CV body arrives, the photo is gone — the user is reading the
 * work, not staring at a sticky portrait.
 *
 * Scroll range: section is h-[200vh] so the transform has 1x of scroll
 * distance to complete (200vh section with top-0 sticky content = 100vh
 * scroll travel from 0 -> 1 progress). `offset: ['start start','end start']`
 * maps progress against the hero section.
 *
 * prefers-reduced-motion: renders a static hero with the photo and name
 * in place, no transforms. Scroll hint is omitted (nothing to scroll for).
 */
export function ScrollHeroClient({
  name,
  title,
  summary,
  email,
  location,
  photoSrc,
  heroTransitionName,
  profiles,
  i18n,
}: ScrollHeroClientProps) {
  const heroRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  // Photo: subtle scale-up (Ken Burns feel) + growing blur + fade-out.
  const photoScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const photoBlur = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    ["blur(0px)", "blur(4px)", "blur(16px)"],
  );
  const photoOpacity = useTransform(scrollYProgress, [0, 0.6, 1], [1, 0.6, 0]);

  // Content: lift up and fade out together.
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "-20%"]);
  const contentOpacity = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [1, 0.8, 0],
  );

  // Scroll hint disappears quickly once the user engages.
  const hintOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);

  const [firstName, ...restName] = name.split(" ");
  const lastName = restName.join(" ") || name;

  // Shared hero content for both motion + reduced-motion branches.
  const heroContent = (
    <>
      {/* Eyebrow */}
      <p
        className="mb-4 text-[0.65rem] font-medium uppercase tracking-[0.4em] text-neutral-300 sm:text-xs"
        style={{ fontFamily: "var(--font-scroll-display)" }}
      >
        {i18n.title} · {new Date().getFullYear()}
      </p>

      {/* Display name */}
      <h1
        className="cv-scroll-display text-[clamp(3.5rem,13vw,10rem)] font-black leading-[0.9] tracking-[-0.03em] text-neutral-50"
        style={{
          fontFamily: "var(--font-scroll-display)",
          letterSpacing: "-0.03em",
        }}
      >
        <span className="block">{firstName}</span>
        <span
          className="block italic"
          style={{
            color: "transparent",
            backgroundImage:
              "linear-gradient(90deg, oklch(0.82 0.08 55) 0%, oklch(0.72 0.12 40) 50%, oklch(0.88 0.05 70) 100%)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {lastName}
        </span>
      </h1>

      {/* Title + summary */}
      <p
        className="mt-6 text-lg font-medium text-gallery-warm sm:text-xl"
        style={{ fontFamily: "var(--font-scroll-display)" }}
      >
        {title}
      </p>
      <p
        className="cv-copy-balance mt-4 max-w-2xl text-sm leading-relaxed text-neutral-200 sm:text-base"
        style={{ fontFamily: "var(--font-scroll-display)" }}
      >
        {summary}
      </p>

      {/* CTA row */}
      <div className="mt-10 flex flex-wrap items-center gap-5">
        <Button
          size="lg"
          className="cursor-pointer bg-gallery-warm text-neutral-950 hover:bg-gallery-warm/90"
          nativeButton={false}
          render={
            <a
              href="/cv/visual/resume_reebal_sami.pdf"
              download
              data-plausible-event="cv:download"
              data-plausible-event-theme="visual"
            />
          }
        >
          <Download className="h-4 w-4 me-2" />
          {i18n.downloadPdf}
        </Button>

        <div className="flex items-center gap-4 text-sm text-neutral-300">
          <a
            href={`mailto:${email}`}
            className="inline-flex items-center gap-1.5 hover:text-gallery-warm transition-colors"
          >
            <Mail className="h-4 w-4" /> {email}
          </a>
          <span className="inline-flex items-center gap-1.5 text-neutral-400">
            <MapPin className="h-4 w-4" /> {location}
          </span>
        </div>
      </div>

      {/* Profiles */}
      <div className="mt-6 flex items-center gap-4 text-neutral-400">
        {profiles.map((p) => {
          const Icon = networkIcons[p.network];
          return (
            <a
              key={p.network}
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${name} on ${p.network}`}
              className="hover:text-gallery-warm transition-colors"
            >
              {Icon && <Icon className="h-4 w-4" />}
            </a>
          );
        })}
      </div>
    </>
  );

  if (prefersReducedMotion) {
    return (
      <section
        className={`relative isolate min-h-screen overflow-hidden bg-neutral-950 text-neutral-100 ${scrollDisplay.variable}`}
      >
        <div className="absolute inset-0">
          {photoSrc && (
            <div
              className="relative h-full w-full"
              style={{ viewTransitionName: heroTransitionName } as CSSProperties}
            >
              <Image
                src={photoSrc}
                alt={name}
                fill
                priority
                sizes="100vw"
                className="object-cover object-center"
              />
            </div>
          )}
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, oklch(0.05 0 0 / 0.3) 0%, oklch(0.05 0 0 / 0.6) 50%, oklch(0.05 0 0 / 0.92) 100%)",
            }}
          />
        </div>
        <div className="relative mx-auto flex min-h-screen max-w-5xl flex-col justify-end px-6 pb-20 pt-24 md:pb-28 md:pt-32">
          {heroContent}
        </div>
      </section>
    );
  }

  return (
    <section
      ref={heroRef}
      className={`relative isolate overflow-hidden bg-neutral-950 text-neutral-100 ${scrollDisplay.variable}`}
      style={{ height: "200vh" }}
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* Full-bleed photo, scroll-linked scale + blur + fade */}
        {photoSrc && (
          <motion.div
            className="absolute inset-0"
            style={{
              scale: photoScale,
              filter: photoBlur,
              opacity: photoOpacity,
              viewTransitionName: heroTransitionName,
            }}
          >
            <Image
              src={photoSrc}
              alt={name}
              fill
              priority
              sizes="100vw"
              className="object-cover object-center"
            />
          </motion.div>
        )}

        {/* Cinematic gradient — darkens bottom for text legibility,
            keeps top lighter so the photo's character reads on mount. */}
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, oklch(0.05 0 0 / 0.1) 0%, oklch(0.05 0 0 / 0.5) 55%, oklch(0.05 0 0 / 0.92) 100%)",
          }}
        />

        {/* Content — lifts and fades out as the user scrolls */}
        <motion.div
          className="relative mx-auto flex h-full max-w-5xl flex-col justify-end px-6 pb-20 pt-24 md:pb-28 md:pt-32"
          style={{ y: contentY, opacity: contentOpacity }}
        >
          {heroContent}
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          className="pointer-events-none absolute inset-x-0 bottom-6 flex justify-center"
          style={{ opacity: hintOpacity }}
          aria-hidden="true"
        >
          <div className="flex flex-col items-center gap-2 text-neutral-400">
            <span
              className="text-[0.6rem] uppercase tracking-[0.4em]"
              style={{ fontFamily: "var(--font-scroll-display)" }}
            >
              {i18n.scrollHint}
            </span>
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            >
              <ArrowDown className="h-4 w-4" />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
