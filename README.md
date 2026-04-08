# Portfolio Website — Reebal Sami

Personal portfolio website for **Reebal Sami** — Data Scientist & AI Engineer.

## Tech Stack

- **Framework**: Next.js 16 (App Router, RSC)
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS 4.x + shadcn/ui
- **Package Manager**: pnpm

## Toolchain & Environment

- **Node.js**: 20.11.1 (pinned via `.nvmrc`, `.node-version`, and Volta)
- **pnpm**: 9.12.1 (declared via `packageManager` + Volta)

### Recommended setup

1. Install [Volta](https://volta.sh) (or use `nvm`/`asdf`).
2. Inside the repo run `volta setup` (or `nvm use`) to activate the pinned Node version.
3. Enable Corepack so pnpm uses the pinned version: `corepack enable`.
4. Run the usual Make targets below. Every command will now use the local toolchain without polluting your global environment.

## Quick Start

```bash
make env:setup # Sync Volta + Corepack toolchain
make install   # Install dependencies
make dev       # Start dev server (localhost:3000)
make build     # Production build
make lint      # Lint + type-check
make format    # Format with Prettier
```

## Configuration

All site configuration lives in `config/site.yaml`. Secrets go in `.env.local` (copy `.env.example`).

## Project Structure

See `PORTFOLIO_BUILD_PROMPT.md` for the full project specification.
