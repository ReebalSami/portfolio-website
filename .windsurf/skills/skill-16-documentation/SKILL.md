---
name: skill-16-documentation
description: Create professional README with D2 architecture diagram, contributing guide, and full technical documentation
---

## Skill 16: Documentation & Architecture Diagram

### Goal
Professional README, D2 + Mermaid architecture diagram, full docs.

### Prerequisites
All other skills completed.

### GitHub
- **Milestone**: M5: Deployment
- **Issue**: "Skill 16: Documentation & Architecture Diagram"
- **Branch**: `feat/skill-16-documentation`

### Steps

1. **D2 architecture diagram** (`docs/architecture.d2`):
   - Client → CloudFront → S3/Lambda
   - API → OpenAI + Resend
   - CI/CD: GitHub → Actions → CDK → AWS
   - i18n routing flow
   - Render: `d2 docs/architecture.d2 docs/architecture.svg`
   - Add `make diagram` target

2. **Mermaid fallback** in README (GitHub renders natively)

3. **README.md**:
   - Badges (CI status, license, Next.js version)
   - Screenshot/preview
   - Architecture diagram
   - Tech stack table
   - Getting started (prereqs, install, dev)
   - Configuration (site.yaml, env vars)
   - Deployment (CDK)
   - Structure overview
   - Testing
   - i18n (adding translations)
   - Blog (adding posts)
   - License (MIT)

4. **docs/ARCHITECTURE.md**:
   - Design decisions + rationale
   - Infrastructure details
   - CI/CD pipeline
   - i18n implementation
   - Chatbot architecture
   - Performance strategy

### Acceptance Criteria
- [ ] D2 renders clean SVG
- [ ] README is comprehensive
- [ ] New contributor can set up from README alone
- [ ] Mermaid renders on GitHub
- [ ] **Show final demo to Reebal before pushing**
