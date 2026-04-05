---
description: All parameters and variables must be in config/site.yaml
---

- ALL site parameters, text content references, feature flags, URLs, and configurable values go in `config/site.yaml`.
- Components read config via `src/lib/config.ts` (Zod-validated, TypeScript-typed).
- Secrets (API keys, credentials) go in `.env.local` only — NEVER in config YAML or source code.
- To change site behavior (enable/disable features, swap photos, update contact info), only `config/site.yaml` should need editing.
- UI text strings go in `src/messages/{locale}.json` translation files, NOT in components or config.
