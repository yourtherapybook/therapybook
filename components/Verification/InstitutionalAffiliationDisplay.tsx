import React, { useState } from 'react';
import { 
  Building, 
  ExternalLink, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Star,
  Award,
  Users,
  GraduationCap,
  Search,
  Filter,
  MapPin,
  Calendar
} from 'lucide-react';
import { InstitutionalAffiliation, InstitutionCredibility } from '../../types/verification';

interface InstitutionalAffiliationDisplayProps {
  affiliations: InstitutionalAffiliation[];
  variant?: 'full' | 'compact' | 'grid';
  showCredibilityScores?: boolean;
  allowFiltering?: boolean;
}

const InstitutionalAffiliationDisplay: React.FC<InstitutionalAffiliationDisplayProps> = ({
  affiliations,
  variant = 'full',
  showCredibilityScores = true,
  allowFiltering = false
}) => {
  const [filteredAffiliations, setFilteredAffiliations] = useState(affiliations);
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'credibility' | 'name' | 'date'>('credibility');

  // Sample institution credibility database
  const institutionCredibilityDB: Record<string, InstitutionCredibility> = {
    'humboldt-university': {
      id: 'humboldt-university',
      name: 'Humboldt-Universität zu Berlin',
      type: 'university',
      country: 'Germany',
      credibilityScore: 9,
      ranking: 120,
      accreditation: ['DFG', 'DAAD', 'Excellence Initiative'],
      verificationUrl: 'https://www.hu-berlin.de',
      logoUrl: '/logos/humboldt-university.png',
      lastUpdated: new Date()
    },
    'charite': {
      id: 'charite',
      name: 'Charité - Universitätsmedizin Berlin',
      type: 'hospital',
      country: 'Germany',
      credibilityScore: 10,
      ranking: 1,
      accreditation: ['JCI', 'ISO 9001', 'KTQ'],
      verificationUrl: 'https://www.charite.de',
      logoUrl: '/logos/charite.png',
      lastUpdated: new Date()
    },
    'max-planck': {
      id: 'max-planck',
      name: 'Max Planck Institute for Human Cognitive and Brain Sciences',
      type: 'research_center',
      country: 'Germany',
      credibilityScore: 10,
      ranking: 1,
      accreditation: ['DFG', 'Leibniz Association'],
      verificationUrl: 'https://www.cbs.mpg.de',
      logoUrl: '/logos/max-planck.png',
      lastUpdated: new Date()
    }
  };

  const getInstitutionCredibility = (institutionName: string): InstitutionCredibility | null => {
    const key = institutionName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    return institutionCredibilityDB[key] || null;
  };

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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'university':
        return <GraduationCap className="h-5 w-5 text-blue-600" />;
      case 'hospital':
      case 'clinic':
        return <Building className="h-5 w-5 text-red-600" />;
      case 'research_center':
        return <Search className="h-5 w-5 text-purple-600" />;
      case 'professional_association':
        return <Users className="h-5 w-5 text-green-600" />;
      case 'training_institute':
        return <Award className="h-5 w-5 text-orange-600" />;
      default:
        return <Building className="h-5 w-5 text-gray-600" />;
    }
  };

  const getCredibilityColor = (score: number) => {
    if (score >= 9) return 'text-green-600 bg-green-100';
    if (score >= 7) return 'text-blue-600 bg-blue-100';
    if (score >= 5) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getPrestigeLevel = (score: number) => {
    if (score >= 9) return 'World-Class';
    if (score >= 7) return 'Highly Regarded';
    if (score >= 5) return 'Well-Established';
    return 'Regional';
  };

  const sortAffiliations = (affiliations: InstitutionalAffiliation[]) => {
    return [...affiliations].sort((a, b) => {
      switch (sortBy) {
        case 'credibility':
          return b.credibilityScore - a.credibilityScore;
        case 'name':
          return a.institutionName.localeCompare(b.institutionName);
        case 'date':
          return (b.startDate?.getTime() || 0) - (a.startDate?.getTime() || 0);
        default:
          return 0;
      }
    });
  };

  const filterAffiliations = (affiliations: InstitutionalAffiliation[]) => {
    if (filterType === 'all') return affiliations;
    return affiliations.filter(affiliation => affiliation.institutionType === filterType);
  };

  const processedAffiliations = sortAffiliations(filterAffiliations(affiliations));

  if (variant === 'compact') {
    return (
      <div className="space-y-3">
        {processedAffiliations.slice(0, 3).map((affiliation, index) => {
          const credibility = getInstitutionCredibility(affiliation.institutionName);
          return (
            <div key={index} className="flex items-center space-x-3 p-3 bg-neutral-50 rounded-lg">
              <div className="flex-shrink-0">
                {affiliation.logoUrl ? (
                  <img
                    src={affiliation.logoUrl}
                    alt={affiliation.institutionName}
                    className="w-8 h-8 object-contain"
                  />
                ) : (
                  <div className="w-8 h-8 bg-neutral-200 rounded flex items-center justify-center">
                    {getTypeIcon(affiliation.institutionType)}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-neutral-900 truncate">
                  {affiliation.institutionName}
                </p>
                <p className="text-sm text-neutral-600 truncate">
                  {affiliation.position || affiliation.affiliationType}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                {getVerificationIcon(affiliation.verificationStatus)}
                {showCredibilityScores && (
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${getCredibilityColor(affiliation.credibilityScore)}`}>
                    {affiliation.credibilityScore}/10
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {affiliations.length > 3 && (
          <div className="text-center">
            <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
              View all {affiliations.length} affiliations
            </button>
          </div>
        )}
      </div>
    );
  }

  if (variant === 'grid') {
    return (
      <div className="space-y-6">
        {/* Filters */}
        {allowFiltering && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-neutral-200 rounded-lg text-sm"
              >
                <option value="all">All Types</option>
                <option value="university">Universities</option>
                <option value="hospital">Hospitals</option>
                <option value="research_center">Research Centers</option>
                <option value="professional_association">Associations</option>
                <option value="training_institute">Training Institutes</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'credibility' | 'name' | 'date')}
                className="px-3 py-2 border border-neutral-200 rounded-lg text-sm"
              >
                <option value="credibility">Sort by Credibility</option>
                <option value="name">Sort by Name</option>
                <option value="date">Sort by Date</option>
              </select>
            </div>
            <div className="text-sm text-neutral-600">
              {processedAffiliations.length} affiliations
            </div>
          </div>
        )}

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {processedAffiliations.map((affiliation, index) => {
            const credibility = getInstitutionCredibility(affiliation.institutionName);
            return (
              <div key={index} className="bg-white border border-neutral-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {affiliation.logoUrl ? (
                      <img
                        src={affiliation.logoUrl}
                        alt={affiliation.institutionName}
                        className="w-12 h-12 object-contain"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-neutral-100 rounded-lg flex items-center justify-center">
                        {getTypeIcon(affiliation.institutionType)}
                      </div>
                    )}
                    <div className="flex-1">
                      <h4 className="font-semibold text-neutral-900 text-sm leading-tight">
                        {affiliation.institutionName}
                      </h4>
                      <p className="text-xs text-neutral-600 capitalize">
                        {affiliation.institutionType.replace('_', ' ')}
                      </p>
                    </div>
                  </div>
                  {getVerificationIcon(affiliation.verificationStatus)}
                </div>

                {/* Position & Department */}
                <div className="mb-4">
                  <p className="font-medium text-neutral-900 text-sm">
                    {affiliation.position || affiliation.affiliationType}
                  </p>
                  {affiliation.department && (
                    <p className="text-xs text-neutral-600">{affiliation.department}</p>
                  )}
                </div>

                {/* Credibility Score */}
                {showCredibilityScores && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-neutral-700">Credibility</span>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${getCredibilityColor(affiliation.credibilityScore)}`}>
                        {affiliation.credibilityScore}/10
                      </div>
                    </div>
                    <div className="w-full bg-neutral-200 rounded-full h-1">
                      <div
                        className="bg-primary-500 h-1 rounded-full transition-all duration-300"
                        style={{ width: `${(affiliation.credibilityScore / 10) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-neutral-600 mt-1">
                      {getPrestigeLevel(affiliation.credibilityScore)}
                    </p>
                  </div>
                )}

                {/* Duration */}
                <div className="flex items-center text-xs text-neutral-600 mb-4">
                  <Calendar className="h-3 w-3 mr-1" />
                  <span>
                    {affiliation.startDate?.getFullYear()} - {affiliation.endDate?.getFullYear() || 'Present'}
                  </span>
                  {affiliation.isActive && (
                    <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs">
                      Active
                    </span>
                  )}
                </div>

                {/* Enhanced Info */}
                {credibility && (
                  <div className="border-t border-neutral-200 pt-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-neutral-600">Global Ranking</span>
                      <span className="font-medium">#{credibility.ranking}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs mt-1">
                      <span className="text-neutral-600">Accreditations</span>
                      <span className="font-medium">{credibility.accreditation.length}</span>
                    </div>
                  </div>
                )}

                {/* Verification Link */}
                {affiliation.verificationUrl && (
                  <div className="mt-4 pt-4 border-t border-neutral-200">
                    <a
                      href={affiliation.verificationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-700"
                    >
                      <ExternalLink className="h-3 w-3" />
                      <span>Verify Affiliation</span>
                    </a>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Full variant (default)
  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-neutral-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-primary-600">{affiliations.length}</div>
          <div className="text-sm text-neutral-600">Total Affiliations</div>
        </div>
        <div className="bg-white border border-neutral-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {affiliations.filter(a => a.verificationStatus === 'verified').length}
          </div>
          <div className="text-sm text-neutral-600">Verified</div>
        </div>
        <div className="bg-white border border-neutral-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {affiliations.filter(a => a.isActive).length}
          </div>
          <div className="text-sm text-neutral-600">Active</div>
        </div>
        <div className="bg-white border border-neutral-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">
            {Math.round(affiliations.reduce((sum, a) => sum + a.credibilityScore, 0) / affiliations.length * 10) / 10}
          </div>
          <div className="text-sm text-neutral-600">Avg. Credibility</div>
        </div>
      </div>

      {/* Detailed List */}
      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-neutral-200">
          <h3 className="text-lg font-semibold text-neutral-900">Institutional Affiliations</h3>
        </div>
        
        <div className="divide-y divide-neutral-200">
          {processedAffiliations.map((affiliation, index) => {
            const credibility = getInstitutionCredibility(affiliation.institutionName);
            return (
              <div key={index} className="p-6 hover:bg-neutral-50 transition-colors">
                <div className="flex items-start space-x-4">
                  {/* Logo */}
                  <div className="flex-shrink-0">
                    {affiliation.logoUrl ? (
                      <img
                        src={affiliation.logoUrl}
                        alt={affiliation.institutionName}
                        className="w-16 h-16 object-contain"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-neutral-100 rounded-lg flex items-center justify-center">
                        {getTypeIcon(affiliation.institutionType)}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-lg font-semibold text-neutral-900 mb-1">
                          {affiliation.institutionName}
                        </h4>
                        <p className="text-neutral-600 mb-2">
                          {affiliation.position} • {affiliation.affiliationType}
                        </p>
                        {affiliation.department && (
                          <p className="text-sm text-neutral-500 mb-2">{affiliation.department}</p>
                        )}
                        <div className="flex items-center space-x-4 text-sm text-neutral-600">
                          <span className="capitalize">{affiliation.institutionType.replace('_', ' ')}</span>
                          <span>
                            {affiliation.startDate?.getFullYear()} - {affiliation.endDate?.getFullYear() || 'Present'}
                          </span>
                          {affiliation.isActive && (
                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                              Active
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Status & Score */}
                      <div className="text-right">
                        <div className="flex items-center space-x-2 mb-2">
                          {getVerificationIcon(affiliation.verificationStatus)}
                          <span className="text-sm capitalize">{affiliation.verificationStatus}</span>
                        </div>
                        {showCredibilityScores && (
                          <div className={`px-3 py-1 rounded-full text-sm font-medium ${getCredibilityColor(affiliation.credibilityScore)}`}>
                            {affiliation.credibilityScore}/10
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Enhanced Institution Info */}
                    {credibility && (
                      <div className="mt-4 p-4 bg-neutral-50 rounded-lg">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-neutral-600">Global Ranking:</span>
                            <span className="font-medium ml-1">#{credibility.ranking}</span>
                          </div>
                          <div>
                            <span className="text-neutral-600">Prestige Level:</span>
                            <span className="font-medium ml-1">{getPrestigeLevel(credibility.credibilityScore)}</span>
                          </div>
                          <div>
                            <span className="text-neutral-600">Accreditations:</span>
                            <span className="font-medium ml-1">{credibility.accreditation.length}</span>
                          </div>
                          <div>
                            <span className="text-neutral-600">Country:</span>
                            <span className="font-medium ml-1">{credibility.country}</span>
                          </div>
                        </div>
                        
                        {credibility.accreditation.length > 0 && (
                          <div className="mt-3">
                            <span className="text-xs text-neutral-600">Accreditations: </span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {credibility.accreditation.map((acc, i) => (
                                <span key={i} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                                  {acc}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Description */}
                    {affiliation.description && (
                      <p className="mt-3 text-sm text-neutral-600 leading-relaxed">
                        {affiliation.description}
                      </p>
                    )}

                    {/* Verification Link */}
                    {affiliation.verificationUrl && (
                      <div className="mt-3">
                        <a
                          href={affiliation.verificationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700"
                        >
                          <ExternalLink className="h-4 w-4" />
                          <span>Verify Affiliation</span>
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default InstitutionalAffiliationDisplay;