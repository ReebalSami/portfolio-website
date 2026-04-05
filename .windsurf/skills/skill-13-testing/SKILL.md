---
name: skill-13-testing
description: Set up unit tests with Vitest and E2E tests with Playwright covering all critical paths
---

## Skill 13: Testing

### Goal
Unit tests (Vitest) + E2E tests (Playwright) covering critical paths.

### Prerequisites
Skills 04-10 completed.

### GitHub
- **Milestone**: M4: Polish & Quality
- **Issue**: "Skill 13: Testing"
- **Branch**: `feat/skill-13-testing`

### Steps

1. **Vitest setup**: `vitest.config.ts`, `tests/setup.ts`
   - Config parsing + validation
   - Utility functions
   - Key components (TechBadge, ProjectCard)
   - API route handlers (mock req/res)

2. **Playwright setup**: `playwright.config.ts`
   - Navigate all pages
   - Locale switching
   - Contact form (mock API)
   - Blog navigation
   - Responsive (mobile, tablet, desktop)
   - RTL (Arabic)
   - Dark mode toggle

3. Add test commands to Makefile
4. Ensure tests run in CI

### Acceptance Criteria
- [ ] `make test` — all pass
- [ ] `make test:e2e` — all pass on 3 browsers
- [ ] Coverage for critical paths
- [ ] **Show local demo to Reebal before pushing**
