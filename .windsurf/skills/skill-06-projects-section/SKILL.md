---
name: skill-06-projects-section
description: Build the Projects page with filterable project grid and individual project detail pages
---

## Skill 06: Projects Section

### Goal
Filterable project grid + individual project detail pages.

### Prerequisites
Skill 05 completed.

### GitHub
- **Milestone**: M2: Core Pages
- **Issue**: "Skill 06: Projects Section"
- **Branch**: `feat/skill-06-projects-section`

### Steps

1. **Project data** in `src/content/projects/` (structured YAML per project)

2. **6 projects**:
   - B2B Sales Lead Pipeline — Multi-LLM Agents, 53% workload reduction
   - Urban Farming Plant Health — ViT/CNN, Explainable AI
   - Bankruptcy Early Warning — RF/Logit, Econometrics
   - Biotech Regulatory RAG — RAG, LLMs, compliance
   - OTTO Recommender — Word2Vec, Co-Visitation, GCP
   - MyRecipes App — Java/Spring Boot, React, MongoDB

3. **ProjectCard** component:
   - Thumbnail/screenshot
   - Title, short description
   - Tech badges
   - Key metric
   - GitHub/demo links
   - Hover: subtle lift + shadow

4. **Grid page** (`/projects`):
   - Filter by category/tech (animated with Framer Motion layout)
   - 3 cols desktop, 2 tablet, 1 mobile

5. **Detail pages** (`/projects/[slug]`):
   - Full description, architecture, tech, results
   - "Other Projects" nav at bottom

6. **Adding a new project = adding a data file only**

### Acceptance Criteria
- [ ] All 6 projects render correctly
- [ ] Filter animation smooth
- [ ] Detail pages load
- [ ] GitHub links work
- [ ] Data-driven (no hardcoded content)
- [ ] **Show local demo to Reebal before pushing**
