import React, { useState } from 'react';
import { CheckCircle, ExternalLink, Shield, Award, Building, Calendar, AlertCircle } from 'lucide-react';

interface ProviderVerificationProps {
  providerId?: string;
  showInline?: boolean;
  variant?: 'full' | 'compact' | 'badge-only';
}

interface VerificationBadge {
  type: 'license' | 'certification' | 'insurance' | 'education';
  title: string;
  status: 'verified' | 'pending' | 'expired';
  issuer: string;
  number?: string;
  expiryDate?: string;
  verificationUrl?: string;
}

const ProviderVerification: React.FC<ProviderVerificationProps> = ({ 
  providerId, 
  showInline = false,
  variant = 'full'
}) => {
  const [selectedProvider, setSelectedProvider] = useState(providerId || 'sample-provider');
  const [showDetails, setShowDetails] = useState(false);

  // Sample verification data - in real implementation, this would come from API
  const verificationData: Record<string, VerificationBadge[]> = {
    'sample-provider': [
      {
        type: 'license',
        title: 'Medical License',
        status: 'verified',
        issuer: 'Landesärztekammer Berlin',
        number: 'BER-123456-2024',
        expiryDate: '2025-12-31',
        verificationUrl: 'https://www.aerztekammer-berlin.de/mitglieder/arztsuche/'
      },
      {
        type: 'certification',
        title: 'Psychotherapist License',
        status: 'verified',
        issuer: 'Landesamt für Gesundheit und Soziales Berlin',
        number: 'PSY-789012-2023',
        expiryDate: '2026-06-30',
        verificationUrl: 'https://www.berlin.de/lageso/gesundheit/heilberufe/psychotherapeuten/'
      },
      {
        type: 'insurance',
        title: 'Professional Liability Insurance',
        status: 'verified',
        issuer: 'HDI Versicherung AG',
        number: 'HDI-345678-2024',
        expiryDate: '2025-03-15'
      },
      {
        type: 'education',
        title: 'Diplom-Psychologe',
        status: 'verified',
        issuer: 'Humboldt-Universität zu Berlin',
        number: 'HU-901234-2020'
      }
    ]
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'expired':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'expired':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'license':
        return <Shield className="h-5 w-5 text-blue-600" />;
      case 'certification':
        return <Award className="h-5 w-5 text-purple-600" />;
      case 'insurance':
        return <Building className="h-5 w-5 text-green-600" />;
      case 'education':
        return <Calendar className="h-5 w-5 text-orange-600" />;
      default:
        return <CheckCircle className="h-5 w-5 text-gray-600" />;
    }
  };

  const verifications = verificationData[selectedProvider] || [];
  const verifiedCount = verifications.filter(v => v.status === 'verified').length;

  if (variant === 'badge-only') {
    return (
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-1 bg-green-100 px-3 py-1 rounded-full">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <span className="text-xs font-medium text-green-700">
            {verifiedCount} Verified
          </span>
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className="bg-white rounded-lg border border-neutral-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-neutral-900">Credentials</h3>
          <span className="text-sm text-green-600 font-medium">
            {verifiedCount}/{verifications.length} Verified
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {verifications.map((verification, index) => (
            <div key={index} className="flex items-center space-x-2">
              {getTypeIcon(verification.type)}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-900 truncate">
                  {verification.title}
                </p>
                <div className="flex items-center space-x-1">
                  {getStatusIcon(verification.status)}
                  <span className="text-xs text-neutral-600 capitalize">
                    {verification.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Full variant
  return (
    <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
      {/* Header */}
      <div className="bg-neutral-50 px-6 py-4 border-b border-neutral-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-neutral-900">
            Provider Verification
          </h3>
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-green-600">
              {verifiedCount}/{verifications.length} Credentials Verified
            </span>
          </div>
        </div>
      </div>

      {/* Verification Items */}
      <div className="p-6">
        <div className="space-y-4">
          {verifications.map((verification, index) => (
            <div
              key={index}
              className={`border rounded-lg p-4 ${getStatusColor(verification.status)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  {getTypeIcon(verification.type)}
                  <div className="flex-1">
                    <h4 className="font-semibold text-neutral-900 mb-1">
                      {verification.title}
                    </h4>
                    <p className="text-sm text-neutral-600 mb-2">
                      Issued by: {verification.issuer}
                    </p>
                    {verification.number && (
                      <p className="text-xs text-neutral-500 mb-1">
                        License #: {verification.number}
                      </p>
                    )}
                    {verification.expiryDate && (
                      <p className="text-xs text-neutral-500">
                        Expires: {new Date(verification.expiryDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(verification.status)}
                  {verification.verificationUrl && (
                    <a
                      href={verification.verificationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700"
                      title="Verify with issuing authority"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Verification Notice */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start space-x-2">
            <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900 mb-1">
                Verification Process
              </p>
              <p className="text-xs text-blue-700">
                All credentials are verified directly with issuing authorities. 
                Verification status is updated automatically and checked monthly.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderVerification;