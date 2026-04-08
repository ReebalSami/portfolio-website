import * as cdk from 'aws-cdk-lib/core';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as route53Targets from 'aws-cdk-lib/aws-route53-targets';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as logs from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';
import * as path from 'path';
import * as fs from 'fs';

// Path to deployment artifacts (created by scripts/build-for-deploy.sh)
const DEPLOY_DIR = path.join(__dirname, '..', '..', '.deploy');

export interface PortfolioStackProps extends cdk.StackProps {
  stage: string;
  domainName: string;
  hostedZoneId: string;
  certificate: acm.ICertificate;
}

/**
 * Main portfolio infrastructure stack.
 *
 * Architecture:
 *   Client → CloudFront → S3 (static assets) + Lambda (SSR via Next.js standalone)
 *   Route 53 → CloudFront (custom domain + SSL)
 *   CloudWatch → Alarms (5xx rate, latency)
 *
 * Build artifacts expected in .deploy/:
 *   .deploy/server/   — Next.js standalone + node_modules (Lambda code)
 *   .deploy/static/   — _next/static + public assets (S3)
 */
export class PortfolioStack extends cdk.Stack {
  public readonly distribution: cloudfront.Distribution;
  public readonly siteBucket: s3.Bucket;

  constructor(scope: Construct, id: string, props: PortfolioStackProps) {
    super(scope, id, props);

    const { stage, domainName, hostedZoneId, certificate } = props;
    const siteDomain =
      stage === 'prod' ? domainName : `preview.${domainName}`;
    const isProd = stage === 'prod';

    // Resolve deploy artifact paths (use placeholders if not yet built)
    const serverDir = path.join(DEPLOY_DIR, 'server');
    const staticDir = path.join(DEPLOY_DIR, 'static');

    // Create placeholder dirs so cdk synth works before building
    for (const dir of [serverDir, staticDir]) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }

    // ─── S3 Bucket (static assets) ────────────────────────────────────
    this.siteBucket = new s3.Bucket(this, 'StaticAssetsBucket', {
      bucketName: `${siteDomain.replace(/\./g, '-')}-assets-${this.account}`,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      removalPolicy: isProd
        ? cdk.RemovalPolicy.RETAIN
        : cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: !isProd,
      versioned: false,
    });

    // ─── Lambda Function (Next.js SSR via Lambda Web Adapter) ─────────
    // AWS Lambda Web Adapter layer runs the standalone Next.js server
    // and adapts Lambda events ↔ HTTP requests automatically.
    const webAdapterLayer = lambda.LayerVersion.fromLayerVersionArn(
      this,
      'WebAdapterLayer',
      `arn:aws:lambda:${this.region}:753240598075:layer:LambdaAdapterLayerX86:24`,
    );

    const ssrFunction = new lambda.Function(this, 'SsrFunction', {
      functionName: `${stage}-portfolio-ssr`,
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'run.sh',
      code: lambda.Code.fromAsset(serverDir),
      layers: [webAdapterLayer],
      memorySize: isProd ? 1024 : 512,
      timeout: cdk.Duration.seconds(30),
      environment: {
        AWS_LAMBDA_EXEC_WRAPPER: '/opt/bootstrap',
        RUST_LOG: 'info',
        PORT: '8080',
        NODE_ENV: 'production',
        HOSTNAME: '127.0.0.1',
        NEXT_PUBLIC_SITE_URL: `https://${siteDomain}`,
        // API keys — passed via process.env during cdk deploy
        ...(process.env.CHATBOT_API_KEY && {
          CHATBOT_API_KEY: process.env.CHATBOT_API_KEY,
        }),
        ...(process.env.RESEND_API_KEY && {
          RESEND_API_KEY: process.env.RESEND_API_KEY,
        }),
      },
      logGroup: new logs.LogGroup(this, 'SsrLogGroup', {
        logGroupName: `/aws/lambda/${stage}-portfolio-ssr`,
        retention: logs.RetentionDays.TWO_WEEKS,
        removalPolicy: isProd
          ? cdk.RemovalPolicy.RETAIN
          : cdk.RemovalPolicy.DESTROY,
      }),
      description: `Portfolio SSR — ${stage}`,
    });

