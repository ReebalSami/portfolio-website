.PHONY: install dev build start lint format test test\:watch test\:e2e clean config\:validate cv\:validate cv\:pdf cv\:pdf-quick cv\:all cv\:ats cv\:visual cv\:verify build\:deploy diagram deploy\:diff deploy\:preview deploy\:prod deploy env\:setup

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

cv\:validate:
	pnpm tsx src/lib/cv/validate.ts

cv\:pdf:
	@echo "📄 Generating CV PDFs (auto-builds + starts server)..."
	pnpm tsx scripts/generate-cv-pdfs.ts
	@echo "✅ PDFs saved to public/cv/{theme}/resume_reebal_sami.pdf"

cv\:pdf-quick:
	@echo "📄 Generating CV PDFs using running dev server..."
	CV_BASE_URL=http://localhost:3000 pnpm tsx scripts/generate-cv-pdfs.ts
	@echo "✅ PDFs saved to public/cv/{theme}/resume_reebal_sami.pdf"

cv\:all:
	@echo "📄 Generating both ATS + Visual CV PDFs..."
	pnpm tsx scripts/generate-cv.ts
	@echo "✅ Both CVs generated"

cv\:ats:
	@echo "📄 Generating ATS CV PDF..."
	pnpm tsx scripts/generate-cv.ts --variant ats
	@echo "✅ ATS CV + verification complete"

cv\:visual:
	@echo "📄 Generating Visual CV PDF..."
	pnpm tsx scripts/generate-cv.ts --variant visual
	@echo "✅ Visual CV complete"

cv\:verify:
	@echo "🔍 Verifying ATS CV text extraction..."
	pnpm tsx scripts/generate-cv.ts --variant ats --verify
	@echo "✅ Verification complete"

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
	cd infra && npx cdk diff --all --context stage=preview --context hostedZoneId=Z011195418EPNPJCP44NR

deploy\:preview:
	cd infra && npx cdk deploy --all --context stage=preview --context hostedZoneId=Z011195418EPNPJCP44NR --require-approval broadening

deploy\:prod:
	cd infra && npx cdk deploy --all --context stage=prod --context hostedZoneId=Z011195418EPNPJCP44NR --require-approval never

deploy:
	@if [ -f .env.local ]; then \
		echo "📦 Loading .env.local..."; \
		set -a; . ./.env.local; set +a; \
		echo "🔨 Building for deployment..."; \
		./scripts/build-for-deploy.sh; \
		echo "🚀 Deploying to production..."; \
		cd infra && npx cdk deploy --all --context stage=prod --context hostedZoneId=Z011195418EPNPJCP44NR --require-approval never; \
		echo "✅ Full deploy to production complete"; \
	else \
		echo "❌ .env.local not found. Create it from .env.example first."; \
		exit 1; \
	fi
