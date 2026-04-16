# Changelog

Notable changes to the portfolio website. Format loosely follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); dates are `YYYY-MM-DD`.

This file is the source of truth for "what changed when" across app,
infrastructure, CI/CD, and tooling. Component-level state lives in the docs
it describes (e.g. `infra/README.md#runtime`, `docs/ARCHITECTURE.md`).

---

## 2026-04-16 — Node 24 LTS stack-wide upgrade

Triggered by AWS Health notice that Lambda `nodejs20.x` security patches
stop **2026-04-30**. One coordinated deploy aligned local dev, CI, and
Lambda on Node 24 LTS and applied all pending patch/minor bumps.

### Infrastructure
- Lambda runtime: `nodejs20.x` → `nodejs24.x`
- Lambda Web Adapter layer: `LambdaAdapterLayerX86:24` → `:27`
- `aws-cdk`: `2.1117.0` → `2.1118.1`
- `aws-cdk-lib` floor: `^2.247.0` → `^2.250.0`
- `infra/test/portfolio-stack.test.ts` updated to assert `nodejs24.x`

### CI/CD
- `NODE_VERSION` in `.github/workflows/{ci,deploy}.yml`: `20` → `24`
- `actions/upload-artifact@v5` → `@v6` (Node 24 native)
- `aws-actions/configure-aws-credentials@v5` → `@v6` (Node 24 native)
- Result: **zero** Node 20 deprecation warnings in either workflow

### App dependencies (minor/patch only)
- `next`: `16.2.2` → `16.2.4` (+ `eslint-config-next`)
- `react` + `react-dom`: `19.2.4` → `19.2.5`
- `next-intl`: `4.9.0` → `4.9.1`
- `@ai-sdk/openai`: `3.0.51` → `3.0.53`
- `ai`: `6.0.149` → `6.0.165`
- `openai`: `6.33.0` → `6.34.0`
- `@base-ui/react`: `1.3.0` → `1.4.0`
- `@react-pdf/renderer`: `4.4.1` → `4.5.1`
- `lucide-react`: `1.7.0` → `1.8.0`
- `shadcn`: `4.1.2` → `4.2.0`
- `prettier`: `3.8.1` → `3.8.3`
- `vitest`: `4.1.2` → `4.1.4`
- `@types/node`: `^20` → `^24` (match runtime)
- Volta pin (`package.json` `volta.node`): `20.11.1` → `24.15.0`

### Fixes
- **Turbopack NFT warning** in `src/lib/mdx.ts` — eliminated. Refactored the
  blog MDX reader so every `fs` call uses a literal prefix inline:
  `path.join(/*turbopackIgnore: true*/ process.cwd(), "src/content/blog", ...)`.
  Passing a computed `blogDir` variable broke static NFT tracing and caused
  _"Encountered unexpected file in NFT list"_, which triggered whole-project
  tracing and bundle bloat. Production build now emits zero warnings.

### Verification
- Local: `pnpm lint`, `tsc --noEmit`, `pnpm vitest run` (38/38),
  `pnpm playwright test --project=chromium` (37/37), `pnpm build` (no warnings),
  `./scripts/build-for-deploy.sh` (77 MB server / 14 MB static), `cdk synth`,
  `npm test` in `infra/` (6/6 after assertion update).
- Production post-deploy:
  - `aws lambda get-function ... Configuration.Runtime` → `nodejs24.x`
  - Layer arn: `...:layer:LambdaAdapterLayerX86:27`
  - CloudFormation: `UPDATE_COMPLETE`
  - 3× CloudWatch alarms: `OK`
  - `/`, `/en`, `/en/cv`, `/feed/en`, `/en/blog/...` all 200

### Commits
- `cc77a97` — `chore(infra): upgrade to Node 24 LTS runtime across the stack`
- `caf0a9e` — `chore(deps): bump app deps, align @types/node with runtime, fix Turbopack NFT`
- `9626090` — `ci: bump upload-artifact + configure-aws-credentials to v6 (Node 24 native)`

### Deliberately deferred
- TypeScript 6 in `infra/` (major; separate upgrade)
- pnpm 10 (no pressure)
- Next.js 17 (not released)
- `eslint` 10 and `@types/node` 25 majors in app (not urgent)

### Next runtime checkpoint
- Node 22.x Lambda EOL: tentatively 2027-04-30
- Node 24.x Lambda EOL: tentatively 2028-04-30
- Monitor: https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html
