---
description: Deployment workflow for AWS via CDK
---

## Deployment Workflow

### Prerequisites

- AWS CLI configured with appropriate credentials
- CDK bootstrapped in target account/region: `cd infra && npx cdk bootstrap`
- All GitHub secrets set: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `CHATBOT_API_KEY`, `RESEND_API_KEY`

### Manual Deploy (from local machine)

1. **Build the project**:
   // turbo
   ```bash
   make build
   ```

2. **Preview the CDK diff** (see what will change):
   ```bash
   make deploy:diff
   ```

3. **Deploy to preview**:
   ```bash
   make deploy:preview
   ```

4. **Verify** — open the CloudFront URL, check all pages, all locales, chatbot, contact form.

5. **Deploy to production** (only after preview verification):
   ```bash
   make deploy:prod
   ```

### Automated Deploy (via GitHub Actions)

- Push to `main` branch triggers `.github/workflows/deploy.yml`
- CI runs first (lint, test, build)
- If CI passes, CDK deploy runs automatically
- Monitor: check GitHub Actions tab for status

### Rollback

- CDK supports rollback: `cd infra && npx cdk deploy --rollback`
- Or revert the git commit and push to trigger a fresh deploy
