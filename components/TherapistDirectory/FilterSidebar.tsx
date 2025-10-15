import React from 'react';
import { Search, Filter, X, GraduationCap, MapPin, Euro, Globe, Users } from 'lucide-react';
import { FilterOptions } from '../../types';
import { ISSUE_TYPES, LANGUAGES } from '../../utils/constants';

interface FilterSidebarProps {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  onClearFilters: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
  isOpen,
  onClose
}) => {
  const formatOptions = ['In-person', 'Online'];
  const costOptions = [
    { value: 30, label: '€30 (entry-level trainees)' },
    { value: 40, label: '€40-50 (advanced trainees)' }
  ];
  const trainingOrientations = [
    'CBT basics',
    'Gestalt principles', 
    'Humanistic foundations',
    'Systemic therapy introduction'
  ];
  const modalities = ['Individual', 'Couples', 'Family', 'Group'];
  const clientAges = ['Children (5-12)', 'Teens (13-17)', 'Adults (18-64)', 'Seniors (65+)'];

  const handleIssueTypeChange = (issueType: string) => {
    const newIssueTypes = filters.issueTypes.includes(issueType)
      ? filters.issueTypes.filter(type => type !== issueType)
      : [...filters.issueTypes, issueType];
    
    onFilterChange({ ...filters, issueTypes: newIssueTypes });
  };

  const handleLanguageChange = (language: string) => {
    const newLanguages = filters.languages.includes(language)
      ? filters.languages.filter(lang => lang !== language)
      : [...filters.languages, language];
    
    onFilterChange({ ...filters, languages: newLanguages });
  };

  const handleCostChange = (cost: number) => {
    const newRange: [number, number] = cost === 30 ? [30, 30] : [40, 50];
    onFilterChange({ ...filters, priceRange: newRange });
  };

  const handleAvailabilityChange = (availability: string) => {
    const newAvailability = filters.availability.includes(availability)
      ? filters.availability.filter(avail => avail !== availability)
      : [...filters.availability, availability];
    
    onFilterChange({ ...filters, availability: newAvailability });
  };

  const sidebarContent = (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-primary-500" />
          <h3 className="text-lg font-semibold text-neutral-900">Filters</h3>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={onClearFilters}
            className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
          >
            Clear All
          </button>
          <button
            onClick={onClose}
            className="md:hidden p-1 rounded-lg hover:bg-neutral-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Format & Location */}
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-3">
          <MapPin className="h-4 w-4 text-neutral-600" />
          <label className="block text-sm font-medium text-neutral-700">
            Format & Location
          </label>
        </div>
        <div className="space-y-2">
          {formatOptions.map((format) => (
            <label key={format} className="flex items-center">
              <input
                type="checkbox"
                className="rounded border-neutral-300 text-primary-500 focus:ring-primary-500"
              />
              <span className="ml-2 text-sm text-neutral-700">{format}</span>
            </label>
          ))}
        </div>
        <div className="mt-3">
          <label className="block text-xs text-neutral-600 mb-2">Distance Radius</label>
          <select className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm">
            <option>Within 10 km</option>
            <option>Within 25 km</option>
            <option>Within 50 km</option>
            <option>Any distance</option>
          </select>
        </div>
      </div>

      {/* Cost */}
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-3">
          <Euro className="h-4 w-4 text-neutral-600" />
          <label className="block text-sm font-medium text-neutral-700">
            Cost
          </label>
        </div>
        <div className="space-y-2">
          {costOptions.map((option) => (
            <label key={option.value} className="flex items-center">
              <input
                type="radio"
                name="cost"
                checked={filters.priceRange[0] === option.value}
                onChange={() => handleCostChange(option.value)}
                className="border-neutral-300 text-primary-500 focus:ring-primary-500"
              />
              <span className="ml-2 text-sm text-neutral-700">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Issue Types */}
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-3">
          <Users className="h-4 w-4 text-neutral-600" />
          <label className="block text-sm font-medium text-neutral-700">
            Specialties
          </label>
        </div>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {ISSUE_TYPES.map((issueType) => (
            <label key={issueType} className="flex items-center">
              <input
                type="checkbox"
                checked={filters.issueTypes.includes(issueType)}
                onChange={() => handleIssueTypeChange(issueType)}
                className="rounded border-neutral-300 text-primary-500 focus:ring-primary-500"
              />
              <span className="ml-2 text-sm text-neutral-700">{issueType}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Training Orientation */}
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-3">
          <GraduationCap className="h-4 w-4 text-neutral-600" />
          <label className="block text-sm font-medium text-neutral-700">
            Training Orientation
          </label>
        </div>
        <div className="space-y-2">
          {trainingOrientations.map((orientation) => (
            <label key={orientation} className="flex items-center">
              <input
                type="checkbox"
                className="rounded border-neutral-300 text-primary-500 focus:ring-primary-500"
              />
              <span className="ml-2 text-sm text-neutral-700">{orientation}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Modality */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-neutral-700 mb-3">
          Modality
        </label>
        <div className="space-y-2">
          {modalities.map((modality) => (
            <label key={modality} className="flex items-center">
              <input
                type="checkbox"
                className="rounded border-neutral-300 text-primary-500 focus:ring-primary-500"
              />
              <span className="ml-2 text-sm text-neutral-700">{modality}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Client Age */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-neutral-700 mb-3">
          Client Age
        </label>
        <div className="space-y-2">
          {clientAges.map((age) => (
            <label key={age} className="flex items-center">
              <input
                type="checkbox"
                className="rounded border-neutral-300 text-primary-500 focus:ring-primary-500"
              />
              <span className="ml-2 text-sm text-neutral-700">{age}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Languages */}
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-3">
          <Globe className="h-4 w-4 text-neutral-600" />
          <label className="block text-sm font-medium text-neutral-700">
            Language
          </label>
        </div>
        <div className="space-y-2">
          {LANGUAGES.map((language) => (
            <label key={language} className="flex items-center">
              <input
                type="checkbox"
                checked={filters.languages.includes(language)}
                onChange={() => handleLanguageChange(language)}
                className="rounded border-neutral-300 text-primary-500 focus:ring-primary-500"
              />
              <span className="ml-2 text-sm text-neutral-700">{language}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Ethnicity */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-neutral-700 mb-3">
          Ethnicity
        </label>
        <div className="space-y-2">
          {['Any', 'Asian', 'Black/African', 'Hispanic/Latino', 'Middle Eastern', 'Native American', 'White/Caucasian', 'Multiracial'].map((ethnicity) => (
            <label key={ethnicity} className="flex items-center">
              <input
                type="checkbox"
                className="rounded border-neutral-300 text-primary-500 focus:ring-primary-500"
              />
              <span className="ml-2 text-sm text-neutral-700">{ethnicity}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Availability */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-neutral-700 mb-3">
          Availability
        </label>
        <div className="space-y-2">
          {['available', 'busy'].map((availability) => (
            <label key={availability} className="flex items-center">
              <input
                type="checkbox"
                checked={filters.availability.includes(availability)}
                onChange={() => handleAvailabilityChange(availability)}
                className="rounded border-neutral-300 text-primary-500 focus:ring-primary-500"
              />
              <span className="ml-2 text-sm text-neutral-700 capitalize">{availability}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose} />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed md:sticky top-0 left-0 h-full md:h-auto z-50 md:z-auto
        w-80 md:w-full max-w-sm bg-white border-r border-neutral-200
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        overflow-y-auto
      `}>
        {sidebarContent}
      </div>
    </>
  );
};

export default FilterSidebar;