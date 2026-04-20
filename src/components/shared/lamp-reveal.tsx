"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

const SESSION_KEY = "lampPlayed";

/**
 * First-visit homepage hero hook — a warm conic-gradient "lamp" sweeps
 * down over the hero and fades, creating a short welcome moment.
 * Inspired by 21st.dev/aceternity/lamp, rewritten in the gallery-warm
 * palette and purely with CSS gradients (no WebGL).
 *
 * Plays ONCE per browser session; fully disabled under
 * `prefers-reduced-motion: reduce`. See
 * docs/design/transitions-and-hero-exploration.md §3 and §4.
 */
export function LampReveal() {
  const [play, setPlay] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) return;

    let alreadyPlayed = false;
    try {
      alreadyPlayed = !!sessionStorage.getItem(SESSION_KEY);
      if (!alreadyPlayed) sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      // Private mode / storage disabled — still play it
    }
    if (alreadyPlayed) return;

    // Defer the state flip one frame so we don't cascade renders inside the
    // effect (React 19 lint) and so the first paint happens cleanly.
    const raf = requestAnimationFrame(() => setPlay(true));
    return () => cancelAnimationFrame(raf);
  }, [prefersReducedMotion]);

  if (!play) return null;

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[70vh] overflow-hidden"
      style={{ transformOrigin: "top center" }}
      initial={{ opacity: 0, scaleY: 0.5 }}
      animate={{
        opacity: [0, 1, 1, 0],
        scaleY: [0.5, 1, 1, 1.04],
      }}
      transition={{
        duration: 1.8,
        times: [0, 0.35, 0.65, 1],
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {/* Cone glow — warm, wide spread */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 100% at 50% 0%, oklch(0.82 0.08 55 / 0.55), transparent 70%)",
          filter: "blur(32px)",
        }}
      />

      {/* Bright core at the top — feels like the bulb */}
      <div
        className="absolute left-1/2 top-0 h-36 w-72 -translate-x-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(ellipse at center, oklch(0.96 0.06 55 / 0.85), transparent 70%)",
          filter: "blur(22px)",
        }}
      />

      {/* Faint side-beam streaks */}
      <div
        className="absolute left-1/2 top-0 h-[70vh] w-[60vw] -translate-x-1/2 opacity-50"
        style={{
          background:
            "conic-gradient(from 180deg at 50% -4%, transparent 0deg, oklch(0.88 0.06 55 / 0.35) 12deg, transparent 28deg, transparent 332deg, oklch(0.88 0.06 55 / 0.35) 348deg, transparent 360deg)",
          filter: "blur(24px)",
        }}
      />
    </motion.div>
  );
}
