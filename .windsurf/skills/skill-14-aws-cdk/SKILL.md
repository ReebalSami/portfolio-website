---
name: skill-14-aws-cdk
description: Define complete AWS infrastructure as code using CDK TypeScript — S3, CloudFront, Lambda, Route 53, ACM
---

## Skill 14: AWS CDK Infrastructure

### Goal
Complete IaC for AWS deployment using CDK (TypeScript).

### Prerequisites
Skill 01 completed. Can be worked in parallel with content skills.

### GitHub
- **Milestone**: M5: Deployment
- **Issues**:
  - "Skill 14: AWS CDK Infrastructure"
  - "ACTION @ReebalSami: Set up AWS account + IAM + CLI" (assigned to Reebal)
  - "ACTION @ReebalSami: Purchase domain (Route 53)" (assigned to Reebal)

### Steps

1. **Init CDK** in `infra/`:
   ```bash
   mkdir infra && cd infra
   npx cdk init app --language typescript
   ```

2. **PortfolioStack** (`infra/lib/portfolio-stack.ts`):
   - S3 bucket (static, private, CloudFront OAI)
   - CloudFront distribution (CDN, custom domain, SSL, cache)
   - Lambda@Edge (or `@cdklabs/cdk-nextjs` construct)
   - Route 53 hosted zone
   - ACM certificate (us-east-1)
   - CloudWatch alarms (5xx, latency)

3. **CDK context**: `stage=preview` and `stage=prod`

4. **Document AWS prerequisites**:
   - AWS account
   - IAM user/role
   - CLI configured
   - `cdk bootstrap`

### Acceptance Criteria
- [ ] `cdk synth` valid
- [ ] `cdk diff` shows expected resources
- [ ] `cdk deploy` creates stack (preview stage)
- [ ] Website accessible via CloudFront
- [ ] All resources tagged
- [ ] **Show local demo to Reebal before pushing**
