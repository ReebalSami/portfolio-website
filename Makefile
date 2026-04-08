.PHONY: install dev build start lint format test test\:watch test\:e2e clean config\:validate build\:deploy diagram deploy\:diff deploy\:preview deploy\:prod env\:setup

install:
	pnpm install

dev:
	pnpm dev

build:
	pnpm build

start:
	pnpm start

lint:
	pnpm lint
	pnpm tsc --noEmit

format:
	pnpm prettier --write .

test:
	pnpm vitest run

test\:watch:
	pnpm vitest

test\:e2e:
	pnpm playwright test

clean:
	rm -rf .next out node_modules/.cache

config\:validate:
	pnpm tsx src/lib/validate-config.ts

env\:setup:
	@if command -v volta >/dev/null 2>&1; then \
		volta install node@20.11.1; \
		volta install pnpm@9.12.1; \
		echo "Volta toolchain synced with project pins"; \
	else \
		echo "Volta is not installed. Install it from https://volta.sh or use nvm/asdf with .nvmrc/.node-version."; \
	fi
	corepack enable

build\:deploy:
	./scripts/build-for-deploy.sh

diagram:
	d2 docs/architecture.d2 docs/architecture.svg

deploy\:diff:
	cd infra && npx cdk diff --all --context stage=preview

deploy\:preview:
	cd infra && npx cdk deploy --all --context stage=preview --require-approval broadening

deploy\:prod:
	cd infra && npx cdk deploy --all --context stage=prod --require-approval broadening
