---
description: Code review workflow for portfolio website components and features
---

## Code Review Workflow

When reviewing code changes:

1. **Read the full file(s)** — never partial reads. Understand the complete context.

2. **Check against rules** — verify all `.windsurf/rules/*.md` are followed:
   - No hardcoded strings (config or i18n?)
   - No `any` types
   - Server Component by default, `"use client"` only when needed
   - Props typed with interfaces
   - Translation keys for all user-facing text

3. **Identify issues** — look for:
   - Bugs and logic errors
   - Edge cases (empty data, long text, missing translations)
   - Security issues (exposed API keys, XSS, injection)
   - Accessibility problems (missing alt text, contrast, keyboard nav)
   - Performance issues (unnecessary re-renders, large bundles, unoptimized images)
   - RTL layout breakage (Arabic locale)
   - Dark mode rendering issues

4. **Verify responsiveness** — check mobile (375px), tablet (768px), desktop (1280px+)

5. **Run checks**:
   - `make lint` — zero errors
   - `make build` — successful build
   - `make test` — all tests pass
   - Browser check — visual verification at multiple breakpoints

6. **Report** — list findings with severity (critical/warning/info), file path, and line number. Suggest fixes.