    // Lambda Function URL (simpler than API Gateway for Next.js)
    const functionUrl = ssrFunction.addFunctionUrl({
      authType: lambda.FunctionUrlAuthType.NONE,
      invokeMode: lambda.InvokeMode.BUFFERED,
    });

    // ─── CloudFront Origin Access Identity (S3) ───────────────────────
    const oai = new cloudfront.OriginAccessIdentity(this, 'OAI', {
      comment: `OAI for ${siteDomain}`,
    });
    this.siteBucket.grantRead(oai);

    // ─── CloudFront Distribution ──────────────────────────────────────
    const s3Origin = origins.S3BucketOrigin.withOriginAccessIdentity(
      this.siteBucket,
      { originAccessIdentity: oai },
    );

    // Extract Lambda function URL domain (remove https:// and trailing /)
    const lambdaOriginDomain = cdk.Fn.select(
      2,
      cdk.Fn.split('/', functionUrl.url),
    );

    const lambdaOrigin = new origins.HttpOrigin(lambdaOriginDomain, {
      protocolPolicy: cloudfront.OriginProtocolPolicy.HTTPS_ONLY,
      customHeaders: {
        'x-forwarded-host': siteDomain,
      },
    });

    // Response headers policy for security
    const responseHeadersPolicy = new cloudfront.ResponseHeadersPolicy(
      this,
      'SecurityHeaders',
      {
        responseHeadersPolicyName: `${stage}-portfolio-security-headers`,
        securityHeadersBehavior: {
          contentTypeOptions: { override: true },
          frameOptions: {
            frameOption: cloudfront.HeadersFrameOption.DENY,
            override: true,
          },
          referrerPolicy: {
            referrerPolicy:
              cloudfront.HeadersReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN,
            override: true,
          },
          strictTransportSecurity: {
            accessControlMaxAge: cdk.Duration.days(365),
            includeSubdomains: true,
            override: true,
          },
          xssProtection: {
            protection: true,
            modeBlock: true,
            override: true,
          },
        },
      },
    );

    // Cache policy for static assets
    const staticCachePolicy = new cloudfront.CachePolicy(
      this,
      'StaticCachePolicy',
      {
        cachePolicyName: `${stage}-portfolio-static-cache`,
        defaultTtl: cdk.Duration.days(30),
        maxTtl: cdk.Duration.days(365),
        minTtl: cdk.Duration.days(1),
        enableAcceptEncodingGzip: true,
        enableAcceptEncodingBrotli: true,
      },
    );

    // Build domain names list for CloudFront
    const domainNames: string[] = [siteDomain];
    if (isProd) {
      domainNames.push(`www.${domainName}`);
    }

    this.distribution = new cloudfront.Distribution(this, 'Distribution', {
      defaultBehavior: {
        origin: lambdaOrigin,
        viewerProtocolPolicy:
          cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
        cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD,
        cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
        originRequestPolicy:
          cloudfront.OriginRequestPolicy.ALL_VIEWER_EXCEPT_HOST_HEADER,
        responseHeadersPolicy,
      },
      additionalBehaviors: {
        // Static assets — long cache
        '/_next/static/*': {
          origin: s3Origin,
          viewerProtocolPolicy:
            cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          cachePolicy: staticCachePolicy,
          compress: true,
        },
        // Public assets
        '/images/*': {
          origin: s3Origin,
          viewerProtocolPolicy:
            cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          cachePolicy: staticCachePolicy,
          compress: true,
        },
        '/cv.pdf': {
          origin: s3Origin,
          viewerProtocolPolicy:
            cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          cachePolicy: staticCachePolicy,
        },
        '/*.svg': {
          origin: s3Origin,
          viewerProtocolPolicy:
            cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          cachePolicy: staticCachePolicy,
          compress: true,
        },
        '/favicon.ico': {
          origin: s3Origin,
          viewerProtocolPolicy:
            cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          cachePolicy: staticCachePolicy,
        },
      },
      domainNames,
      certificate,
      minimumProtocolVersion:
        cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021,
      httpVersion: cloudfront.HttpVersion.HTTP2_AND_3,
      priceClass: cloudfront.PriceClass.PRICE_CLASS_100,
      comment: `Portfolio website — ${stage}`,
      enabled: true,
    });

