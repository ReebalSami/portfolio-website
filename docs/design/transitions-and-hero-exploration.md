# Transitions, Hero Exploration & Motion Psychology

**Status**: design notes  
**Created**: 2026-04-20  
**Related**: Issue #45 · plan `.windsurf/plans/transitions-and-cv-hero-exploration-211c6e.md`  
**Live routes at review time**: `/`, `/cv`, `/cv/preview`, `/cv/option-1` … `/cv/option-6`

> This document is the design brain of the polish pass that overhauls page transitions, resolves the home→CV hero dissonance, and explores 6 live CV hero variants. Kept in-repo so future iterations have the full rationale — not just the code.

---

## 1 · The problem we're solving

Navigating from the homepage hero to `/cv` felt subtly *wrong*. Both heroes use the same photo, the same warm-gallery geometric shapes, and the same typographic hierarchy — but the CV hero is constrained to `max-w-5xl` with no `min-h`, while the homepage hero is full-width and fills the viewport. The brain's pattern-matcher reads it as "same thing, smaller" and flags dissonance.

Two forces compound this:

- **Initial-load flicker**: `PageTransition` wraps `<main>` in a Framer Motion y-axis entrance that layers on top of every section's `whileInView` reveal. Two animations fighting = shimmer.
- **Nav flicker**: `AnimatePresence mode="wait"` runs an exit (0.35 s) + entrance (0.35 s) = ~0.7 s of visible motion, on top of RSC streaming content. Feels laggy, not purposeful.

---

## 2 · Psychological principles (why the solution works)

### 2.1 Shared-element continuity
When two screens share an identity-anchor element (here: the portrait photo), morphing it preserves the "this is the same person / project" feeling while the rest of the layout is free to reform. The brain experiences the transition as *a single continuous scene* instead of two disconnected pages.

Reference: *Material Design — Shared element transitions* (Google, 2014, still state-of-the-art 12 years later for a reason).

### 2.2 Peak-end rule
Users remember (a) the peak moment and (b) the end of an interaction — not the average. The transition *itself* becomes the peak. A crisp 300 ms shared-element morph creates a memorable moment that *overrides* any concern about similarity.

Reference: Kahneman & Tversky, peak-end heuristic; applied to UX since Norman's *Emotional Design* (2004).

### 2.3 Change-blindness mitigation
Research shows the brain only detects a scene change when ~30 % of visual elements are meaningfully different. Below that, we perceive sameness — which reads as "the page didn't load" or "something broke". We keep the **palette + photo** constant (continuity) but change **layout, rhythm, typography axis** (differentiation).

Reference: Simons & Rensink on change blindness; Norman Nielsen Group's UX write-ups.

### 2.4 Directional motion
Every transition must have a clear *from* and *to*. Random fades feel amateur; directed motion feels designed. View Transitions API provides automatic direction when shared elements move in space.

### 2.5 Motion economy
`prefers-reduced-motion` is not a fallback — it's a requirement. Every animation in this pass has an equivalent static state. Every `@media` query is present.

---

## 3 · The technical spine

