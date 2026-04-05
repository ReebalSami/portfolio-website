---
name: skill-03-layout-shell
description: Build the persistent layout shell — Header with navigation, Footer, mobile menu, locale switcher placeholder, dark mode toggle
---

## Skill 03: Layout Shell

### Goal
Build the persistent layout — Header, Footer, Navigation, mobile hamburger menu, locale switcher placeholder, dark mode toggle.

### Prerequisites
Skill 02 completed.

### Context7 Lookups
- `next.js` — App Router layouts, Link component
- `framer-motion` — AnimatePresence, layout animations
- `next-intl` — read ahead for navigation setup

### GitHub
- **Milestone**: M1: Foundation
- **Issue**: "Skill 03: Layout Shell"
- **Branch**: `feat/skill-03-layout-shell`

### Steps

1. **Header component** (`src/components/layout/Header.tsx`):
   - Logo/name on left ("RS" monogram or "Reebal Sami")
   - Nav links: Home, About, Projects, Blog, Contact
   - Locale switcher button (placeholder — full in Skill 09)
   - Dark mode toggle button
   - Mobile: hamburger → slide-in Sheet (shadcn/ui)
   - Sticky with backdrop blur on scroll

2. **Footer component** (`src/components/layout/Footer.tsx`):
   - Social links with icons (LinkedIn, GitHub, Email)
   - "Hamburg, Germany" location
   - Copyright © {year}
   - "Built with Next.js & deployed on AWS"

3. **Navigation** (`src/components/layout/Navigation.tsx`):
   - Shared logic for desktop horizontal nav + mobile sheet nav
   - Active link highlighting

4. **Wire up** in `src/app/[locale]/layout.tsx`

5. **Responsive**:
   - Desktop (≥1024px): horizontal nav
   - Mobile (<1024px): hamburger menu

6. **All text via translation keys** (hardcode English for now, replaced in Skill 09)

### Acceptance Criteria
- [ ] Header renders with all nav links
- [ ] Mobile hamburger opens/closes smoothly
- [ ] Dark mode toggle works
- [ ] Footer renders with social links
- [ ] Navigation between pages works (placeholder pages OK)
- [ ] Responsive at all breakpoints (375px, 768px, 1024px, 1440px)
- [ ] Sticky header with backdrop blur
- [ ] **Show local demo to Reebal before pushing**
