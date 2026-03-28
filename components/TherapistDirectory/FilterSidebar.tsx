import React from 'react';
import { Filter, Globe, Users, X } from 'lucide-react';
import { FilterOptions } from '../../types';

interface FilterSidebarProps {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  onClearFilters: () => void;
  isOpen: boolean;
  onClose: () => void;
  issueTypes: string[];
  languages: string[];
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
  isOpen,
  onClose,
  issueTypes,
  languages,
}) => {
  const handleIssueTypeChange = (issueType: string) => {
    const newIssueTypes = filters.issueTypes.includes(issueType)
      ? filters.issueTypes.filter((type) => type !== issueType)
      : [...filters.issueTypes, issueType];

    onFilterChange({ ...filters, issueTypes: newIssueTypes });
  };

  const handleLanguageChange = (language: string) => {
    const newLanguages = filters.languages.includes(language)
      ? filters.languages.filter((lang) => lang !== language)
      : [...filters.languages, language];

    onFilterChange({ ...filters, languages: newLanguages });
  };

  const handleAvailabilityChange = (availability: string) => {
    const newAvailability = filters.availability.includes(availability)
      ? filters.availability.filter((item) => item !== availability)
      : [...filters.availability, availability];

    onFilterChange({ ...filters, availability: newAvailability });
  };

  const sidebarContent = (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
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

      <div className="mb-6">
        <label className="mb-3 block text-sm font-medium text-neutral-700">
          Availability
        </label>
        <div className="space-y-2">
          {['available', 'offline'].map((availability) => (
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

      <div className="mb-6">
        <div className="mb-3 flex items-center space-x-2">
          <Users className="h-4 w-4 text-neutral-600" />
          <label className="block text-sm font-medium text-neutral-700">
            Specialties
          </label>
        </div>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {issueTypes.length > 0 ? issueTypes.map((issueType) => (
            <label key={issueType} className="flex items-center">
              <input
                type="checkbox"
                checked={filters.issueTypes.includes(issueType)}
                onChange={() => handleIssueTypeChange(issueType)}
                className="rounded border-neutral-300 text-primary-500 focus:ring-primary-500"
              />
              <span className="ml-2 text-sm text-neutral-700">{issueType}</span>
            </label>
          )) : (
            <p className="text-sm text-neutral-500">No specialty filters available yet.</p>
          )}
        </div>
      </div>

      <div className="mb-6">
        <div className="mb-3 flex items-center space-x-2">
          <Globe className="h-4 w-4 text-neutral-600" />
          <label className="block text-sm font-medium text-neutral-700">
            Languages
          </label>
        </div>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {languages.length > 0 ? languages.map((language) => (
            <label key={language} className="flex items-center">
              <input
                type="checkbox"
                checked={filters.languages.includes(language)}
                onChange={() => handleLanguageChange(language)}
                className="rounded border-neutral-300 text-primary-500 focus:ring-primary-500"
              />
              <span className="ml-2 text-sm text-neutral-700">{language}</span>
            </label>
          )) : (
            <p className="text-sm text-neutral-500">No language filters available yet.</p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {isOpen && (
        <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose} />
      )}

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
