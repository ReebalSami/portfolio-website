# Transitions, Hero Exploration & Motion Psychology

**Status**: design notes  
**Created**: 2026-04-20  
**Related**: Issue #45 · plan `.windsurf/plans/transitions-and-cv-hero-exploration-211c6e.md`  
**Live routes at review time**: `/`, `/cv`, `/cv/preview`, `/cv/option-1`, `/cv/option-2`, `/cv/option-4`, `/cv/option-6` *(iteration 2: options 3 and 5 removed; option-6 replaced with Scroll Hero)*

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
| Homepage hook (iter-4 revision) | **Canonical Aceternity Lamp** (`src/components/shared/lamp-container.tsx`) — ported from `ui.aceternity.com/registry/lamp.json` with only the palette swapped to adaptive warm tokens | Scoped to the hero's right (text) column only (Q2 decision). Replaces the earlier `LampReveal` (custom conic-gradient) with the actual component Reebal asked for |

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

## 5 · CV hero: live variants for comparison

Canonical CV at `/cv` is **Editorial Magazine since iter-3** (was Portfolio Gallery through iter-2). The photo gets `view-transition-name: hero-photo` so it morphs from home. Hero variants are wired at `/cv/option-1`, `/cv/option-2`, `/cv/option-3`, `/cv/option-4`, `/cv/option-6`, plus a picker at `/cv/preview`. Every preview surface is `noindex`, excluded from the sitemap, **and gated behind `isCvPreviewEnabled()`** so production returns 404 unless `ENABLE_CV_PREVIEW=true` is set at build time — see §10.6. Iter-4 further split the photo pipeline into three site.yaml slots (homepage, CV web, CV PDFs) and replaced the Editorial hero+footer+FAB trio with a single morphing CTA — see §5.4 and §10.7.

### 5.1 Iteration 1 — initial six

| # | Name | Photo | Motion | Identity |
| --- | --- | --- | --- | --- |
| 1 | **Gallery Cover** | option-3 (cutout) | shared-element morph, eyebrow band | "Curriculum Vitae" eyebrow · download + theme CTAs in hero · metadata strip. Minimal delta, maximum clarity. |
| 2 | **Editorial Magazine** | option-1 (brick wall, wide crop) | name letter-stagger, serif display (Fraunces) | Big "REEBAL SAMI" masthead; print-cover feel; horizontal rule + metadata strip. |
| 3 | **Bauhaus Swiss** | option-4 (moody evergreen) | 12-col grid, numbered reveal | `01 Location · 02 Languages · 03 Availability · 04 Stack`; uppercase micro-type; geometric warm blocks. |
| 4 | **Kinetic AI** | option-2 (garden) | CSS shader-like noise, magnetic button, animated counters | Subtle warm-palette shader in the background; counters; magnetic download button. The "AI engineer" variant. |
| 5 | **Japandi Zen** | option-5 (hedge close-up, circular) | fade, vast whitespace | Circular portrait top-right; serif name; one-line tagline; single CTA. |
| 6 | **Cinematic Split** | option-1 (brick wall, full-bleed, fixed) | sticky photo, scrolling content | 50/50 split — photo fills left half and sticks; CV content scrolls on right. Film-poster drama. |

### 5.2 Iteration 2 — pruned + refined

After review, Reebal eliminated Gallery Cover (too similar to canonical), Bauhaus Swiss (grid felt constrained for a bio hero), and Japandi Zen (too minimal — reads as "placeholder"). Cinematic Split was replaced because the permanently-sticky 50/50 photo dominated every body section ("dont like the the photo stays there the whole time"). The canonical baseline (`PortfolioGalleryTheme`, then at `/cv`) gained a new sibling, Mirrored Canonical, that kept the same geometry but flipped the composition and showed the portrait in full colour.

### 5.3 Iteration 3 — canonical swap + polish

