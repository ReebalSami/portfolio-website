---
name: skill-12-seo-performance
description: Optimize SEO with metadata, structured data, sitemap, and achieve Lighthouse 90+ scores
---

## Skill 12: SEO & Performance

### Goal
Lighthouse 90+ all metrics, structured data, sitemap, accessibility.

### Prerequisites
Skills 04-09 completed.

### GitHub
- **Milestone**: M4: Polish & Quality
- **Issue**: "Skill 12: SEO & Performance"
- **Branch**: `feat/skill-12-seo-performance`

### Steps

1. `generateMetadata` for every page (title, desc, OG, canonical)
2. hreflang tags, JSON-LD (Person, BlogPosting), sitemap, robots.txt
3. OG images (default + optional dynamic via `next/og`)
4. Performance: `next/image` sizes, lazy load, prefer RSC, font swap, preconnect
5. Accessibility: axe audit, contrast WCAG AA, keyboard nav, skip link, focus indicators
6. Run Lighthouse, fix anything below 90

### Acceptance Criteria
- [ ] Lighthouse: ≥90 / ≥95 / ≥95 / 100
- [ ] Structured data validates
- [ ] Sitemap includes all pages + locales
- [ ] Keyboard navigation end-to-end
- [ ] **Show local demo to Reebal before pushing**
