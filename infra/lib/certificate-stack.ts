import * as cdk from 'aws-cdk-lib/core';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as route53 from 'aws-cdk-lib/aws-route53';
import { Construct } from 'constructs';

export interface CertificateStackProps extends cdk.StackProps {
  stage: string;
  domainName: string;
  hostedZoneId: string;
}

/**
 * ACM Certificate stack — must be deployed in us-east-1 for CloudFront.
 * Creates a wildcard + apex certificate validated via DNS (Route 53).
 */
export class CertificateStack extends cdk.Stack {
  public readonly certificate: acm.ICertificate;

  constructor(scope: Construct, id: string, props: CertificateStackProps) {
    super(scope, id, props);

    const { stage, domainName, hostedZoneId } = props;

    if (hostedZoneId) {
      // Look up existing hosted zone
      const hostedZone = route53.HostedZone.fromHostedZoneAttributes(
        this,
        'HostedZone',
        {
          hostedZoneId,
          zoneName: domainName,
        },
      );

      const siteDomain =
        stage === 'prod' ? domainName : `preview.${domainName}`;

      this.certificate = new acm.Certificate(this, 'SiteCertificate', {
        domainName: siteDomain,
        subjectAlternativeNames:
          stage === 'prod' ? [`www.${domainName}`] : undefined,
        validation: acm.CertificateValidation.fromDns(hostedZone),
      });
    } else {
      // No hosted zone — create a certificate with email validation
      // (Used when Route 53 is not yet configured)
      const siteDomain =
        stage === 'prod' ? domainName : `preview.${domainName}`;

      this.certificate = new acm.Certificate(this, 'SiteCertificate', {
        domainName: siteDomain,
        subjectAlternativeNames:
          stage === 'prod' ? [`www.${domainName}`] : undefined,
        validation: acm.CertificateValidation.fromEmail(),
      });
    }

    new cdk.CfnOutput(this, 'CertificateArn', {
      value: this.certificate.certificateArn,
      description: 'ACM Certificate ARN (us-east-1)',
    });
  }
}