Reebal picked Editorial Magazine. The classic Portfolio Gallery hero is preserved at `/cv/option-3` so we can A/B against the new canonical or revert without losing the design. Three hero finalists (Mirrored, Editorial, Kinetic) got polish: shared download CTA pattern (hero button + footer button + page-level FAB, all wired through a `cv-fab:open` window event), sticky sidebar reverted to canonical behaviour (no flex-stretch — see §10.2), and decorative cleanup on Mirrored. All preview surfaces are now dev-only (§10.6).

| # | Name | Route | Photo | Iter-3 polish |
| --- | --- | --- | --- | --- |
| canonical | **Editorial Magazine** | `/cv` | start-photo | Promoted from option-2. Dynamic `Vol. YYYY · Issue MM` masthead. Photo caption "Résumé YYYY". Sidebar pull-quote labelled "In his own words". Hero CTA + footer CTA + FAB. `heroTransitionName="hero-photo"` matches the homepage morph. |
| 1 | **Mirrored Canonical** | `/cv/option-1` | start-photo (colour) | Removed the inner warm `mix-blend-multiply` overlay (skin tones now read true). Behind-head circle flipped from `-end-4` → `-start-4` to peek from the photo's start side. |
| 2 | **Editorial Magazine** | `/cv/option-2` | option-1 (brick wall) | Same theme as canonical, different photo. Lets us compare crop / composition without changing the live page. |
| 3 | **Classic Canonical** | `/cv/option-3` | start-photo (B&W) | The previously-live `PortfolioGalleryTheme`. Photo left, name right, warm orbs, B&W portrait. Badge: "Was /cv until iter-3". Reverting is a one-line swap in `/cv/page.tsx`. |
| 4 | **Kinetic AI** | `/cv/option-4` | option-2 (garden) | Magnetic hero button rewired to open the FAB instead of direct-downloading. Sidebar version-block replaced with a font-mono pull-quote ("In his own words" · same line as Editorial). Footer "Take it with you" CTA on the dark surface. |
| 6 | **Scroll Hero** | `/cv/option-6` | start-photo | Unchanged in iter-3. Full-bleed portrait + scroll-linked scale/blur/fade reveal. |

Each variant uses the same `loadCvData()` and `resolveCvLocaleString()` from `src/lib/cv/data.ts` — only the theme component differs.

### 5.4 Iteration 4 — three-photo pipeline, morphing download CTA rewrite, Aceternity Lamp hero (current)

Three orthogonal changes: two on `/cv`, one on the homepage hero.

**Three-photo pipeline**. Reebal wanted separate images for the homepage, the CV web page, and the CV PDFs — all controllable from `site.yaml` without touching code. The `photos` block now has three slots:

```yaml
photos:
  homepage: { file: "start-photo.JPG", dir: "/images/homepage/hero" }
  cvPage:   { file: "option-1.JPG",    dir: "/images/resume" }
  cvPdf:    { file: "start-photo.JPG", dir: "/images/cv" }
  treatment: "bw-with-geometric-shapes"
```

`src/lib/config.ts` exports `getPhotoPath(slot)` which joins `dir + file`. The homepage reads `getPhotoPath("homepage")`; every CV theme falls back to `getPhotoPath("cvPage")` when no explicit `photoSrc` prop is passed (preview routes at `/cv/option-N` still override via the `variants.ts` registry). `basics.photo` was dropped from `cv.public.yaml` / `cv.full.yaml` to avoid two sources of truth — the schema field is `.optional()` for backward compat.

PDF synchronisation: Typst templates reference `../assets/profile-photo.png` (a fixed path). `scripts/generate-cv.ts` now runs a `syncCvPdfPhoto()` step before every compile that copies `public/<photos.cvPdf.dir>/<file>` to `scripts/typst/assets/profile-photo.png`. Typst is content-sniff on image types, so the `.png` filename holding JPG bytes is fine. The checked-in asset remains as a fallback for fresh clones. Reebal can swap the PDF photo by editing one line of `site.yaml` and running `make cv:pdf`.

