---
description: Use pnpm for JS dependencies and Makefile for all automation
---

- Use `pnpm` as the JavaScript/TypeScript package manager. Never use `npm` or `yarn`.
- Every new terminal session: run `make install` to ensure dependencies are synced.
- All recurring tasks must have a Makefile target: `make dev`, `make build`, `make lint`, `make test`, `make test:e2e`, `make deploy:prod`, etc.
- For Python utility scripts (e.g., PDF extraction): use `uv` and `pyproject.toml` in the relevant subdirectory.
- Dependencies must be pinned in `pnpm-lock.yaml` (committed to git).
