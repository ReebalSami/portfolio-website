import * as cdk from 'aws-cdk-lib/core';
import { Template } from 'aws-cdk-lib/assertions';
import { PortfolioStack } from '../lib/portfolio-stack';
import { CertificateStack } from '../lib/certificate-stack';

describe('PortfolioStack', () => {
  let app: cdk.App;
  let certStack: CertificateStack;
  let stack: PortfolioStack;
  let template: Template;

  beforeAll(() => {
    app = new cdk.App({ context: { stage: 'preview' } });

    certStack = new CertificateStack(app, 'TestCertStack', {
      env: { account: '123456789012', region: 'us-east-1' },
      crossRegionReferences: true,
      stage: 'preview',
      domainName: 'example.com',
      hostedZoneId: '',
    });

    stack = new PortfolioStack(app, 'TestPortfolioStack', {
      env: { account: '123456789012', region: 'eu-central-1' },
      crossRegionReferences: true,
      stage: 'preview',
      domainName: 'example.com',
      hostedZoneId: '',
      certificate: certStack.certificate,
    });

    template = Template.fromStack(stack);
  });

  test('creates S3 bucket with block public access', () => {
    template.hasResourceProperties('AWS::S3::Bucket', {
      PublicAccessBlockConfiguration: {
        BlockPublicAcls: true,
        BlockPublicPolicy: true,
        IgnorePublicAcls: true,
        RestrictPublicBuckets: true,
      },
    });
  });

  test('creates Lambda function for SSR', () => {
    template.hasResourceProperties('AWS::Lambda::Function', {
      Runtime: 'nodejs20.x',
      MemorySize: 512,
      Timeout: 30,
    });
  });

  test('creates CloudFront distribution', () => {
    template.hasResourceProperties('AWS::CloudFront::Distribution', {
      DistributionConfig: {
        Enabled: true,
        HttpVersion: 'http2and3',
        Comment: 'Portfolio website — preview',
      },
    });
  });

  test('creates CloudWatch alarms', () => {
    template.resourceCountIs('AWS::CloudWatch::Alarm', 3);
  });

  test('has required outputs', () => {
    template.hasOutput('DistributionId', {});
    template.hasOutput('DistributionDomain', {});
    template.hasOutput('SiteDomain', {});
    template.hasOutput('BucketName', {});
    template.hasOutput('SsrFunctionUrl', {});
  });
});

describe('CertificateStack', () => {
  test('creates ACM certificate', () => {
    const app = new cdk.App();
    const stack = new CertificateStack(app, 'TestCertStack2', {
      env: { account: '123456789012', region: 'us-east-1' },
      stage: 'preview',
      domainName: 'example.com',
      hostedZoneId: '',
    });

    const template = Template.fromStack(stack);
    template.hasResourceProperties('AWS::CertificateManager::Certificate', {
      DomainName: 'preview.example.com',
    });
    template.hasOutput('CertificateArn', {});
  });
});
