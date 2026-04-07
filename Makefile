.PHONY: install dev build start lint format test test\:watch test\:e2e clean config\:validate diagram deploy\:diff deploy\:preview deploy\:prod

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

diagram:
	d2 docs/architecture.d2 docs/architecture.svg

deploy\:diff:
	cd infra && npx cdk diff

deploy\:preview:
	cd infra && npx cdk deploy --context stage=preview

deploy\:prod:
	cd infra && npx cdk deploy --context stage=prod