| Layer | Tool | Why |
| --- | --- | --- |
| Cross-page navigation | `next-view-transitions` v0.3.5 + custom `TransitionLink` (composes with next-intl's locale-aware `Link`) | Browser-native crossfade via `document.startViewTransition()`; zero flicker; ~3 kB |
| Shared element | CSS `view-transition-name: hero-photo` | Declarative, browser morphs automatically between snapshots |
| In-section reveals | Framer Motion (existing) with `once: true` | Industry-standard, once-only (see §4) |
| Homepage hook | CSS-only "lamp reveal" above the name (first-session, warm gallery palette) | Inspired by 21st.dev/aceternity/lamp; gives a clear "welcome moment" that also signals this is the canonical hero |

### 3.1 Fallback behaviour
- **Chrome/Edge/Safari 18+**: full shared-element morph.
- **Firefox (not yet shipped)**, **older Safari**: native behaviour = instant nav, no morph. Still zero flicker because the JS wrapper is gone.
- **`prefers-reduced-motion: reduce`**: all `::view-transition-*` pairs disabled via `@media` query.

### 3.2 Integration with next-intl
`next-view-transitions` provides a `<Link>` component that wraps navigation in a view transition. We use next-intl for locale-prefixed URLs. Solution: a thin `TransitionLink` wrapper that takes next-intl's typed `href` (string | `{ pathname, params }`), resolves the locale-prefixed URL via next-intl's helpers, then calls `useTransitionRouter().push(resolvedHref)`. Used in the Header nav, footer nav, and anywhere we cross page boundaries; intra-page anchor jumps keep using plain `<Link>` / `<button>`.

---

## 4 · Scroll-reveal policy: `once: true` everywhere

Short rationale (full rule in `.windsurf/rules/scroll-reveal-once.md`):

- **Industry consensus**: Stripe, Linear, Apple, Vercel, Figma, Notion — all use once-only reveals.
- **Motion fatigue**: re-triggering animations on every scroll past creates jank and tires the eye.
- **Attention economy**: the reveal is a *welcome gesture*; replaying it is like re-greeting someone every time they walk into the room.
- **Accessibility**: reduces trigger surface for motion-sensitive users.
- **Performance**: once-mounted Framer Motion components don't re-attach observers.

**Exception**: scroll-*linked* animations (parallax, progress bars) aren't reveals — they're continuous transforms tied to scroll position. Those stay "always on" but can be skipped under `prefers-reduced-motion`.

---

## 5 · CV hero: 6 live variants for comparison

We keep the current CV hero at `/cv` (with the polish: photo gets `view-transition-name: hero-photo` so it morphs from home). Six variants are wired at `/cv/option-1` … `/cv/option-6`, plus a picker at `/cv/preview`. All preview routes are `noindex` and excluded from the sitemap.

| # | Name | Photo | Motion | Identity |
| --- | --- | --- | --- | --- |
| 1 | **Gallery Cover** | option-3 (cutout) | shared-element morph, eyebrow band | "Curriculum Vitae" eyebrow · download + theme CTAs in hero · metadata strip. Minimal delta, maximum clarity. |
| 2 | **Editorial Magazine** | option-1 (brick wall, wide crop) | name letter-stagger, serif display (Fraunces) | Big "REEBAL SAMI" masthead; print-cover feel; horizontal rule + metadata strip. |
| 3 | **Bauhaus Swiss** | option-4 (moody evergreen) | 12-col grid, numbered reveal | `01 Location · 02 Languages · 03 Availability · 04 Stack`; uppercase micro-type; geometric warm blocks. |
| 4 | **Kinetic AI** | option-2 (garden) | CSS shader-like noise, magnetic button, animated counters | Subtle warm-palette shader in the background; counters (6+ years · 12 projects · 5 languages); magnetic download button. The "AI engineer" variant. |
| 5 | **Japandi Zen** | option-5 (hedge close-up, circular) | fade, vast whitespace | Circular portrait top-right; serif name; one-line tagline; single CTA. |
| 6 | **Cinematic Split** | option-1 (brick wall, full-bleed, fixed) | sticky photo, scrolling content | 50/50 split — photo fills left half and sticks; CV content scrolls on right. Film-poster drama. |

Each variant uses the same `loadCvData()` and `resolveCvLocaleString()` from `src/lib/cv/data.ts` — only the theme component differs.

After review, Reebal picks one → that variant is wired as the canonical `/cv`; the rest are removed. History is preserved here so future iterations can revisit.

---

## 6 · Inspiration board — 21st.dev references (preserved)

Saved from Reebal's review message. These informed the design vocabulary and are kept here for future feature work.

### Hero & reveal effects
- **Aceternity · Lamp** — https://21st.dev/community/components/aceternity/lamp/default  
  Conic-gradient spotlight painting down from the top. Adapted into the warm-palette `LampReveal` component that plays above the homepage name on first view per session.
- **Aliimam · Particle Hero** — https://21st.dev/community/components/aliimam/particle-hero/default  
  Reference for AI-aesthetic particle fields. Not used directly (WebGL cost too high); informed the CSS shader-noise approach in Kinetic AI.
- **Aliimam · Neural Noise** — https://21st.dev/community/components/aliimam/neural-noise/default  
  Same — informs CSS radial-gradient + `filter: url(#noise)` approach in Kinetic AI variant.
- **Aliimam · Shader Animation** — https://21st.dev/community/components/aliimam/shader-animation/default  
  Fluid animated gradient aesthetic; influenced the CSS-only noise+gradient background in Kinetic AI.
- **Bundui · Geometric** — https://21st.dev/community/components/bundui/geometric/default  
  Validates the geometric-shapes hero language we already use.
- **Shadway · Hero Dithering Card** — https://21st.dev/community/components/shadway/hero-dithering-card/default  
  Retro dither aesthetic — considered for option 6 photo treatment but dropped to keep palette cohesive.

### Editorial / magazine vocabulary
- **Cnippet_dev · Davincho Hero 1** — https://21st.dev/community/components/cnippet_dev/davincho-hero-1/default  
  Clean modern hero with image grid. Informed Editorial Magazine variant composition.
- **Cnippet_dev designer profile** — https://21st.dev/community/cnippet_dev  
  Reebal likes most of this designer's work — editorial, confident, restrained. Baseline aesthetic anchor.

### Parallax & scroll motion (for future blog iteration)
- **Sumonadotwork · Parallax Scroll Feature Section** — https://21st.dev/community/components/sumonadotwork/parallax-scroll-feature-section/default  
  Sticky section with parallax image strip. Candidate for blog post detail page in a future pass.
- **Thanh · Animated Scroll** — https://21st.dev/community/components/thanh/animated-scroll/default  
  Scroll-linked text/image animation. Candidate for blog detail pages.
- **Aceternity · Images Slider** — https://21st.dev/community/components/aceternity/images-slider/default  
  Full-screen slider with fade transitions. Candidate for blog gallery lightbox (we already ship one; this is next iteration).

### Other explorations
- **Haik-kashiyani · Lumina Interactive List** — https://21st.dev/community/components/haik-kashiyani/lumina-interactive-list/default  
  Creative reference; doesn't fit current tone but saved for future experimental work.
- **Makviesainte · Team Showcase** — https://21st.dev/community/components/makviesainte/team-showcase/default  
  Candidate treatment for the References section of the CV in a future pass.

---

## 7 · Decision log

| Decision | Rationale |
| --- | --- |
| Use `next-view-transitions` over hand-rolled `document.startViewTransition()` | Stable wrapper; maintained by shuding (Vercel); handles context + `<Link>` integration; easier to verify than custom code. |
| Keep Framer Motion for in-section reveals | Works well; `once: true` is the right policy; no reason to churn. |
| Photo treatments via CSS filters, not pre-processed assets | Zero pipeline cost; per-variant duotone / grayscale / sepia tweaks without touching originals; matches current codebase style. |
| Add `Fraunces` (variable serif) via `next/font` for Editorial variant only | Editorial serif is a signature of that variant; variable font = single file; `display: swap` handled by Next. |
| No WebGL in any variant | Keeps Lighthouse perf ≥ 90 and bundle small. Kinetic AI gets a CSS-only shader-noise look via radial gradients + `filter: url(#noise)`. |
| Scroll-reveal policy codified as a rule | Prevents future regressions. |
| Preview routes `noindex` + sitemap-excluded | No SEO leak. |

---

## 8 · What not to re-litigate

- **Scroll reveals should re-trigger every time**: no — see §4 and the rule file.
- **We should ship a full WebGL shader**: no — see the table above; perf budget and bundle cost aren't worth it for a hero background.
- **The current CV looks fine, no change needed**: the home↔CV dissonance is real and user-reported; the transition fix alone doesn't resolve the layout similarity. A variant must replace or refine the current one.
- **We should keep all 6 variants in production**: no — they're preview-only. Canonical `/cv` gets one theme; the rest are deleted.

---

## 9 · Future work (not in this PR)

- **Home hero lamp reveal**: keep as-is unless Reebal wants to disable it by default.
- **Blog detail page motion**: apply parallax + scroll-linked animations (Sumonadotwork, Thanh refs).
- **CV References section**: upgrade to team-showcase-style display (Makviesainte ref).
- **View transitions for project modal**: morph the project card into the dialog (shared-element on card image).

---

*Last updated when the final variant is picked and canonicalised.*
