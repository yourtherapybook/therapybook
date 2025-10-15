import React, { useState } from 'react';
import { 
  User, 
  GraduationCap, 
  Award, 
  Building, 
  Users, 
  FileText, 
  ExternalLink,
  Edit,
  Plus,
  CheckCircle,
  Clock,
  AlertTriangle,
  Star,
  Calendar,
  Globe,
  Phone,
  Mail
} from 'lucide-react';
import { ProviderProfile, EducationRecord, CertificationRecord, InstitutionalAffiliation } from '../../types/verification';
import VerificationBadgeSystem from './VerificationBadgeSystem';

interface ProviderProfileTemplateProps {
  profile: ProviderProfile;
  isEditable?: boolean;
  showPrivateInfo?: boolean;
  variant?: 'full' | 'public' | 'admin';
}

const ProviderProfileTemplate: React.FC<ProviderProfileTemplateProps> = ({
  profile,
  isEditable = false,
  showPrivateInfo = false,
  variant = 'public'
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showEditModal, setShowEditModal] = useState(false);

  const tabs = [
    { id: 'overview', name: 'Overview', icon: User },
    { id: 'education', name: 'Education', icon: GraduationCap },
    { id: 'certifications', name: 'Certifications', icon: Award },
    { id: 'affiliations', name: 'Affiliations', icon: Building },
    { id: 'supervision', name: 'Supervision', icon: Users },
    ...(variant === 'admin' ? [{ id: 'verification', name: 'Verification', icon: CheckCircle }] : [])
  ];

  const getVerificationIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'rejected':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getCredibilityColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-blue-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const ProfileHeader = () => (
    <div className="bg-white rounded-xl shadow-subtle border border-neutral-200 overflow-hidden">
      <div className="relative h-32 bg-gradient-to-r from-primary-500 to-primary-600">
        {isEditable && (
          <button className="absolute top-4 right-4 p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors">
            <Edit className="h-4 w-4 text-white" />
          </button>
        )}
      </div>
      
      <div className="relative px-6 pb-6">
        <div className="flex items-start space-x-6 -mt-16">
          <div className="relative">
            <img
              src={profile.profilePhoto || `https://images.pexels.com/photos/5214329/pexels-photo-5214329.jpeg?auto=compress&cs=tinysrgb&w=200`}
              alt={`${profile.firstName} ${profile.lastName}`}
              className="w-24 h-24 rounded-xl object-cover border-4 border-white shadow-lg"
            />
            <div className="absolute -bottom-2 -right-2">
              {profile.verificationBadges.length > 0 && (
                <VerificationBadgeSystem 
                  badge={profile.verificationBadges[0]} 
                  variant="icon-only" 
                />
              )}
            </div>
          </div>
          
          <div className="flex-1 pt-4">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-neutral-900">
                  {profile.firstName} {profile.lastName}
                </h1>
                <p className="text-lg text-neutral-600 mb-2">
                  {profile.currentEducationLevel.charAt(0).toUpperCase() + profile.currentEducationLevel.slice(1)} Student in Training
                </p>
                <div className="flex items-center space-x-4 text-sm text-neutral-600">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>{profile.yearsInTraining} years in training</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Globe className="h-4 w-4" />
                    <span>{profile.languages.join(', ')}</span>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className={`text-2xl font-bold ${getCredibilityColor(profile.trustScore)}`}>
                  {profile.trustScore}/100
                </div>
                <div className="text-sm text-neutral-600">Trust Score</div>
              </div>
            </div>
            
            {/* Specializations */}
            <div className="mt-4">
              <div className="flex flex-wrap gap-2">
                {profile.specializations.map((spec, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-primary-100 text-primary-700 text-sm font-medium rounded-full"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            </div>
            
            {/* Contact Info (if authorized) */}
            {showPrivateInfo && (
              <div className="mt-4 flex items-center space-x-6 text-sm text-neutral-600">
                <div className="flex items-center space-x-1">
                  <Mail className="h-4 w-4" />
                  <span>{profile.email}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Phone className="h-4 w-4" />
                  <span>{profile.phone}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const OverviewTab = () => (
    <div className="space-y-6">
      {/* Bio */}
      <div className="bg-white rounded-xl shadow-subtle border border-neutral-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-neutral-900">About</h3>
          {isEditable && (
            <button className="p-2 text-neutral-400 hover:text-neutral-600 rounded-lg hover:bg-neutral-100">
              <Edit className="h-4 w-4" />
            </button>
          )}
        </div>
        <p className="text-neutral-700 leading-relaxed">{profile.bio}</p>
      </div>

      {/* Verification Status */}
      <div className="bg-white rounded-xl shadow-subtle border border-neutral-200 p-6">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">Verification Status</h3>
        {profile.verificationBadges.length > 0 ? (
          <VerificationBadgeSystem 
            badge={profile.verificationBadges[0]} 
            variant="compact" 
          />
        ) : (
          <div className="text-neutral-600">No verification badges yet</div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-subtle border border-neutral-200 p-6 text-center">
          <div className="text-2xl font-bold text-primary-600">{profile.profileCompleteness}%</div>
          <div className="text-sm text-neutral-600">Profile Complete</div>
        </div>
        <div className="bg-white rounded-xl shadow-subtle border border-neutral-200 p-6 text-center">
          <div className="text-2xl font-bold text-blue-600">{profile.education.length}</div>
          <div className="text-sm text-neutral-600">Education Records</div>
        </div>
        <div className="bg-white rounded-xl shadow-subtle border border-neutral-200 p-6 text-center">
          <div className="text-2xl font-bold text-green-600">{profile.supervisors.length}</div>
          <div className="text-sm text-neutral-600">Active Supervisors</div>
        </div>
      </div>
    </div>
  );

  const EducationTab = () => (
    <div className="bg-white rounded-xl shadow-subtle border border-neutral-200">
      <div className="flex items-center justify-between p-6 border-b border-neutral-200">
        <h3 className="text-lg font-semibold text-neutral-900">Education History</h3>
        {isEditable && (
          <button className="flex items-center space-x-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">
            <Plus className="h-4 w-4" />
            <span>Add Education</span>
          </button>
        )}
      </div>
      
      <div className="p-6">
        <div className="space-y-4">
          {profile.education.map((edu, index) => (
            <div key={index} className="flex items-start space-x-4 p-4 border border-neutral-200 rounded-lg">
              <div className="p-2 bg-blue-100 rounded-lg">
                <GraduationCap className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-neutral-900">{edu.degree} in {edu.field}</h4>
                    <p className="text-neutral-600">{edu.institution}</p>
                    <p className="text-sm text-neutral-500">
                      {edu.startDate.getFullYear()} - {edu.endDate ? edu.endDate.getFullYear() : 'Present'}
                    </p>
                    {edu.honors && (
                      <p className="text-sm text-primary-600 font-medium">{edu.honors}</p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {getVerificationIcon(edu.verificationStatus)}
                    <div className={`text-sm font-medium ${getCredibilityColor(edu.credibilityScore)}`}>
                      {edu.credibilityScore}/10
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const CertificationsTab = () => (
    <div className="bg-white rounded-xl shadow-subtle border border-neutral-200">
      <div className="flex items-center justify-between p-6 border-b border-neutral-200">
        <h3 className="text-lg font-semibold text-neutral-900">Certifications & Training</h3>
        {isEditable && (
          <button className="flex items-center space-x-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">
            <Plus className="h-4 w-4" />
            <span>Add Certification</span>
          </button>
        )}
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {profile.certifications.map((cert, index) => (
            <div key={index} className="border border-neutral-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Award className="h-5 w-5 text-yellow-600" />
                  <span className="text-xs px-2 py-1 bg-neutral-100 text-neutral-600 rounded-full">
                    {cert.type}
                  </span>
                </div>
                {getVerificationIcon(cert.verificationStatus)}
              </div>
              
              <h4 className="font-semibold text-neutral-900 mb-1">{cert.name}</h4>
              <p className="text-sm text-neutral-600 mb-2">{cert.issuer}</p>
              <p className="text-xs text-neutral-500">
                Issued: {cert.issueDate.toLocaleDateString()}
                {cert.expiryDate && ` • Expires: ${cert.expiryDate.toLocaleDateString()}`}
              </p>
              
              {cert.verificationUrl && (
                <a
                  href={cert.verificationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-700 mt-2"
                >
                  <ExternalLink className="h-3 w-3" />
                  <span>Verify</span>
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const AffiliationsTab = () => (
    <div className="bg-white rounded-xl shadow-subtle border border-neutral-200">
      <div className="flex items-center justify-between p-6 border-b border-neutral-200">
        <h3 className="text-lg font-semibold text-neutral-900">Institutional Affiliations</h3>
        {isEditable && (
          <button className="flex items-center space-x-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">
            <Plus className="h-4 w-4" />
            <span>Add Affiliation</span>
          </button>
        )}
      </div>
      
      <div className="p-6">
        <div className="space-y-4">
          {profile.institutionalAffiliations.map((affiliation, index) => (
            <div key={index} className="flex items-center space-x-4 p-4 border border-neutral-200 rounded-lg">
              <div className="flex-shrink-0">
                {affiliation.logoUrl ? (
                  <img
                    src={affiliation.logoUrl}
                    alt={affiliation.institutionName}
                    className="w-12 h-12 object-contain"
                  />
                ) : (
                  <div className="w-12 h-12 bg-neutral-100 rounded-lg flex items-center justify-center">
                    <Building className="h-6 w-6 text-neutral-600" />
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-neutral-900">{affiliation.institutionName}</h4>
                    <p className="text-neutral-600">{affiliation.position}</p>
                    <p className="text-sm text-neutral-500 capitalize">
                      {affiliation.affiliationType} • {affiliation.institutionType}
                    </p>
                    {affiliation.department && (
                      <p className="text-sm text-neutral-500">{affiliation.department}</p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {getVerificationIcon(affiliation.verificationStatus)}
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm font-medium">{affiliation.credibilityScore}/10</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const SupervisionTab = () => (
    <div className="bg-white rounded-xl shadow-subtle border border-neutral-200">
      <div className="flex items-center justify-between p-6 border-b border-neutral-200">
        <h3 className="text-lg font-semibold text-neutral-900">Supervision & Mentorship</h3>
        {isEditable && (
          <button className="flex items-center space-x-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">
            <Plus className="h-4 w-4" />
            <span>Add Supervisor</span>
          </button>
        )}
      </div>
      
      <div className="p-6">
        <div className="space-y-4">
          {profile.supervisors.map((supervisor, index) => (
            <div key={index} className="flex items-start space-x-4 p-4 border border-neutral-200 rounded-lg">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-neutral-900">{supervisor.name}</h4>
                    <p className="text-neutral-600">{supervisor.credentials}</p>
                    <p className="text-sm text-neutral-500">{supervisor.institution}</p>
                    <p className="text-xs text-neutral-500 capitalize">
                      {supervisor.supervisionType} supervision • 
                      {supervisor.isActive ? ' Active' : ' Inactive'}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getVerificationIcon(supervisor.verificationStatus)}
                    {supervisor.isActive && (
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Profile Header */}
      <ProfileHeader />

      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl shadow-subtle border border-neutral-200">
        <div className="border-b border-neutral-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-neutral-500 hover:text-neutral-700'
                  }`}
                >
                  <IconComponent className="h-4 w-4" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'education' && <EducationTab />}
          {activeTab === 'certifications' && <CertificationsTab />}
          {activeTab === 'affiliations' && <AffiliationsTab />}
          {activeTab === 'supervision' && <SupervisionTab />}
        </div>
      </div>
    </div>
  );
};

export default ProviderProfileTemplate;