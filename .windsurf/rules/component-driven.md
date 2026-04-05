---
description: Every UI piece is a reusable, encapsulated component
---

- Every UI element must be a reusable React component with clear props interface.
- Components are organized by function: `ui/` (primitives), `layout/` (shell), `sections/` (page sections), `cards/` (data cards), `shared/` (utilities), `chat/` (chatbot).
- Each component file exports ONE primary component. Co-located types are fine.
- Props must be typed with TypeScript interfaces. No `any` types.
- Components must not fetch their own data — receive data via props or server component patterns.
- Prefer Server Components by default. Use `"use client"` only when necessary (interactivity, hooks, browser APIs).
