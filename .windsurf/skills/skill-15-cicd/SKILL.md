---
name: skill-15-cicd
description: Set up GitHub Actions workflows for CI (lint, test, build) and CD (deploy to AWS via CDK)
---

## Skill 15: CI/CD Pipeline

### Goal
GitHub Actions for CI + CD.

### Prerequisites
Skills 13, 14 completed.

### GitHub
- **Milestone**: M5: Deployment
- **Issues**:
  - "Skill 15: CI/CD Pipeline"
  - "ACTION @ReebalSami: Add GitHub secrets (AWS creds, API keys)" (assigned to Reebal)

### Steps

1. **CI** (`.github/workflows/ci.yml`):
   - On: push any branch, PR to main
   - Checkout → Node + pnpm → install → lint → test → build
   - Cache pnpm store + `.next/cache`

2. **CD** (`.github/workflows/deploy.yml`):
   - On: push to main
   - CI steps + `cdk deploy --require-approval never --context stage=prod`
   - AWS creds from GitHub secrets

3. **Preview** (`.github/workflows/preview.yml` — optional):
   - On: PR to main
   - Deploy preview stage
   - Post URL as PR comment

4. **GitHub secrets needed**:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `AWS_REGION`
   - `CHATBOT_API_KEY`
   - `RESEND_API_KEY`

### Acceptance Criteria
- [ ] CI runs on every push/PR
- [ ] Merge to main → auto deploy
- [ ] <10 min pipeline
- [ ] Failed CI blocks merge
- [ ] **Show local demo to Reebal before pushing**