Folder refactor: `public/images/hero/` → `public/images/homepage/hero/`; new `public/images/cv/` holds the PDF photo. The existing `public/images/resume/option-1..5.JPG` pool stays as the default source for the CV web page (option-1 now ships at `/cv`).

**Morphing download CTA on `/cv` (rewritten, issue #46)**. The iter-3 pattern — two identical `<CvDownloadCta />` buttons (hero + footer) both firing a `cv-fab:open` window event to toggle the separately-positioned `<CvDownloadFab />` — read as three disconnected controls. The first iter-4 attempt used Framer Motion's `layoutId` across three slot mount points, which produced empty intermediate layout boxes and FAB/chat collisions. The current rewrite (§10.7) uses **a single `<motion.button>` inside a React portal on `document.body`**, with its `top/left/width/height/borderRadius` driven by `animate={activeSlotRect}` via `ResizeObserver`-published rects. The slots themselves are invisible placeholders that reserve layout space and publish their rects. The button is never unmounted, so Framer always has a valid source and target rect → smooth spring interpolation.

  - `top`: inline in the hero, right below the profile summary. Rounded pill, Download icon + label.
  - `fab`: fixed above the chat widget, circular, icon-only. FAB position is derived from `useChatLayout()` (see below), so it always sits above the chat button or dialog.
  - `bottom`: inline in the "Take it with you" footer section. Rounded pill, Download icon + label.

Styling is the Kinetic warm aesthetic everywhere: `bg-gallery-warm text-neutral-950 hover:bg-gallery-warm/90` + magnetic hover on top/bottom slots (disabled on the FAB). The choice panel (ATS / Visual / Print) lives in the same portal and anchors to the active slot. Mobile is solid via the chat-layout-derived FAB position (clears the iOS home indicator automatically because the chat widget already clears it) and `max-w-[calc(100vw-2rem)]` on the panel.

**Homepage hero: canonical Aceternity Lamp (issue #46)**. The earlier iter-3 `LampReveal` was a custom CSS conic-gradient reinterpretation. Iter-4 replaces it with `src/components/shared/lamp-container.tsx` — a faithful 1:1 port of the Aceternity shadcn registry source (`ui.aceternity.com/registry/lamp.json`). Every coordinate, translate value, duration, easing, and masking rectangle is preserved; only the palette is swapped to adaptive warm tokens scoped inside the container via CSS custom properties (`--lamp-surface`, `--lamp-beam`, `--lamp-glow`, `--lamp-core`, `--lamp-text`, `--lamp-text-muted`). Adaptive by site theme (Q1 = "Adaptive by theme"): warm umber panel + mid-chroma beam in light mode, deeper warm-black panel + bumped-chroma beam in dark mode. Scoped to the hero's right column only (Q2 = "Lamp over text column only"); the photo column (left) is byte-identical to the previous version. Replay guard = `sessionStorage` → plays once per browser session; `prefers-reduced-motion: reduce` forces end-state.

**Shared ChatLayoutContext (`src/lib/layout/chat-layout-context.tsx`)**. New root-layout context that publishes the chat widget's button and dialog bounding rects + open state. Removes the brittle `document.querySelector("[class*='fixed bottom-24 end-6']...")` pattern from `cv-download-fab.tsx` and the `MutationObserver` on `document.body`. Any fixed/floating UI (currently: the `MorphingDownloadCta` FAB) can read `useChatLayout()` to position itself relative to the chat without colliding, at any viewport size.

See §10.7 for the morph state-derivation pattern. Kinetic / Mirrored / Classic preview themes still use the legacy `CvDownloadFab` + `CvDownloadCta` — when any is promoted to canonical, they can adopt `MorphingDownloadCta` via the same slot API.

| Change | Files | Notes |
| --- | --- | --- |
| Photo pipeline | `config/site.yaml`, `src/types/config.ts`, `src/lib/config.ts`, every CV theme, both CV YAMLs, `scripts/generate-cv.ts` | Breaking schema change (previous `photos.hero` removed). |
| Morphing CTA rewrite | `src/components/cv/morphing-download-cta.tsx`, `src/lib/layout/chat-layout-context.tsx`, `src/app/[locale]/layout.tsx`, `src/components/chat/chat-widget.tsx` | Single-instance portal + rect-driven `animate`. Editorial now wraps its tree in `<MorphingDownloadCta>` and drops `.TopSlot` + `.BottomSlot` at the hero / footer. |
| Aceternity Lamp port | new `src/components/shared/lamp-container.tsx`, `src/components/sections/hero-section.tsx`; `src/components/shared/lamp-reveal.tsx` deleted | Canonical Aceternity source + adaptive warm palette + session guard. Scoped to the hero's text column only. |
| Quote title | editorial theme | "In his own words" → "My motto for this year" per Reebal's request. |

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

## 10 · Iteration 2 design notes

Patterns that emerged from the iteration-1 review. These are load-bearing decisions — re-litigating them without new information costs time.

### 10.1 Container width: `max-w-5xl` vs `max-w-6xl`

- **`max-w-5xl` (64 rem ≈ 1024 px)** — used by canonical `PortfolioGalleryTheme`, Mirrored Canonical, and Scroll Hero. Matches the rest of the portfolio (About / Projects / Blog bands), so the CV reads as a peer section rather than a different site.
- **`max-w-6xl` (72 rem ≈ 1152 px)** — used by Editorial Magazine v2 and Kinetic AI v2. These variants define themselves with a wider canvas: Editorial needs magazine-spread proportions for the masthead + pull-quote; Kinetic needs more breathing room for the counters + shader + larger photo. Both hero *and* body use `max-w-6xl` so the container width is consistent top-to-bottom (a narrower body under a wider hero creates an uncomfortable "pinch").

When adding a new variant, pick `max-w-5xl` unless you have a concrete reason the wider frame is part of the identity — don't upgrade just because "bigger is better".

### 10.2 `bottomDecoration` slot on the sticky sidebar

The `CvBody` sidebar is **always** `md:sticky md:top-24 md:self-start` — same behaviour as canonical `/cv` from day one. It follows the viewport while the user reads Experience. The sidebar's content bottom ends wherever its content naturally ends; we do **not** force columns to end at the same visual line.

The opt-in prop `bottomDecoration?: ReactNode` simply renders one extra block as the last item of the sidebar's section stack. Editorial uses a Fraunces pull-quote ("In his own words" + signature); Kinetic uses a font-mono pull-quote with a terminal-style attribution. Both are identity elements that would otherwise have nowhere to go.

**Iteration-2 dead end** (kept here for history, do not retry): we attempted a `flex-stretch` aside with a `flex-1` spacer that pushed the decoration to the bottom of the grid row, hoping to align both columns' end lines. It worked visually but **broke the canonical sticky-while-scrolling feel** that Reebal explicitly wants — the aside stopped sticking and instead drifted with its content. Reverted in iter-3 after Reebal called it out ("i need the left column to scroll, where the right sticks.. so they end together. exactly like how it is now in the current one /cv").

### 10.3 Scoped `tone="dark"` via CSS variables, not the `.dark` class

Kinetic AI v2's body needs dark-palette text + borders + cards regardless of whether the user has light or dark mode on globally. We cannot flip the `.dark` class for this subtree because that would also darken the header / nav / any neighbouring component, and we'd lose the user's preference elsewhere.

The pattern: `CvBody` accepts `tone="default" | "dark"`. When `"dark"`, it sets `--foreground / --muted-foreground / --border / --card / --secondary` as inline CSS variables on a wrapping `<div>`. Every Tailwind utility inside the subtree that references those tokens (`text-muted-foreground`, `border-border`, `bg-card`, etc.) resolves against the overridden values. No class changes to any descendant. No impact outside the subtree. Values are in `oklch` so they blend cleanly with `gallery-warm` accents.

### 10.4 Two-line name split as a layout primitive

Iteration 1 let the name wrap organically based on container width. Result: at some breakpoints the hero read as one long line with the photo floating awkwardly; at others the photo jumped to a new line. Inconsistent visual weight.

Iteration 2 enforces two lines: first name on line 1, last name on line 2 (same component logic in Editorial, Kinetic, and Scroll Hero). This gives a predictable anchor for photo alignment:

- **Editorial**: photo top aligns with **first-name** top → `items-start` + `md:mt-10` to skip past the eyebrow.
- **Kinetic**: photo top aligns with **last-name** top → `items-start` + `md:mt-[clamp(6rem,calc(10.45vw+2.5rem),10.5rem)]` to skip past eyebrow + first-name line height.
- **Scroll Hero**: single centred composition, no alignment needed.

Last name in a contrasting colour/style (warm for Kinetic, gradient for Scroll, italic warm for Editorial) tells the eye "this is a two-part identity" without further chrome.

### 10.5 AnimatedCounter SSR correctness

Original Kinetic counters stayed at `0+` if the IntersectionObserver never fired (viewport margin `"-10%"` required the element to be 10 % inside the viewport, which a hero counter often isn't on initial load). Fix:

1. `useState(value)` so SSR + first paint show the real number (no flash of `0+` for no-JS users or screenshots).
2. `useInView(ref, { margin: "0px" })` so the observer fires on any overlap, including the mount-already-visible case.
3. Animation resets to `0` inside `requestAnimationFrame` (not synchronously in the effect body) to satisfy React 19's `react-hooks/set-state-in-effect` rule.

### 10.6 Dev-only preview gating

None of the `/cv/preview` or `/cv/option-N` surfaces should ship to production. They're internal A/B fixtures — visible to crawlers via `noindex` would still leak the URLs in shared links, and they distract from the canonical CV.

**Mechanism**: `src/lib/cv/preview-flag.ts` exports `isCvPreviewEnabled(): boolean`. Every preview page's default export starts with:

```ts
import { notFound } from "next/navigation";
import { isCvPreviewEnabled } from "@/lib/cv/preview-flag";

export default async function Page({ params }: Props) {
  if (!isCvPreviewEnabled()) notFound();
  // ... rest
}
```

**Behaviour matrix**:

| Environment | `NODE_ENV` | `ENABLE_CV_PREVIEW` | Preview routes |
| --- | --- | --- | --- |
| Local dev (`make dev`, `pnpm dev`) | `development` | unset | **200** |
| Local prod sim (`pnpm build && pnpm start`) | `production` | unset | **404** |
| Staging deploy (CI flag flipped on) | `production` | `true` | **200** |
| Production deploy (default) | `production` | unset | **404** |

**Why a runtime check, not a build-time conditional?** Next.js App Router resolves these per-render. A single helper keeps the gate consistent across `dev`, `next start`, and the AWS Lambda runtime — no module-level branching, no two builds.

**Routes gated**: `/cv/preview`, `/cv/option-1`, `/cv/option-2`, `/cv/option-3`, `/cv/option-4`, `/cv/option-6`. The canonical `/cv` is **not** gated.

**`robots` and `sitemap`**: every preview page already declares `robots: { index: false, follow: false }` in its metadata, and `src/app/sitemap.ts` does not enumerate any CV route. So even when `ENABLE_CV_PREVIEW=true` on staging, search engines won't index the preview surfaces.

### 10.7 Morphing download CTA — rewrite (iter-4 v2, issue #46)

The first iter-4 implementation used `<motion.button layoutId="cv-morph-cta">` rendered inside each slot's `<AnimatePresence>`, relying on Framer Motion's `layoutId` to animate the bounding rect between mount sites. Three bugs emerged in practice:

1. **FAB sat under the chat widget** (both at `fixed bottom-6 end-6 z-50`; chat mounted later → paint order won).
2. **Morph was not smooth** — scrolling from the hero produced "full pill → tiny intermediate rectangle mid-screen → circle". `AnimatePresence` unmounted the old slot before the new slot committed layout, so Framer interpolated toward a stale origin.
3. **Scroll-up darted off-screen** — same root cause, in reverse.

**Rewrite**: ONE `<motion.button>` mounted exactly once, inside a React portal attached to `document.body`. Its position/size/radius are driven by the `animate` prop, targeting the bounding rect of whichever slot is currently active. The slot components (`TopSlot`, `BottomSlot`) become invisible placeholders (`opacity-0 pointer-events-none`) that reserve layout space and publish their rects via `ResizeObserver` + scroll listeners to a local context. The button is never unmounted → Framer always has a valid source and target rect → smooth spring interpolation, no intermediate states, no darts.

```ts
// Resolve the target rect every time scroll state or chat layout changes
const target = useMemo<Target | null>(() => {
  if (state === "top" && topRect)    return { ...topRect, borderRadius: PILL_RADIUS };
  if (state === "bottom" && bottomRect) return { ...bottomRect, borderRadius: PILL_RADIUS };
  // fab: anchor to chat dialog (if open) or chat button, with a 12 px gap
  const anchor = chatOpen && chatDialog ? chatDialog : chatButton;
  if (anchor) return {
    top:    anchor.top   - FAB_GAP - FAB_SIZE,
    left:   anchor.right - FAB_SIZE,
    width:  FAB_SIZE, height: FAB_SIZE, borderRadius: FAB_RADIUS,
  };
  return /* viewport-anchored fallback */;
}, [state, topRect, bottomRect, chatButton, chatDialog, chatOpen]);

// Single portal-button, `animate` targets the rect:
<motion.div
  style={{ position: "fixed" }}
  animate={{ top, left, width, height }}
  transition={{ type: "spring", stiffness: 260, damping: 32, mass: 0.8 }}
>
  <motion.button animate={{ borderRadius }}>…</motion.button>
</motion.div>
```

**State derivation** — rAF-throttled scroll listener. In v3 the bottom trigger was switched from midline to "slot fully visible" because on short CV pages the bottom slot never reached the viewport midline (see §10.9):

```ts
const mid = window.innerHeight / 2;
const bottomSlotRect = bottomSentinel.parentElement.getBoundingClientRect();
if (topSentinel.top > mid)                        next = "top";
else if (bottomSlotRect.bottom <= innerHeight)    next = "bottom";
else                                              next = "fab";
```

**Chat-collision fix via `ChatLayoutContext`** (`src/lib/layout/chat-layout-context.tsx`). The chat widget registers its button + dialog refs via `useRegisterChatButton(ref)` + `useRegisterChatDialog(ref, open)`; the context exposes `buttonRect`, `dialogRect`, `isOpen`. The morph button's FAB rect is *derived from* these values (above the dialog when open; above the button otherwise), so by construction the FAB never collides with the chat at any viewport width. No DOM queries, no z-index race, no `MutationObserver`-on-`document.body` (the previous pattern in `cv-download-fab.tsx`, kept there for the other themes).

**Panel close on slot change** — unchanged from v1: derived state, no `useEffect`. When `state` changes due to scroll, `panelOpen` automatically evaluates `false` without any effect firing.

**Reduced motion**: `useReducedMotion()` swaps the spring for `{ duration: 0 }`, so state changes snap instantly. Magnetic hover is also disabled.

**Placeholder-based layout reservation**: each `TopSlot` / `BottomSlot` renders a `<div data-morph-slot="top|bottom">` styled to look identical to the portal button (`inline-flex h-12 px-6 rounded-md bg-gallery-warm …`) but with `opacity-0 pointer-events-none` and `aria-hidden="true"`. The div's `ResizeObserver` publishes its rect to the provider; the portal button animates to that rect. This way the inline layout reserves the correct space and the portal button overlays exactly on top — no visual seam.

**SSR safety**: `useSyncExternalStore` provides a mount-aware `useHasMounted()` helper that returns `false` on the server and `true` after hydration, gating the `createPortal(..., document.body)` call. No hydration mismatch, no `setState` in effect (satisfies the React 19 lint rule).

---

### 10.8 Aceternity Lamp port (current: iter-4 v3, issue #46)

The canonical Aceternity Lamp component, fetched 1:1 from the Aceternity shadcn registry (`ui.aceternity.com/registry/lamp.json`) and ported to `src/components/shared/lamp-container.tsx`. Every coordinate, translate value, duration (`0.8 s`), ease (`easeInOut`), and masking rectangle matches the source. See §10.9 for the v2 → v3 deltas (outer wrapper drop, left-aligned + 30%-down positioning, hasMounted gate).

**Palette** (v3) — three scoped CSS custom properties declared inline on the backdrop:

| Token | Light-mode value | Dark-mode value | Maps to |
|---|---|---|---|
| `--lamp-surface` | `transparent` | `transparent` | Aceternity's `bg-slate-950` (wall + masks — now invisible, so beams are not cut) |
| `--lamp-beam` | `oklch(0.75 0.16 55)` | `oklch(0.78 0.14 55)` | Aceternity's `from-cyan-500` beams |
| `--lamp-glow` | `oklch(0.78 0.14 55)` | `oklch(0.82 0.12 55)` | Aceternity's `bg-cyan-500 opacity-50` glow disc |
| `--lamp-core` | `oklch(0.82 0.15 50)` | `oklch(0.90 0.10 55)` | Aceternity's `bg-cyan-400` core + horizon line |

`--lamp-text` / `--lamp-text-muted` were removed in v3 — hero text is no longer a child of the lamp and uses the site's native `text-foreground` / `text-muted-foreground`.

Dark-mode detection uses `useSyncExternalStore` + a `MutationObserver` on `document.documentElement`'s `class` attribute. Zero `setState`, zero `useEffect` — satisfies the React 19 `set-state-in-effect` rule.

**Replay guard**: `sessionStorage.getItem("lampPlayed")`. First mount within a session plays the reveal; subsequent mounts render end-state. `prefers-reduced-motion: reduce` also forces end-state. v3 decides via `useState(() => ...)` initialiser and defers the `sessionStorage.setItem` to `setTimeout(..., 0)` so React's Strict Mode double-mount doesn't skip the reveal.

**Composition** (v3): `<LampBackdrop />` is an absolute sibling inside the hero's right column (relative parent, no overflow rule so beams radiate freely). Bulb focal point aligns with the text's inline-start edge, 30% down the column. The left column (photo + geometric orbs) is unchanged. On mobile the grid stacks and the lamp renders behind the text block.

**Why conic gradients via inline `style`, not Tailwind**: Aceternity's source uses `bg-gradient-conic` (Tailwind v3 + custom plugin). Tailwind v4 has `bg-conic` but it only accepts angles, not full `from 70deg at center top` positions. Inline `style={{ backgroundImage: "conic-gradient(from 70deg at center top, var(--lamp-beam), ...)" }}` gives us full control, is portable across Tailwind versions, and uses our scoped custom properties directly.

---

### 10.9 Iter-4 v3 — polish pass (issue #46 continued)

Three bugs surfaced during the v2 review:

1. **Top-slot button "danced" during scroll.** `animate={{top,left,width,height}}` on the portal wrapper restarted a spring every scroll tick because `target` was a fresh `useMemo` object per render. The spring never settled; the button trailed the placeholder visibly.
2. **Bottom slot never activated.** The v2 state-derivation fired `"bottom"` only when `bottomSentinel.top ≤ innerHeight / 2`. On a typical CV page the bottom slot sits near document bottom; at max scroll its top is still far below the midline, so the condition was unreachable.
3. **FAB collided with the chat button** in the pre-hydration window (before `ChatLayoutContext` publishes a rect). The fallback used `FAB_FALLBACK_MARGIN = 24 px` (= `bottom-6`), exactly the chat button's own slot.

**Fix 1 — no more dancing**: replaced `animate={target}` with five motion values (`top`, `left`, `width`, `height`, `borderRadius`) driven imperatively. One `useLayoutEffect` tracks the previous state via a ref; spring fires only when `state` changes (or when we're still mid-spring from a prior transition). Intra-state scroll updates call `motionValue.set()` which is instant — no spring, no dancing. Generation-based interruption handling keeps `animatingRef` honest when a state change happens mid-flight:

```ts
const shouldSpring =
  !prefersReducedMotion && (stateChanged || animatingRef.current);

if (shouldSpring) {
  animControlsRef.current.forEach((c) => c.stop());
  const gen = ++animGenRef.current;
  animatingRef.current = true;
  animControlsRef.current = [
    animate(top, target.top, spring),
    animate(left, target.left, spring),
    /* width, height, borderRadius */
  ];
  Promise.allSettled(animControlsRef.current.map((c) => c.finished))
    .then(() => { if (animGenRef.current === gen) animatingRef.current = false; });
} else {
  top.set(target.top); left.set(target.left); /* … */
}
```

**Fix 2 — bottom trigger**: check `bottomSlotRect.bottom ≤ innerHeight` (slot fully visible) instead of `top ≤ innerHeight/2`. Fires naturally as the user scrolls close to the footer regardless of how short the content below the slot is. The sentinel's parent element *is* the inline slot wrapper, so `sentinel.parentElement.getBoundingClientRect()` gives us the slot's own rect without an extra ref.

**Fix 3 — FAB fallback**: new constant `FAB_FALLBACK_BOTTOM = 96` (= `bottom: 6rem`, matching the legacy `CvDownloadFab` production default). When `ChatLayoutContext` hasn't published a rect yet, the FAB lands ABOVE the chat's standard slot rather than inside it. The fab branch also now computes `bottomPx` / `rightPx` from whichever chat rect is freshest (dialog if open, button otherwise), with the fallback as the third branch:

```ts
if (chatOpen && chatDialog)  { bottomPx = vh - chatDialog.top + 20; rightPx = vw - chatDialog.right; }
else if (chatButton)          { bottomPx = vh - chatButton.top + FAB_GAP; rightPx = vw - chatButton.right; }
else                          { bottomPx = FAB_FALLBACK_BOTTOM;           rightPx = FAB_FALLBACK_MARGIN; }
```

**Lamp rewrite** (see §10.8 table for the new palette). The v2 `<LampContainer>` was a dark rounded container wrapping the hero text; v3 replaces it with `<LampBackdrop />`, an absolute-positioned sibling that keeps every Aceternity DOM element (cones, masks, wall, blur strip, line, blob, glow) but:

- Drops the outer wrapper (no `bg-color`, `overflow-hidden`, `rounded-md`, or `min-h-[60vh]`).
- Positions with `start-0 -translate-x-1/2 rtl:translate-x-1/2 top-[30%] w-[60rem] h-[40rem]` so the bulb's horizontal centre aligns with the text's inline-start edge, 30% down the right column.
- Sets `--lamp-surface` to `transparent` in both modes so the retained wall + masks don't paint visible rectangles on the page (honouring the user's "lights should not be cutted" constraint without removing any Aceternity element).
- Bumps `--lamp-beam` / `--lamp-glow` / `--lamp-core` chroma for light mode so the warm gradient reads well against a cream page.
- Gates the motion tree on `useHasMounted()` so Framer reads `initial={start}` fresh on the first real client render — v2 had the motion.divs rendered at SSR with `initial=end`, leaving the 15rem → 30rem reveal a no-op. v3 plays the Aceternity reveal correctly.
- Drops `--lamp-text` / `--lamp-text-muted`. Hero text is now a sibling of the backdrop rendered with `text-foreground` / `text-muted-foreground` (native theme).

Session-storage write is deferred to `setTimeout(..., 0)` so React's Strict Mode synchronous double-mount doesn't cause the second mount to skip the reveal (the first mount would otherwise set the key between mounts).

---

*Last updated 2026-04-20 — iter-4 v3: morph polish (motion values → no-dance, slot-fully-visible bottom trigger, 6rem FAB fallback) + Lamp rewrite as absolute backdrop with transparent surface + left-aligned 30%-down positioning.*
