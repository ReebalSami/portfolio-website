---
name: skill-04-hero-section
description: Build the hero section with professionally edited B&W photo, geometric shapes, name, title, tagline, and CTA buttons matching the Roel Hermans reference
---

## Skill 04: Hero Section

### Goal
Build the hero section matching the Roel Hermans reference — split layout with B&W photo + geometric shapes on left, text + CTAs on right.

### Prerequisites
Skill 03 completed.

### Context7 Lookups
- `next.js` — Image component, optimization
- `framer-motion` — entrance animations, stagger children

### GitHub
- **Milestone**: M2: Core Pages
- **Issues**:
  - "Skill 04: Hero Section"
  - "ACTION @ReebalSami: Edit hero photo to match reference" (assigned to Reebal)

### Photo Editing (Reebal's action)

The photo `photo/start-photo.JPG` needs to be edited to match the Roel Hermans reference:
- Crop/reframe to match the composition
- Optionally pre-process to B&W (or apply CSS filter at runtime)
- Save edited version to `public/images/hero/`

If Reebal hasn't edited the photo yet, use the original with CSS B&W filter as a placeholder.

### Steps

1. **Copy photo** to `public/images/hero/start-photo.JPG` (or use edited version)

2. **HeroSection component** (`src/components/sections/HeroSection.tsx`):
   - Split layout: photo left, text right (desktop) / stacked (mobile)
   - Photo area:
     - B&W via CSS `filter: grayscale(100%) contrast(1.1)`
     - `next/image` with `priority` loading
     - `GeometricShapes` behind photo (absolute positioned)
     - Subtle parallax on geometric shapes
   - Text area:
     - Label: "DATA SCIENTIST & AI ENGINEER" (small caps, letter-spaced)
     - Name: "Reebal Sami" (hero-title size, bold)
     - Tagline: from `config/site.yaml`
     - Brief intro (2-3 sentences)
     - CTA buttons: "View Projects" (primary) + "Get in Touch" (outline)

3. **Entrance animation**: staggered (photo → shapes → label → name → tagline → CTAs)

4. **Photo path from `config/site.yaml`** — changing the photo = changing one line in config

### Acceptance Criteria
- [ ] Hero matches Roel Hermans reference aesthetic
- [ ] Photo is B&W with decorative geometric shapes
- [ ] Text hierarchy clear: label → name → tagline → body → CTAs
- [ ] Responsive: split on desktop, stacked on mobile
- [ ] Entrance animation plays on first load
- [ ] Photo swappable via config only
- [ ] Lighthouse: no LCP issues
- [ ] **Show local demo to Reebal before pushing**
