"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useInView,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { Mail, MapPin, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GitHubIcon, LinkedInIcon } from "@/components/shared/brand-icons";

interface KineticAiHeroProps {
  name: string;
  title: string;
  summary: string;
  email: string;
  phone?: string;
  location: string;
  photoSrc?: string;
  heroTransitionName: string;
  profiles: { network: string; url: string; username?: string }[];
  counters: { label: string; value: number; suffix?: string }[];
  i18n: {
    downloadPdf: string;
  };
}

const networkIcons: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  LinkedIn: LinkedInIcon,
  GitHub: GitHubIcon,
};

/* ────────────────────────────────────────────────────────────
   Kinetic name — letter-by-letter stagger, first + last on separate lines
   ──────────────────────────────────────────────────────────── */
function KineticName({ name }: { name: string }) {
  const prefersReducedMotion = useReducedMotion();
  const ref = useRef<HTMLHeadingElement>(null);
  // margin: "0px" fires the observer as soon as any part of the heading
  // enters the viewport, which on a hero component is effectively on mount.
  const inView = useInView(ref, { once: true, margin: "0px" });

  const [firstName, ...restName] = name.split(" ");
  const lastName = restName.join(" ") || name;

  if (prefersReducedMotion) {
    return (
      <h1
        ref={ref}
        className="text-[clamp(3rem,11vw,8rem)] font-bold leading-[0.95] tracking-[-0.03em]"
      >
        <span className="block">{firstName}</span>
        <span className="block text-gallery-warm/90">{lastName}</span>
      </h1>
    );
  }

  const container: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.04, delayChildren: 0.1 } },
  };
  const letter: Variants = {
    hidden: { y: "110%", opacity: 0, rotate: 3 },
    visible: {
      y: 0,
      opacity: 1,
      rotate: 0,
      transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
    },
  };

  const renderLetters = (text: string, keyPrefix: string) =>
    Array.from(text).map((ch, ci) =>
      ch === " " ? (
        <span key={`${keyPrefix}-space-${ci}`} className="inline-block w-[0.3em]" />
      ) : (
        <motion.span
          key={`${keyPrefix}-${ch}-${ci}`}
          variants={letter}
          className="inline-block"
          style={{ willChange: "transform" }}
        >
          {ch}
        </motion.span>
      ),
    );

  return (
    <motion.h1
      ref={ref}
      className="text-[clamp(3rem,11vw,8rem)] font-bold leading-[0.95] tracking-[-0.03em]"
      variants={container}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      aria-label={name}
    >
      <span className="block overflow-hidden align-baseline">
        {renderLetters(firstName, "fn")}
      </span>
      <span className="block overflow-hidden align-baseline text-gallery-warm/90">
        {renderLetters(lastName, "ln")}
      </span>
    </motion.h1>
  );
}

/* ────────────────────────────────────────────────────────────
   Animated counter — rolls from 0 to target on first in-view
   ──────────────────────────────────────────────────────────── */
function AnimatedCounter({
  value,
  suffix = "",
  duration = 1.4,
}: {
  value: number;
  suffix?: string;
  duration?: number;
}) {
  // SSR + first client paint show the real value, so users with no JS
  // (and screenshot-takers) never see a misleading "0+". Client-side
  // useEffect then animates from 0 -> value once.
  const [display, setDisplay] = useState(value);
  const prefersReducedMotion = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  // margin: "0px" triggers immediately on mount when the counter is
  // already visible (which it is for a hero counter), fixing the bug
  // where the previous "-10%" required scrolling before firing.
  const inView = useInView(ref, { once: true, margin: "0px" });

  useEffect(() => {
    if (!inView || prefersReducedMotion) return;
    let rafId = 0;
    // First frame resets to 0, subsequent frames ramp up. Wrapped in rAF
    // to avoid the react-hooks/set-state-in-effect lint rule which flags
    // synchronous setState calls inside an effect body.
    let start = 0;
    const step = (now: number) => {
      if (!start) {
        start = now;
        setDisplay(0);
        rafId = requestAnimationFrame(step);
        return;
      }
      const t = Math.min(1, (now - start) / (duration * 1000));
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      setDisplay(Math.round(eased * value));
      if (t < 1) rafId = requestAnimationFrame(step);
    };
    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [inView, value, duration, prefersReducedMotion]);

  return (
    <span ref={ref} className="tabular-nums">
      {display}
      {suffix}
    </span>
  );
}

/* ────────────────────────────────────────────────────────────
   Magnetic button wrapper — drifts toward cursor within radius
   ──────────────────────────────────────────────────────────── */
function MagneticWrap({
  children,
  strength = 0.35,
  radius = 140,
}: {
  children: React.ReactNode;
  strength?: number;
  radius?: number;
}) {
  const prefersReducedMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 220, damping: 22, mass: 0.4 });
  const springY = useSpring(y, { stiffness: 220, damping: 22, mass: 0.4 });

  useEffect(() => {
    if (prefersReducedMotion) return;
    const el = ref.current;
    if (!el) return;
    const handle = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.hypot(dx, dy);
      if (dist < radius) {
        const falloff = 1 - dist / radius;
        x.set(dx * strength * falloff);
        y.set(dy * strength * falloff);
      } else {
        x.set(0);
        y.set(0);
      }
    };
    const leave = () => {
      x.set(0);
      y.set(0);
    };
    window.addEventListener("mousemove", handle, { passive: true });
    el.addEventListener("mouseleave", leave);
    return () => {
      window.removeEventListener("mousemove", handle);
      el.removeEventListener("mouseleave", leave);
    };
  }, [prefersReducedMotion, radius, strength, x, y]);

  return (
    <motion.div ref={ref} style={{ x: springX, y: springY }} className="inline-block">
      {children}
    </motion.div>
  );
}