    // ─── S3 Deployment (static assets) ────────────────────────────────
    new s3deploy.BucketDeployment(this, 'DeployStaticAssets', {
      sources: [s3deploy.Source.asset(staticDir)],
      destinationBucket: this.siteBucket,
      distribution: this.distribution,
      distributionPaths: ['/_next/static/*', '/images/*'],
    });

    // ─── Route 53 DNS Records ─────────────────────────────────────────
    if (hostedZoneId) {
      const hostedZone = route53.HostedZone.fromHostedZoneAttributes(
        this,
        'HostedZone',
        {
          hostedZoneId,
          zoneName: domainName,
        },
      );

      // A record (IPv4)
      new route53.ARecord(this, 'SiteARecord', {
        zone: hostedZone,
        recordName: siteDomain,
        target: route53.RecordTarget.fromAlias(
          new route53Targets.CloudFrontTarget(this.distribution),
        ),
      });

      // AAAA record (IPv6)
      new route53.AaaaRecord(this, 'SiteAAAARecord', {
        zone: hostedZone,
        recordName: siteDomain,
        target: route53.RecordTarget.fromAlias(
          new route53Targets.CloudFrontTarget(this.distribution),
        ),
      });

      // www redirect for prod
      if (isProd) {
        new route53.ARecord(this, 'WwwARecord', {
          zone: hostedZone,
          recordName: `www.${domainName}`,
          target: route53.RecordTarget.fromAlias(
            new route53Targets.CloudFrontTarget(this.distribution),
          ),
        });
        new route53.AaaaRecord(this, 'WwwAAAARecord', {
          zone: hostedZone,
          recordName: `www.${domainName}`,
          target: route53.RecordTarget.fromAlias(
            new route53Targets.CloudFrontTarget(this.distribution),
          ),
        });
      }
    }

    // ─── CloudWatch Alarms ────────────────────────────────────────────
    const error5xxAlarm = new cloudwatch.Alarm(this, '5xxAlarm', {
      alarmName: `${stage}-portfolio-5xx-rate`,
      metric: this.distribution.metricTotalErrorRate({
        period: cdk.Duration.minutes(5),
        statistic: 'Average',
      }),
      threshold: 5,
      evaluationPeriods: 2,
      comparisonOperator:
        cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
      alarmDescription: `CloudFront 5xx error rate exceeds 5% — ${stage}`,
    });

    const latencyAlarm = new cloudwatch.Alarm(this, 'LatencyAlarm', {
      alarmName: `${stage}-portfolio-latency`,
      metric: new cloudwatch.Metric({
        namespace: 'AWS/CloudFront',
        metricName: 'OriginLatency',
        dimensionsMap: {
          DistributionId: this.distribution.distributionId,
          Region: 'Global',
        },
        period: cdk.Duration.minutes(5),
        statistic: 'p95',
      }),
      threshold: 3000,
      evaluationPeriods: 3,
      comparisonOperator:
        cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
      alarmDescription: `Origin p95 latency exceeds 3s — ${stage}`,
    });

    const lambdaErrorAlarm = new cloudwatch.Alarm(this, 'LambdaErrorAlarm', {
      alarmName: `${stage}-portfolio-lambda-errors`,
      metric: ssrFunction.metricErrors({
        period: cdk.Duration.minutes(5),
        statistic: 'Sum',
      }),
      threshold: 10,
      evaluationPeriods: 2,
      comparisonOperator:
        cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
      alarmDescription: `Lambda SSR errors exceed 10 in 5min — ${stage}`,
    });

    // ─── Outputs ──────────────────────────────────────────────────────
    new cdk.CfnOutput(this, 'DistributionId', {
      value: this.distribution.distributionId,
      description: 'CloudFront Distribution ID',
    });

    new cdk.CfnOutput(this, 'DistributionDomain', {
      value: this.distribution.distributionDomainName,
      description: 'CloudFront Distribution Domain Name',
    });

    new cdk.CfnOutput(this, 'SiteDomain', {
      value: `https://${siteDomain}`,
      description: 'Website URL',
    });

    new cdk.CfnOutput(this, 'BucketName', {
      value: this.siteBucket.bucketName,
      description: 'S3 Bucket for static assets',
    });

    new cdk.CfnOutput(this, 'SsrFunctionUrl', {
      value: functionUrl.url,
      description: 'Lambda Function URL (SSR)',
    });
  }
}
