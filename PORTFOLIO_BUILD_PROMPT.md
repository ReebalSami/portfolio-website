# Portfolio Website — Master Build Prompt

## For: Reebal Sami — Data Scientist & AI Engineer
## Tool: Windsurf IDE with Claude Opus 4.6 Thinking (1M context)
## Repo: git@github.com:ReebalSami/portfolio-website.git

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Design System](#2-design-system)
3. [Tech Stack & Architecture](#3-tech-stack--architecture)
4. [Project Structure](#4-project-structure)
5. [Configuration System](#5-configuration-system)
6. [Skills Breakdown](#6-skills-breakdown)
7. [Content Data](#7-content-data)
8. [Architecture Diagram Spec](#8-architecture-diagram-spec)
9. [GitHub Project Management](#9-github-project-management)
10. [New Skills for CV](#10-new-skills-for-cv)

---

## 1. Project Overview

### Who

**Reebal Sami** — Data Scientist & AI Engineer, Hamburg, Germany. M.Sc. candidate DS&AI at FH Wedel. Finance background (5yr Otto Group), career transition into DS/AI. Multilingual: DE, EN, AR (native), ES, FR.

### What

Personal portfolio website: projects, skills, career journey, technical blog, AI chatbot that answers visitor questions. The website itself showcases engineering excellence — IaC, CI/CD, i18n with RTL, accessibility, performance.

### Design Reference

- **Layout**: Follows the **Roel Hermans portfolio** aesthetic (see `docs/design/Portfolio-website-Roel-Hermans-min-1200x855.png`)
- **Style**: **NFT Art Gallery** via UI UX Pro Max — elegant, minimal, curated, art-focused. Light mode (default) / Dark mode. See `docs/prompts/NFT-Art-Gallery-promt.md`
- **Photo**: The hero photo (`photo/start-photo.JPG`) must be **professionally edited** to match the Roel Hermans reference — B&W treatment, geometric shapes, proper cropping/composition. Use image editing tools (Sharp, Canvas API, or manual edit) to create a production-ready version.

### How to Work

**CRITICAL: Build skill-by-skill, never all at once.**

Each skill has a dedicated `SKILL.md` in `.windsurf/skills/`. Complete one fully (implement → local demo → user approval → commit → push → deploy) before starting the next.

**Windsurf features to leverage:**
- `@rules:` — Read and follow all `.windsurf/rules/`
- `@skills:` — Invoke skills by name
- `@codemaps:` — Generate and use codemaps for codebase understanding
- `@terminal:` — Run commands, check build output
- `@git:` — Commit, push, branch management
- `@mcp:` — Context7 for docs, GitHub MCP for project management
- `[web]` — Search for latest docs, best practices
- `@codeContext:` — Understand full codebase context

**Before implementing any library:**
1. Use **Context7 MCP** to fetch latest docs (`resolve <library>` → `get-library-docs`)
2. Use **21st.dev** to search for existing production-ready components before building custom
3. Use **UI UX Pro Max** skill (`@skills:ui-ux-pro-max`) — it auto-generates the design system (colors, typography, spacing, effects) based on the NFT Art Gallery style. Do NOT hardcode colors — let the skill generate them.

**Configuration-first:** ALL parameters in `config/site.yaml`. NEVER hardcode strings, URLs, or configurable values.

**GitHub-first:** Every feature maps to a GitHub Issue. Work on the Issue → local demo → approval → commit → push → close Issue. Track progress on the GitHub Project board.

**No deploy before approval:** ALWAYS show a local live demo before committing. Only after Reebal approves: commit → push → deploy.

---

## 2. Design System

**DO NOT hardcode colors, fonts, or spacing in the prompt or in code.**

Use **UI UX Pro Max** (`@skills:ui-ux-pro-max`) to generate the complete design system. Invoke it with:

```
Build a personal portfolio website for a Data Scientist & AI Engineer.
Style: NFT Art Gallery — elegant, minimal, curated, art-focused.
Mode: Light (default) / Dark.
Layout reference: Roel Hermans portfolio (split hero, B&W photo with geometric shapes).
Stack: Next.js + Tailwind CSS + shadcn/ui.
```

The skill will generate:
- Color palette (light + dark mode)
- Typography pairings (with Google Fonts links)
- Key effects and animation guidance
- Anti-patterns to avoid
- Pre-delivery checklist (a11y, responsive breakpoints, transitions)

### Photo Treatment

The hero photo (`photo/start-photo.JPG`) must be edited to match the Roel Hermans reference:

1. **Edit the photo itself** — crop, adjust composition to match the reference pose/framing
2. **B&W treatment** — CSS `filter: grayscale(100%) contrast(1.1)` at runtime, OR pre-process to B&W
3. **Geometric shapes** — decorative circles/rounded rectangles behind the photo (generated colors from UI UX Pro Max)
4. **Clip/mask** — rounded rectangle shape
5. Photo ~45-50% viewport width on desktop; stacked on mobile
6. Make it trivial to swap photos: change path in `config/site.yaml`

### RTL Support (Arabic)

- `dir="rtl"` on `<html>` for `ar` locale
- Tailwind logical properties: `ms-`/`me-`/`ps-`/`pe-` instead of `ml-`/`mr-`/`pl-`/`pr-`
- Flip hero layout, test every component in RTL
- Arabic font: IBM Plex Sans Arabic or Noto Sans Arabic

---

## 3. Tech Stack & Architecture

### Core

| Category | Tool | Why |
|----------|------|-----|
| Framework | Next.js 15+ (App Router) | RSC, ISR, image optimization |
| Language | TypeScript 5.x | Type safety, CDK compat |
| Styling | Tailwind CSS 4.x | Utility-first, JIT |
| Components | shadcn/ui + 21st.dev | Accessible, composable |
| Icons | Lucide React | Tree-shakeable |
| Animations | Framer Motion 12+ | Scroll, layout, page transitions |
| i18n | next-intl 4.x | Best App Router i18n |
| Blog | MDX via @next/mdx | Markdown + JSX |
| Syntax | Shiki | Fast, themed highlighting |
| Package Mgr | pnpm 9+ | Fast, strict |
| Design Intelligence | UI UX Pro Max (Windsurf skill) | Auto design system generation |

### Backend / Serverless

| Category | Tool | Why |
|----------|------|-----|
| AI Chatbot | AWS Lambda + API Gateway | Serverless, CDK-managed |
| LLM | OpenAI gpt-4o-mini | Cost-effective chatbot |
| Contact Form | Resend (dev) / AWS SES (prod) | Email delivery |
| Analytics | Plausible | Privacy-friendly, GDPR |

### Infrastructure & DevOps

| Category | Tool | Why |
|----------|------|-----|
| IaC | AWS CDK (TypeScript) | Same lang as app, learning AWS |
| CI/CD | GitHub Actions | Native GitHub, free public repos |
| Hosting | CloudFront + S3 + Lambda@Edge | Full AWS via CDK |
| DNS | Route 53 | CDK-managed |
| SSL | ACM | Free, auto-renewal |
| Containers | Docker | Dev environment consistency |

### Testing & Quality

| Category | Tool |
|----------|------|
| Unit | Vitest + Testing Library |
| E2E | Playwright (Chromium, Firefox, WebKit) |
| Lint | ESLint + eslint-config-next |
| Format | Prettier |
| A11y | axe-core + Lighthouse |
| Diagrams | D2 (primary) + Mermaid (GitHub fallback) |

---

## 4. Project Structure

```
portfolio-website/
├── .github/
│   ├── workflows/              # CI/CD (ci.yml, deploy.yml, preview.yml)
│   └── ISSUE_TEMPLATE/         # GitHub Issue templates
├── .windsurf/
│   ├── rules/                  # AI coding rules (always active)
│   ├── workflows/              # AI workflows (slash-command invoked)
│   └── skills/                 # AI skills (SKILL.md bundles)
│       ├── ui-ux-pro-max/      # Design intelligence (installed)
│       ├── skill-01-scaffold/
│       ├── skill-02-design-system/
│       └── ...                 # One folder per build skill
├── config/
│   └── site.yaml               # Single source of truth for all config
├── docs/
│   ├── design/                 # Design references (images, mockups)
│   ├── prompts/                # AI prompts (NFT Art Gallery, etc.)
│   ├── ARCHITECTURE.md
│   ├── architecture.d2
│   └── architecture.svg
├── infra/                      # AWS CDK (bin/app.ts, lib/portfolio-stack.ts)
├── public/images/              # hero/, projects/, og/
├── src/
│   ├── app/
│   │   ├── [locale]/           # Dynamic locale (next-intl)
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx        # Home (Hero + featured)
│   │   │   ├── about/page.tsx
│   │   │   ├── projects/page.tsx + [slug]/page.tsx
│   │   │   ├── blog/page.tsx + [slug]/page.tsx
│   │   │   └── contact/page.tsx
│   │   ├── api/chat/route.ts
│   │   └── api/contact/route.ts
│   ├── components/
│   │   ├── ui/                 # shadcn/ui primitives
│   │   ├── layout/             # Header, Footer, Nav, LocaleSwitcher
│   │   ├── sections/           # Hero, About, Projects, Timeline, Contact
│   │   ├── cards/              # ProjectCard, BlogCard
│   │   ├── shared/             # TechBadge, AnimatedSection, GeometricShapes
│   │   └── chat/               # ChatWidget, ChatMessage, ChatInput
│   ├── content/
│   │   ├── blog/{en,de,es,ar}/ # MDX posts per locale
│   │   └── projects/           # Project data (YAML/MDX)
│   ├── hooks/
│   ├── lib/                    # config.ts, mdx.ts, chat.ts, utils.ts
│   ├── messages/{en,de,es,ar}.json
│   ├── styles/
│   └── types/
├── tests/
│   ├── unit/
│   └── e2e/
├── utility/                    # Python utility scripts (PDF extraction, etc.)
├── .env.example
├── .gitignore                  # Bewerbung/, photo/, .env.local excluded
├── Makefile
├── README.md
├── pyproject.toml              # Python deps for utility scripts (UV)
└── PORTFOLIO_BUILD_PROMPT.md   # This file
```

---

## 5. Configuration System

All configurable values in `config/site.yaml`, parsed at build time by `src/lib/config.ts`, validated with Zod schema.

Key principles:
- **Single source of truth** — change in YAML, propagates everywhere
- **Type-safe** — Zod validates, TypeScript types inferred
- **Env vars for secrets only** — `CHATBOT_API_KEY`, `RESEND_API_KEY`, `AWS_*`
- **Feature flags** — toggle blog, chatbot, analytics, dark mode via config
- **Photo paths** — all in config, easy to swap

---

## 6. Skills Breakdown — Incremental Build Plan

**WORK ONE SKILL AT A TIME.**

Each skill is a `.windsurf/skills/skill-NN-<name>/SKILL.md` with detailed instructions. Each skill maps to a **GitHub Milestone** with one or more **Issues**.

**Workflow per skill:**
1. Open the GitHub Milestone and associated Issues
2. Move Issue to "In Progress" on the Project board
3. Read the skill's `SKILL.md` (invoke with `@skills:skill-NN-<name>`)
4. Implement according to instructions
5. **Local live demo** — show Reebal the current state in browser
6. Get approval
7. Commit with descriptive message → Push → Close Issue
8. Move Issue to "Done" on Project board
9. Proceed to next skill

### Skill Overview

| # | Skill | GitHub Milestone | Key Deliverable |
|---|-------|-----------------|-----------------|
| 01 | Project Scaffold | M1: Foundation | Next.js + config + Makefile |
| 02 | Design System & Theme | M1: Foundation | UI UX Pro Max generated theme, light/dark |
| 03 | Layout Shell | M1: Foundation | Header, Footer, Nav, responsive |
| 04 | Hero Section | M2: Core Pages | B&W photo, geometric shapes, CTAs |
| 05 | About Section | M2: Core Pages | Timeline, tech grid, differentiators |
| 06 | Projects Section | M2: Core Pages | Filterable grid + detail pages |
| 07 | Contact Section | M2: Core Pages | Form + social + location |
| 08 | Blog (MDX) | M3: Content & Features | MDX blog, syntax highlighting, RSS |
| 09 | i18n (EN/DE/ES/AR + RTL) | M3: Content & Features | 4-locale support, RTL Arabic |
| 10 | AI Chatbot Widget | M3: Content & Features | RAG chatbot, streaming responses |
| 11 | Animations | M4: Polish & Quality | Scroll reveals, page transitions |
| 12 | SEO & Performance | M4: Polish & Quality | Lighthouse 90+, structured data |
| 13 | Testing | M4: Polish & Quality | Vitest + Playwright |
| 14 | AWS CDK Infrastructure | M5: Deployment | IaC, CloudFront + S3 + Lambda |
| 15 | CI/CD Pipeline | M5: Deployment | GitHub Actions, auto-deploy |
| 16 | Documentation & Diagram | M5: Deployment | README, D2 architecture diagram |

**Detailed instructions for each skill are in `.windsurf/skills/skill-NN-<name>/SKILL.md`.**

---

## 7. Content Data

### Professional Summary

> Data Scientist and AI Engineer merging 5 years of corporate finance experience (Otto Group) with cutting-edge AI/ML skills. M.Sc. candidate in DS&AI at FH Wedel. Proven end-to-end delivery — multi-agent B2B sales pipeline that reduced manual workload by 53%. Fluent in German, English, Arabic; conversational Spanish.

### Projects (6 public)

| Project | Stack | Metric | Repo Type |
|---------|-------|--------|-----------|
| B2B Sales Lead Pipeline | Python, Streamlit, Multi-LLM Agents | 53% workload reduction | Showcase |
| Urban Farming Plant Health | PyTorch, ViT, CNN, GradCAM | Automated detection | Showcase |
| Bankruptcy Early Warning | XGBoost, RF, Logit, Econometrics | Seminar, FH Wedel | Public |
| Biotech Regulatory RAG | RAG, LLMs, Vector DB | Compliance tool | Public |
| OTTO Recommender | Word2Vec, Co-Visitation, GCP | Multi-objective | Public |
| MyRecipes App | Java, Spring Boot, React, MongoDB | Full-stack + AI | Public + demo |

### Contact (public on website)

- Email: ***REMOVED***
- Location: Hamburg, Germany
- LinkedIn: linkedin.com/in/reebal-sami
- GitHub: github.com/ReebalSami

### Languages: DE (C1), EN (full professional), AR (native), ES (elementary), FR (elementary)

---

## 8. Architecture Diagram Spec

D2 diagram should show:
- **Client** → CloudFront CDN (SSL, custom domain, edge caching)
- CloudFront → S3 (static) + Lambda@Edge (SSR/ISR)
- API routes → OpenAI (chatbot) + Resend/SES (email)
- CI/CD: GitHub → Actions → Build → CDK Deploy → AWS
- i18n routing: middleware → locale detection → `[locale]/` routes

---

## 9. GitHub Project Management

### Repository

- **Repo**: `git@github.com:ReebalSami/portfolio-website.git`
- **Visibility**: Public
- **Default branch**: `main`
- **Branch strategy**: `main` (production) + feature branches (`feat/skill-NN-<name>`)

### Project Board

GitHub Projects (v2) Kanban board with columns:
- **Backlog** — Planned, not started
- **In Progress** — Currently being worked on
- **In Review** — Local demo, awaiting approval
- **Done** — Approved, committed, pushed

### Milestones

| Milestone | Skills | Target |
|-----------|--------|--------|
| M1: Foundation | 01, 02, 03 | Scaffold + design + layout |
| M2: Core Pages | 04, 05, 06, 07 | All page content |
| M3: Content & Features | 08, 09, 10 | Blog, i18n, chatbot |
| M4: Polish & Quality | 11, 12, 13 | Animations, SEO, tests |
| M5: Deployment | 14, 15, 16 | AWS, CI/CD, docs |

### Issue Labels

- `skill` — Skill implementation
- `bug` — Bug fix
- `enhancement` — Improvement
- `reebal-action` — Requires Reebal's action (accounts, approvals, content)
- `cascade-action` — Assigned to Cascade (AI assistant)
- `blocked` — Blocked by dependency

### Assignments

- **Reebal** (@ReebalSami): Account setups, approvals, content review, photo editing, domain purchase
- **Cascade** (AI assistant): Implementation, testing, documentation, CI/CD setup

---

## 10. New Skills for CV

Building this project adds to Reebal's CV:

| Skill | Category |
|-------|----------|
| Next.js 15 (App Router, RSC) | Frameworks |
| AWS CDK (IaC) | Cloud/DevOps |
| GitHub Actions CI/CD | DevOps |
| i18n + RTL (4 locales) | Frontend |
| Framer Motion | Frontend |
| MDX blog system | Frontend |
| RAG chatbot (portfolio) | AI/NLP |
| D2 architecture diagrams | Documentation |
| Playwright E2E | Testing |
| AWS (CloudFront, S3, Lambda, Route 53, ACM) | Cloud |
| GitHub Project Management | Project Management |
| Docker | DevOps |
