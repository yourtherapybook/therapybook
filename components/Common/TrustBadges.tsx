import React from 'react';
import { Shield, Lock, Phone, ExternalLink, CheckCircle } from 'lucide-react';

interface TrustBadgesProps {
  variant?: 'header' | 'footer' | 'inline';
  showAll?: boolean;
}

const TrustBadges: React.FC<TrustBadgesProps> = ({ variant = 'inline', showAll = true }) => {
  const emergencyNumber = '112'; // German emergency number
  const hipaaComplianceUrl = '/privacy-policy#data-protection';
  const securityCertificateUrl = 'https://www.ssllabs.com/ssltest/analyze.html?d=therapybook.de';
  const providerVerificationUrl = 'https://www.bundesaerztekammer.de/service/arztsuche/';
  const gdprComplianceUrl = '/privacy-policy#gdpr-compliance';

  if (variant === 'header') {
    return (
      <div className="flex items-center space-x-4">
        {/* HIPAA Compliance Badge */}
        <div className="flex items-center space-x-1 bg-blue-50 px-3 py-1 rounded-full">
          <Shield className="h-4 w-4 text-blue-600" />
          <span className="text-xs font-medium text-blue-700">HIPAA Compliant</span>
        </div>
        
        {/* SSL Security Badge */}
        <div className="flex items-center space-x-1 bg-green-50 px-3 py-1 rounded-full">
          <Lock className="h-4 w-4 text-green-600" />
          <span className="text-xs font-medium text-green-700">SSL Secured</span>
        </div>

        {/* Emergency Contact */}
        <div className="flex items-center space-x-1 bg-red-50 px-3 py-1 rounded-full">
          <Phone className="h-4 w-4 text-red-600" />
          <span className="text-xs font-medium text-red-700">24/7 Support</span>
        </div>
      </div>
    );
  }

  if (variant === 'footer') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* HIPAA Compliance */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-3">
            <Shield className="h-6 w-6 text-blue-600" />
          </div>
          <h4 className="font-semibold text-neutral-900 mb-2">GDPR Compliant</h4>
          <p className="text-sm text-neutral-600 mb-2">
            Your health information is protected according to EU GDPR and German BDSG standards
          </p>
          <a 
            href={gdprComplianceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:text-blue-700 underline"
          >
            View Data Protection Policy
          </a>
        </div>

        {/* SSL Security */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-3">
            <Lock className="h-6 w-6 text-green-600" />
          </div>
          <h4 className="font-semibold text-neutral-900 mb-2">SSL Encrypted</h4>
          <p className="text-sm text-neutral-600 mb-2">
            All data transmission is secured with TLS 1.3 encryption
          </p>
          <a 
            href={securityCertificateUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-green-600 hover:text-green-700 underline"
          >
            Test SSL Security
          </a>
        </div>

        {/* Licensed Providers */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-100 rounded-full mb-3">
            <CheckCircle className="h-6 w-6 text-primary-600" />
          </div>
          <h4 className="font-semibold text-neutral-900 mb-2">Licensed Providers</h4>
          <p className="text-sm text-neutral-600 mb-2">
            Supervised trainees working under licensed professionals
          </p>
          <a 
            href={providerVerificationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary-600 hover:text-primary-700 underline"
          >
            German Medical Board Search
          </a>
        </div>

        {/* Emergency Contact */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mb-3">
            <Phone className="h-6 w-6 text-red-600" />
          </div>
          <h4 className="font-semibold text-neutral-900 mb-2">24/7 Emergency</h4>
          <p className="text-sm text-neutral-600 mb-2">
            Crisis support and emergency resources available
          </p>
          <a 
            href={`tel:${emergencyNumber}`}
            className="text-xs text-red-600 hover:text-red-700 underline font-semibold"
          >
            {emergencyNumber}
          </a>
        </div>
      </div>
    );
  }

  // Inline variant (default)
  return (
    <div className="bg-neutral-50 rounded-xl p-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* HIPAA Badge */}
        <div className="flex flex-col items-center text-center">
          <div className="bg-blue-100 p-3 rounded-lg mb-2">
            <Shield className="h-6 w-6 text-blue-600" />
          </div>
          <span className="text-sm font-medium text-neutral-900">HIPAA</span>
          <span className="text-xs text-neutral-600">Compliant</span>
        </div>

        {/* SSL Badge */}
        <div className="flex flex-col items-center text-center">
          <div className="bg-green-100 p-3 rounded-lg mb-2">
            <Lock className="h-6 w-6 text-green-600" />
          </div>
          <span className="text-sm font-medium text-neutral-900">SSL</span>
          <span className="text-xs text-neutral-600">Encrypted</span>
        </div>

        {/* Licensed Badge */}
        <div className="flex flex-col items-center text-center">
          <div className="bg-primary-100 p-3 rounded-lg mb-2">
            <CheckCircle className="h-6 w-6 text-primary-600" />
          </div>
          <span className="text-sm font-medium text-neutral-900">Licensed</span>
          <span className="text-xs text-neutral-600">Providers</span>
        </div>

        {/* Emergency Badge */}
        <div className="flex flex-col items-center text-center">
          <div className="bg-red-100 p-3 rounded-lg mb-2">
            <Phone className="h-6 w-6 text-red-600" />
          </div>
          <span className="text-sm font-medium text-neutral-900">24/7</span>
          <span className="text-xs text-neutral-600">Support</span>
        </div>
      </div>
    </div>
  );
};

export default TrustBadges;