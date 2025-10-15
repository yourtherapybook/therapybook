import React, { useState } from 'react';
import { 
  Shield, 
  Star, 
  Crown, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  ExternalLink,
  FileText,
  Award,
  Users,
  Eye,
  Lock
} from 'lucide-react';
import { VerificationBadge, VerificationTierConfig } from '../../types/verification';

interface VerificationBadgeSystemProps {
  badge?: VerificationBadge;
  showDetails?: boolean;
  variant?: 'full' | 'compact' | 'icon-only';
  interactive?: boolean;
}

const VerificationBadgeSystem: React.FC<VerificationBadgeSystemProps> = ({
  badge,
  showDetails = false,
  variant = 'full',
  interactive = true
}) => {
  const [showModal, setShowModal] = useState(false);

  // Verification tier configurations
  const tierConfigs: Record<string, VerificationTierConfig> = {
    basic: {
      tier: 'basic',
      displayName: 'Basic Verified',
      description: 'Essential credentials verified',
      color: 'bg-green-100 text-green-800 border-green-200',
      icon: 'shield',
      requirements: {
        mandatory: [
          {
            type: 'education',
            title: 'Current Education Enrollment',
            description: 'Proof of enrollment in accredited therapy program',
            acceptedDocuments: ['enrollment_certificate', 'transcript', 'student_id'],
            verificationMethod: 'manual',
            processingTime: '2-3 business days',
            weight: 30
          },
          {
            type: 'background_check',
            title: 'Background Check',
            description: 'Clean criminal background verification',
            acceptedDocuments: ['police_clearance', 'background_report'],
            verificationMethod: 'third_party',
            processingTime: '5-7 business days',
            weight: 25
          },
          {
            type: 'supervision',
            title: 'Supervisor Assignment',
            description: 'Verified licensed supervisor relationship',
            acceptedDocuments: ['supervision_agreement', 'supervisor_license'],
            verificationMethod: 'manual',
            processingTime: '3-5 business days',
            weight: 45
          }
        ],
        optional: []
      },
      benefits: [
        'Basic profile visibility',
        'Client booking capability',
        'Platform support access',
        'Training resource access'
      ],
      processingTime: '7-10 business days',
      cost: 0,
      renewalPeriod: 12,
      minimumCredibilityScore: 60
    },
    enhanced: {
      tier: 'enhanced',
      displayName: 'Enhanced Verified',
      description: 'Comprehensive credentials and performance verified',
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: 'star',
      requirements: {
        mandatory: [
          {
            type: 'certification',
            title: 'Professional Certifications',
            description: 'Relevant therapy certifications or training completions',
            acceptedDocuments: ['certificates', 'training_records', 'ceu_transcripts'],
            verificationMethod: 'manual',
            processingTime: '3-5 business days',
            weight: 20
          },
          {
            type: 'reference',
            title: 'Professional References',
            description: 'Two verified professional references',
            acceptedDocuments: ['reference_forms', 'contact_verification'],
            verificationMethod: 'manual',
            processingTime: '5-7 business days',
            weight: 15
          },
          {
            type: 'portfolio',
            title: 'Clinical Portfolio',
            description: 'Demonstrated clinical work and case studies',
            acceptedDocuments: ['case_studies', 'clinical_reports', 'supervisor_evaluations'],
            verificationMethod: 'manual',
            processingTime: '7-10 business days',
            weight: 25
          }
        ],
        optional: [
          {
            type: 'insurance',
            title: 'Professional Liability Insurance',
            description: 'Current professional liability coverage',
            acceptedDocuments: ['insurance_certificate', 'policy_documents'],
            verificationMethod: 'automatic',
            processingTime: '1-2 business days',
            weight: 10
          }
        ]
      },
      benefits: [
        'Priority profile placement',
        'Enhanced profile features',
        'Client preference matching',
        'Advanced analytics access',
        'Continuing education credits',
        'Peer networking access'
      ],
      processingTime: '14-21 business days',
      cost: 49,
      renewalPeriod: 12,
      minimumCredibilityScore: 75
    },
    premium: {
      tier: 'premium',
      displayName: 'Premium Verified',
      description: 'Highest level verification with institutional backing',
      color: 'bg-purple-100 text-purple-800 border-purple-200',
      icon: 'crown',
      requirements: {
        mandatory: [
          {
            type: 'license',
            title: 'Professional License Progress',
            description: 'Clear path to professional licensure with timeline',
            acceptedDocuments: ['license_application', 'exam_registration', 'timeline_plan'],
            verificationMethod: 'manual',
            processingTime: '5-7 business days',
            weight: 20
          },
          {
            type: 'institutional_affiliation',
            title: 'Institutional Backing',
            description: 'Verified affiliation with recognized institution',
            acceptedDocuments: ['affiliation_letter', 'institutional_verification'],
            verificationMethod: 'third_party',
            processingTime: '7-14 business days',
            weight: 25
          },
          {
            type: 'performance_review',
            title: 'Performance Excellence',
            description: 'Demonstrated excellence in clinical performance',
            acceptedDocuments: ['performance_reviews', 'client_feedback', 'supervisor_recommendations'],
            verificationMethod: 'manual',
            processingTime: '10-14 business days',
            weight: 30
          }
        ],
        optional: [
          {
            type: 'research',
            title: 'Research Contributions',
            description: 'Published research or significant contributions',
            acceptedDocuments: ['publications', 'research_projects', 'conference_presentations'],
            verificationMethod: 'manual',
            processingTime: '5-7 business days',
            weight: 15
          },
          {
            type: 'awards',
            title: 'Professional Recognition',
            description: 'Awards or recognition in the field',
            acceptedDocuments: ['award_certificates', 'recognition_letters'],
            verificationMethod: 'manual',
            processingTime: '3-5 business days',
            weight: 10
          }
        ]
      },
      benefits: [
        'Premium profile showcase',
        'Featured provider status',
        'Higher session rates',
        'Priority client matching',
        'Advanced supervision access',
        'Research collaboration opportunities',
        'Conference and training discounts',
        'Mentorship program access'
      ],
      processingTime: '21-30 business days',
      cost: 99,
      renewalPeriod: 12,
      minimumCredibilityScore: 90
    }
  };

  const getBadgeIcon = (tier: string) => {
    switch (tier) {
      case 'basic':
        return <Shield className="h-4 w-4" />;
      case 'enhanced':
        return <Star className="h-4 w-4" />;
      case 'premium':
        return <Crown className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending':
      case 'in_review':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'rejected':
      case 'expired':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-600" />;
    }
  };

  if (!badge) {
    return (
      <div className="flex items-center space-x-2 text-neutral-500">
        <AlertTriangle className="h-4 w-4" />
        <span className="text-sm">Unverified</span>
      </div>
    );
  }

  const config = tierConfigs[badge.tier];

  if (variant === 'icon-only') {
    return (
      <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${config.color}`}>
        {getBadgeIcon(badge.tier)}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full border ${config.color}`}>
        {getBadgeIcon(badge.tier)}
        <span className="text-sm font-medium">{config.displayName}</span>
        {getStatusIcon(badge.status)}
      </div>
    );
  }

  // Full variant
  return (
    <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
      {/* Header */}
      <div className={`px-6 py-4 border-b border-neutral-200 ${config.color.replace('text-', 'bg-').replace('-800', '-50')}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${config.color}`}>
              {getBadgeIcon(badge.tier)}
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900">{config.displayName}</h3>
              <p className="text-sm text-neutral-600">{config.description}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {getStatusIcon(badge.status)}
            <span className="text-sm font-medium capitalize">{badge.status}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Credibility Score */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-neutral-700">Credibility Score</span>
            <span className="text-lg font-bold text-primary-600">{badge.credibilityScore}/100</span>
          </div>
          <div className="w-full bg-neutral-200 rounded-full h-2">
            <div
              className="bg-primary-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${badge.credibilityScore}%` }}
            />
          </div>
        </div>

        {/* Requirements Status */}
        <div className="mb-6">
          <h4 className="font-medium text-neutral-900 mb-3">Verification Requirements</h4>
          <div className="space-y-2">
            {badge.requirements.map((req, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(req.status)}
                  <span className="text-sm font-medium text-neutral-900">{req.title}</span>
                </div>
                {req.verificationUrl && (
                  <a
                    href={req.verificationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Benefits */}
        <div className="mb-6">
          <h4 className="font-medium text-neutral-900 mb-3">Verification Benefits</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {config.benefits.map((benefit, index) => (
              <div key={index} className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm text-neutral-700">{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Verification Details */}
        {badge.issuedDate && (
          <div className="text-xs text-neutral-500 border-t border-neutral-200 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="font-medium">Verified:</span> {badge.issuedDate.toLocaleDateString()}
              </div>
              {badge.expiryDate && (
                <div>
                  <span className="font-medium">Expires:</span> {badge.expiryDate.toLocaleDateString()}
                </div>
              )}
            </div>
            {badge.verifiedBy && (
              <div className="mt-2">
                <span className="font-medium">Verified by:</span> {badge.verifiedBy}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {interactive && (
        <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-200">
          <div className="flex space-x-3">
            <button
              onClick={() => setShowModal(true)}
              className="flex-1 bg-primary-500 hover:bg-primary-600 text-white py-2 px-4 rounded-lg font-medium transition-colors text-sm"
            >
              View Details
            </button>
            <button className="px-4 py-2 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors text-sm">
              <FileText className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerificationBadgeSystem;