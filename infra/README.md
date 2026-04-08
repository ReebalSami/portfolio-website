# Portfolio Website — AWS CDK Infrastructure

Infrastructure as Code (IaC) for deploying the portfolio website to AWS using CDK (TypeScript).

## Architecture

```
Client → CloudFront (CDN + SSL) → S3 (static assets)
                                → Lambda (Next.js SSR via Lambda Web Adapter)
Route 53 → CloudFront (custom domain)
ACM → CloudFront (TLS certificate, us-east-1)
CloudWatch → Alarms (5xx rate, latency, Lambda errors)
```

## Stacks

| Stack | Region | Resources |
|-------|--------|-----------|
| `PortfolioCertStack` | us-east-1 | ACM certificate (required for CloudFront) |
| `PortfolioStack` | eu-central-1 | S3, Lambda, CloudFront, Route 53, CloudWatch |

Stages: `preview` (default) and `prod`.

## AWS Prerequisites

Before deploying, you need:

### 1. AWS Account
- Create an AWS account at https://aws.amazon.com
- Enable MFA on the root account

### 2. IAM User / Role
```bash
# Create a deployment user with required permissions:
# - CloudFormation (full)
# - S3 (create/manage buckets)
# - CloudFront (create/manage distributions)
# - Lambda (create/manage functions)
# - Route 53 (manage hosted zones/records)
# - ACM (request/manage certificates)
# - CloudWatch (create alarms)
# - IAM (create roles for Lambda)
# - SSM (CDK cross-region references)
```

### 3. AWS CLI
```bash
# Install AWS CLI
brew install awscli

# Configure credentials
aws configure
# → AWS Access Key ID: <your-key>
# → AWS Secret Access Key: <your-secret>
# → Default region: eu-central-1
# → Default output format: json

# Verify
aws sts get-caller-identity
```

### 4. CDK Bootstrap
```bash
# Bootstrap CDK in both regions (once per account/region)
npx cdk bootstrap aws://<ACCOUNT_ID>/eu-central-1
npx cdk bootstrap aws://<ACCOUNT_ID>/us-east-1
```

### 5. Domain (Optional for preview)
- Purchase domain via Route 53 or transfer existing domain
- Note the Hosted Zone ID for CDK context

## Usage

### Build + Deploy
```bash
# From project root:

# 1. Build Next.js for Lambda
make build:deploy

# 2. Deploy preview stage
make deploy:preview

# 3. Deploy production (with custom domain)
cd infra
npx cdk deploy --all \
  --context stage=prod \
  --context domainName=reebal-sami.com \
  --context hostedZoneId=Z1234567890 \
  --require-approval broadening
```

### Other Commands
```bash
# Synthesize CloudFormation (dry-run)
cd infra && npx cdk synth

# Diff against deployed stack
make deploy:diff

# Destroy preview stack
cd infra && npx cdk destroy --all --context stage=preview

# Run CDK tests
cd infra && npm test
```

## Environment Variables

Set these in GitHub Secrets (for CI/CD) or `.env.local` (for local dev):

| Variable | Description |
|----------|-------------|
| `AWS_ACCESS_KEY_ID` | AWS IAM access key |
| `AWS_SECRET_ACCESS_KEY` | AWS IAM secret key |
| `AWS_REGION` | Default: `eu-central-1` |
| `CHATBOT_API_KEY` | OpenAI API key (set in Lambda env) |
| `RESEND_API_KEY` | Resend API key (set in Lambda env) |

## CDK Context Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| `stage` | `preview` | Deployment stage: `preview` or `prod` |
| `domainName` | `reebal-sami.com` | Root domain name |
| `hostedZoneId` | (empty) | Route 53 Hosted Zone ID |
