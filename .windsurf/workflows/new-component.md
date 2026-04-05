---
description: Workflow for creating a new React component
---

## New Component Workflow

When creating a new component:

1. **Check 21st.dev first** — search for an existing production-ready component that matches the need. Install with `npx shadcn@latest add` or 21st.dev CLI if found.

2. **Check UI UX Pro Max** — get design guidance for the component (spacing, colors, animation patterns).

3. **Check Context7** — fetch latest docs for any library the component will use (Framer Motion, next-intl, etc.).

4. **Create the component file** in the appropriate directory:
   - `src/components/ui/` — primitives (button, card, input)
   - `src/components/layout/` — shell components (Header, Footer)
   - `src/components/sections/` — page sections (HeroSection, AboutSection)
   - `src/components/cards/` — data display cards (ProjectCard, BlogCard)
   - `src/components/shared/` — reusable utilities (TechBadge, AnimatedSection)
   - `src/components/chat/` — chatbot components

5. **Implementation checklist**:
   - [ ] TypeScript interface for props (no `any`)
   - [ ] Server Component by default; `"use client"` only if interactive
   - [ ] All text via `useTranslations()` — add keys to ALL 4 locale files
   - [ ] Responsive (mobile-first approach)
   - [ ] Dark mode support
   - [ ] RTL support (logical CSS properties)
   - [ ] Accessibility (semantic HTML, aria attributes, keyboard nav)
   - [ ] Animation via Framer Motion (respect `prefers-reduced-motion`)
   - [ ] Config values from `config/site.yaml` where applicable

6. **Test** — add unit test if the component has logic. Visual check at 3 breakpoints + dark mode + RTL.

7. **Commit** — descriptive message: `feat(components): add <ComponentName> — <purpose>`
