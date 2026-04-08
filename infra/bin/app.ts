#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib/core';
import { PortfolioStack } from '../lib/portfolio-stack';
import { CertificateStack } from '../lib/certificate-stack';

const app = new cdk.App();

// Stage: "preview" | "prod" (default: "preview")
const stage = app.node.tryGetContext('stage') || 'preview';
const domainName = app.node.tryGetContext('domainName') || 'reebal-sami.com';
const hostedZoneId = app.node.tryGetContext('hostedZoneId') || '';

const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: 'eu-central-1',
};

const stackPrefix = stage === 'prod' ? 'Portfolio' : 'PortfolioPreview';

// ACM certificates for CloudFront MUST be in us-east-1
const certStack = new CertificateStack(app, `${stackPrefix}CertStack`, {
  env: { ...env, region: 'us-east-1' },
  crossRegionReferences: true,
  stage,
  domainName,
  hostedZoneId,
  tags: {
    Project: 'portfolio-website',
    Stage: stage,
    ManagedBy: 'cdk',
  },
});

const portfolioStack = new PortfolioStack(app, `${stackPrefix}Stack`, {
  env,
  crossRegionReferences: true,
  stage,
  domainName,
  hostedZoneId,
  certificate: certStack.certificate,
  tags: {
    Project: 'portfolio-website',
    Stage: stage,
    ManagedBy: 'cdk',
  },
});

portfolioStack.addDependency(certStack);

app.synth();
