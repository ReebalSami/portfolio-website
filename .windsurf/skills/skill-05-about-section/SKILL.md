---
name: skill-05-about-section
description: Build the About page with career timeline, tech stack grid, key differentiators, and downloadable CV
---

## Skill 05: About Section

### Goal
About page with career timeline, tech stack grid, differentiators, and downloadable CV.

### Prerequisites
Skill 04 completed.

### GitHub
- **Milestone**: M2: Core Pages
- **Issue**: "Skill 05: About Section"
- **Branch**: `feat/skill-05-about-section`

### Steps

1. **Professional summary** (2-3 paragraphs from resume + career coaching strengths)

2. **Key differentiator cards** (3-4 cards):
   - "Business × Data" — 5yr Otto Group finance + DS transition
   - "End-to-End Builder" — concept to MVP, 53% workload reduction
   - "Multilingual" — DE, EN, AR, ES, FR
   - "M.Sc. Candidate" — FH Wedel, DS & AI

3. **TimelineSection** — vertical timeline with career journey:
   - Banking (Syria) → Au-Pair (Hamburg) → Otto Group → Bootcamps → M.Sc. → Datalogue → Future
   - Each entry: date, title, company, brief description
   - Data from structured files, NOT hardcoded

4. **Tech stack grid** — grouped by category (Languages, Frameworks, ML/AI, Tools, Cloud)
   - Each skill as `TechBadge` with icon
   - Filterable by category (optional)

5. **Download CV button** → PDF in `public/`

6. **Scroll-triggered animations** via Framer Motion

### Acceptance Criteria
- [ ] Compelling professional story
- [ ] Timeline accurate to CV dates
- [ ] Tech stack grid shows all skills
- [ ] Responsive at all breakpoints
- [ ] All text via translation keys
- [ ] **Show local demo to Reebal before pushing**
