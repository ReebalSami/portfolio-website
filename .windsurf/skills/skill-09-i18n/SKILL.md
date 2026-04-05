---
name: skill-09-i18n
description: Implement full internationalization with next-intl for EN, DE, ES, AR including RTL Arabic support
---

## Skill 09: i18n (EN/DE/ES/AR + RTL)

### Goal
Full i18n with 4 locales, locale-prefixed routing, RTL for Arabic.

### Prerequisites
Skills 03-08 (all pages must exist before adding i18n).

### Context7 Lookups
- `next-intl` — full App Router setup, routing, middleware

### GitHub
- **Milestone**: M3: Content & Features
- **Issue**: "Skill 09: i18n (4 locales + RTL)"
- **Branch**: `feat/skill-09-i18n`

### Steps

1. **next-intl setup**:
   - `src/i18n/request.ts` — locale config
   - `src/i18n/routing.ts` — routing config
   - `src/middleware.ts` — locale detection, redirect, cookie preference
   - `next.config.ts` — `createNextIntlPlugin`

2. **Translation files** (`src/messages/`):
   - `en.json` — English (primary, complete)
   - `de.json` — German (complete)
   - `es.json` — Spanish (complete)
   - `ar.json` — Arabic (complete)

3. **Structure**:
   ```json
   {
     "common": { "nav": {}, "footer": {}, "buttons": {} },
     "home": { "hero": {} },
     "about": {},
     "projects": {},
     "blog": {},
     "contact": {},
     "chat": {}
   }
   ```

4. **Replace ALL hardcoded strings** with `useTranslations()`

5. **LocaleSwitcher** component:
   - Dropdown: language name + flag
   - Changes URL prefix (`/en/about` → `/de/about`)
   - Saves preference in cookie

6. **Arabic RTL**:
   - `dir="rtl"` on `<html>` when `ar`
   - Replace all `ml-`/`mr-`/`pl-`/`pr-` with logical (`ms-`/`me-`/`ps-`/`pe-`)
   - Arabic font loaded conditionally
   - Flip hero layout
   - Test every page in RTL

7. **URL**: `/{locale}/page`, default English, redirect `/` → `/en`

8. **SEO**: hreflang tags for all locale variants

### Acceptance Criteria
- [ ] All 4 locales load with translated content
- [ ] URL routing: `/en/*`, `/de/*`, `/es/*`, `/ar/*`
- [ ] LocaleSwitcher works and preserves page
- [ ] Arabic RTL layout correct
- [ ] No hardcoded strings in any component
- [ ] hreflang tags present
- [ ] **Show local demo to Reebal before pushing**
