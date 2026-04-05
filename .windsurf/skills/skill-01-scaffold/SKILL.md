---
name: skill-01-scaffold
description: Initialize the Next.js 15 project with TypeScript, Tailwind CSS, pnpm, Makefile, config system, and all tooling
---

## Skill 01: Project Scaffold

### Goal
Initialize the Next.js project with all tooling, config/site.yaml, Makefile, and dev dependencies.

### Prerequisites
None — this is the first skill.

### Context7 Lookups
Before starting, fetch latest docs:
- `next.js` — App Router project setup
- `tailwindcss` — v4 setup with Next.js
- `typescript` — tsconfig best practices

### GitHub
- **Milestone**: M1: Foundation
- **Issue**: "Skill 01: Project Scaffold"
- **Branch**: `feat/skill-01-scaffold`

### Steps

1. **Init Next.js**:
   ```bash
   pnpm create next-app@latest . --typescript --tailwind --app --src-dir --import-alias "@/*"
   ```

2. **Install core deps**:
   ```bash
   pnpm add next-intl framer-motion lucide-react yaml zod
   pnpm add -D vitest @testing-library/react @testing-library/jest-dom @playwright/test prettier eslint-config-prettier
   ```

3. **Init shadcn/ui**:
   ```bash
   pnpm dlx shadcn@latest init
   ```

4. **Create config system**:
   - `config/site.yaml` — already exists, verify it's complete
   - `src/lib/config.ts` — parse YAML with `yaml` package, validate with Zod schema
   - `src/types/config.ts` — TypeScript interfaces inferred from Zod

5. **Create `.env.example`** — already exists, verify all required vars listed

6. **Create `Makefile`** with targets:
   - `install` — `pnpm install`
   - `dev` — `pnpm dev`
   - `build` — `pnpm build`
   - `lint` — `pnpm lint && pnpm tsc --noEmit`
   - `format` — `pnpm prettier --write .`
   - `test` — `pnpm vitest run`
   - `test:watch` — `pnpm vitest`
   - `test:e2e` — `pnpm playwright test`
   - `clean` — remove `.next`, `out`, `node_modules/.cache`
   - `config:validate` — run config validation
   - `diagram` — render D2 to SVG
   - `deploy:diff` — `cd infra && npx cdk diff`
   - `deploy:preview` — `cd infra && npx cdk deploy --context stage=preview`
   - `deploy:prod` — `cd infra && npx cdk deploy --context stage=prod`

7. **Verify `.gitignore`** — already exists, confirm Bewerbung/, photo/, .env.local excluded

8. **Init git + connect remote**:
   ```bash
   git init
   git remote add origin git@github.com:ReebalSami/portfolio-website.git
   git add .
   git commit -m "feat(skill-01): project scaffold — Next.js 15, TypeScript, Tailwind, config system"
   ```

### Acceptance Criteria
- [ ] `make install` succeeds
- [ ] `make dev` starts dev server on localhost:3000
- [ ] `make lint` passes with zero errors
- [ ] `make build` produces a successful build
- [ ] Config is parsed and validated without errors
- [ ] TypeScript compiles with `--noEmit` and zero errors
- [ ] **Show local demo to Reebal before pushing**