/* ────────────────────────────────────────────────────────────
   Kinetic AI hero — the full hero
   ──────────────────────────────────────────────────────────── */
export function KineticAiHero({
  name,
  title,
  summary,
  email,
  location,
  photoSrc,
  heroTransitionName,
  profiles,
  counters,
  i18n,
}: KineticAiHeroProps) {
  return (
    <section className="relative isolate overflow-hidden">
      {/* CSS-only shader: animated warm noise field */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background: [
            "radial-gradient(ellipse 60% 50% at 20% 30%, oklch(0.55 0.15 55 / 0.45), transparent 70%)",
            "radial-gradient(ellipse 50% 40% at 80% 60%, oklch(0.45 0.12 40 / 0.4), transparent 70%)",
            "radial-gradient(ellipse 40% 50% at 50% 100%, oklch(0.5 0.1 55 / 0.35), transparent 70%)",
            "linear-gradient(to bottom, oklch(0.16 0.02 40) 0%, oklch(0.08 0.02 40) 100%)",
          ].join(", "),
        }}
      />
      {/* Fine grain overlay (fake noise via SVG filter) */}
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.12] mix-blend-overlay"
      >
        <filter id="kinetic-noise">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="1.1"
            numOctaves="2"
            stitchTiles="stitch"
          />
          <feColorMatrix values="0 0 0 0 1  0 0 0 0 0.88  0 0 0 0 0.72  0 0 0 0.5 0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#kinetic-noise)" />
      </svg>

      <div className="relative mx-auto max-w-6xl px-6 py-16 md:py-24">
        <div className="grid gap-12 md:grid-cols-[minmax(0,1fr)_minmax(0,460px)] md:gap-14 items-start">
          {/* Left: name + summary + CTA */}
          <div className="min-w-0">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-neutral-700/80 bg-neutral-900/60 px-3 py-1 text-[0.65rem] font-medium uppercase tracking-[0.3em] text-neutral-300 backdrop-blur">
              <span
                className="inline-block h-2 w-2 rounded-full bg-gallery-warm"
                aria-hidden="true"
              />
              AI Engineer · Data Scientist
            </div>
            <KineticName name={name} />
            <p className="mt-4 text-base text-neutral-400 sm:text-lg" style={{ maxWidth: "40ch" }}>
              {title}
            </p>
            <p className="cv-copy-balance mt-6 max-w-xl text-sm leading-relaxed text-neutral-300 sm:text-base">
              {summary}
            </p>

            {/* Counters */}
            <div className="mt-10 grid grid-cols-3 gap-4 sm:gap-6 max-w-md">
              {counters.map((c) => (
                <div key={c.label} className="border-s-2 border-gallery-warm ps-3">
                  <p className="text-[2rem] font-bold tracking-tight text-neutral-50 sm:text-[2.5rem] leading-none">
                    <AnimatedCounter value={c.value} suffix={c.suffix} />
                  </p>
                  <p className="mt-1 text-[0.6rem] font-medium uppercase tracking-[0.25em] text-neutral-400">
                    {c.label}
                  </p>
                </div>
              ))}
            </div>

            {/* Magnetic CTA */}
            <div className="mt-10 flex items-center gap-5">
              <MagneticWrap>
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
              </MagneticWrap>
              <div className="flex items-center gap-3 text-sm text-neutral-400">
                <a
                  href={`mailto:${email}`}
                  className="hover:text-gallery-warm transition-colors"
                  aria-label="Email"
                >
                  <Mail className="h-4 w-4" />
                </a>
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
            </div>

            {/* Location strip */}
            <p className="mt-6 inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.25em] text-neutral-500">
              <MapPin className="h-3.5 w-3.5 text-gallery-warm" />
              {location}
            </p>
          </div>

          {/* Right: photo — larger (max-w-[460px]) and pushed down so its
              top-left corner aligns with the top of the last-name line.
              The mt offset = eyebrow pill + first-name line height, which
              scales with the responsive name font size via clamp. */}
          {photoSrc && (
            <div className="relative mx-auto md:mx-0 max-w-[280px] md:max-w-none md:mt-[clamp(6rem,calc(10.45vw+2.5rem),10.5rem)]">
              <div
                aria-hidden="true"
                className="absolute inset-0 -z-10 translate-x-4 translate-y-4 rounded-[2.5rem] border-2 border-gallery-warm/70"
              />
              <div
                className="relative overflow-hidden rounded-[2rem] ring-1 ring-gallery-warm/30"
                style={
                  {
                    viewTransitionName: heroTransitionName,
                    aspectRatio: "4 / 5",
                  } as CSSProperties
                }
              >
                <Image
                  src={photoSrc}
                  alt={name}
                  fill
                  priority
                  sizes="(max-width: 768px) 70vw, 460px"
                  className="object-cover contrast-[1.2] saturate-[0.65] brightness-[0.95]"
                />
                {/* Warm gradient overlay */}
                <div
                  aria-hidden="true"
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(180deg, transparent 0%, transparent 55%, oklch(0.16 0.05 40 / 0.45) 100%)",
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
