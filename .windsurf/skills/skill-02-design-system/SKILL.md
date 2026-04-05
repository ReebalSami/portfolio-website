---
name: skill-02-design-system
description: Generate the complete design system using UI UX Pro Max with NFT Art Gallery style, set up light/dark mode, fonts, and shadcn/ui theme
---

## Skill 02: Design System & Theme

### Goal
Use UI UX Pro Max to generate the complete design system. Set up light (default) and dark mode, typography, and shadcn/ui theme override.

### Prerequisites
Skill 01 completed.

### Context7 Lookups
- `tailwindcss` — custom theme, CSS variables
- `shadcn-ui` — theming, dark mode
- `next-themes` — theme provider

### GitHub
- **Milestone**: M1: Foundation
- **Issue**: "Skill 02: Design System & Theme"
- **Branch**: `feat/skill-02-design-system`

### Steps

1. **Invoke UI UX Pro Max** (`@skills:ui-ux-pro-max`):
   ```
   Build a personal portfolio website for a Data Scientist & AI Engineer.
   Style: NFT Art Gallery — elegant, minimal, curated, art-focused.
   Mode: Light (default) / Dark.
   Layout reference: Roel Hermans portfolio (split hero, B&W photo with geometric shapes).
   Stack: Next.js + Tailwind CSS + shadcn/ui.
   ```
   The skill will generate: color palette, typography, effects, anti-patterns, checklist.

2. **Apply generated design system**:
   - Override Tailwind theme in `tailwind.config.ts` with generated colors
   - Set up CSS custom properties in `globals.css` for light and dark modes
   - Map shadcn/ui CSS variables to the generated palette

3. **Configure fonts** via `next/font/google`:
   - Use the typography pairing recommended by UI UX Pro Max
   - Add Arabic font (IBM Plex Sans Arabic) for `ar` locale — loaded conditionally
   - Monospace font for code blocks (JetBrains Mono or recommended)

4. **Install shadcn/ui components**:
   ```bash
   pnpm dlx shadcn@latest add button card dialog input textarea badge separator sheet dropdown-menu tooltip
   ```

5. **Set up dark mode**:
   - Install `next-themes`: `pnpm add next-themes`
   - Create `ThemeProvider` component
   - Light mode is the DEFAULT
   - Toggle in header (implemented in Skill 03)

6. **Create reusable design components**:
   - `TechBadge` — pill-shaped, color-coded by category
   - `SectionHeading` — consistent heading style
   - `GeometricShapes` — decorative SVG shapes for hero background

### Acceptance Criteria
- [ ] Design system matches UI UX Pro Max NFT Art Gallery output
- [ ] Light mode is default, dark mode toggle works
- [ ] Fonts load correctly without CLS
- [ ] shadcn/ui components render with the custom theme
- [ ] All colors come from CSS variables (no hardcoded hex in components)
- [ ] Pre-delivery checklist from UI UX Pro Max passes
- [ ] **Show local demo to Reebal before pushing**
