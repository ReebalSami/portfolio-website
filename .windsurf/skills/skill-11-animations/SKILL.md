---
name: skill-11-animations
description: Add Framer Motion animations — scroll reveals, page transitions, micro-interactions throughout the site
---

## Skill 11: Animations

### Goal
Scroll reveals, page transitions, micro-interactions with Framer Motion.

### Prerequisites
Skills 04-08 completed.

### GitHub
- **Milestone**: M4: Polish & Quality
- **Issue**: "Skill 11: Animations"
- **Branch**: `feat/skill-11-animations`

### Steps

1. **AnimatedSection** wrapper: `useInView`, fade+slide, configurable direction/delay
2. Wrap all major sections
3. **Page transitions**: `AnimatePresence` cross-fade
4. **Micro-interactions**: card lift, button scale, nav underline, badge hover
5. **Hero**: staggered entrance (photo → shapes → label → title → tagline → CTAs)
6. **Timeline**: progressive reveal on scroll
7. **Respect `prefers-reduced-motion`** — disable all motion

### Acceptance Criteria
- [ ] All animations 60fps
- [ ] `prefers-reduced-motion` disables them
- [ ] No layout shift from animations
- [ ] **Show local demo to Reebal before pushing**
