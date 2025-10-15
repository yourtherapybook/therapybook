import React, { useState, useMemo } from 'react';
import { Filter, Info, Users } from 'lucide-react';
import TherapistCard from '../components/TherapistDirectory/TherapistCard';
import FilterSidebar from '../components/TherapistDirectory/FilterSidebar';
import { FilterOptions } from '../types';
import { THERAPISTS } from '../utils/constants';

const Directory: React.FC = () => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    issueTypes: [],
    languages: [],
    priceRange: [30, 50],
    availability: []
  });

  const filteredTherapists = useMemo(() => {
    return THERAPISTS.filter(therapist => {
      // Issue type filter
      if (filters.issueTypes.length > 0) {
        const hasMatchingSpecialization = therapist.specializations.some(spec =>
          filters.issueTypes.some(issue => spec.toLowerCase().includes(issue.toLowerCase()))
        );
        if (!hasMatchingSpecialization) return false;
      }

      // Language filter
      if (filters.languages.length > 0) {
        const hasMatchingLanguage = therapist.languages.some(lang =>
          filters.languages.includes(lang)
        );
        if (!hasMatchingLanguage) return false;
      }

      // Price filter
      if (therapist.hourlyRate < filters.priceRange[0] || therapist.hourlyRate > filters.priceRange[1]) {
        return false;
      }

      // Availability filter
      if (filters.availability.length > 0 && !filters.availability.includes(therapist.availability)) {
        return false;
      }

      return true;
    });
  }, [filters]);

  const handleBookSession = (therapistId: string) => {
    // In a real app, this would navigate to booking flow
    console.log('Booking session with therapist:', therapistId);
  };

  const handleClearFilters = () => {
    setFilters({
      issueTypes: [],
      languages: [],
      priceRange: [30, 50],
      availability: []
    });
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Introductory Notice */}
        <div className="mb-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <Info className="h-6 w-6 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">About Our Trainee Practitioners</h3>
              <p className="text-blue-800 leading-relaxed">
                All practitioners listed here are trainees enrolled in accredited institutions, working under supervision as part of their training. 
                They provide quality care while gaining valuable experience under the guidance of licensed professionals.
              </p>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 mb-2">
                Find Your Trainee Practitioner
              </h1>
              <p className="text-lg text-neutral-600">
                {filteredTherapists.length} trainee practitioners available
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-neutral-600">
                {Object.values(filters).flat().length > 0 && (
                  <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full">
                    {Object.values(filters).flat().length} filters active
                  </span>
                )}
              </div>
              <button
                onClick={() => setIsFilterOpen(true)}
                className="md:hidden flex items-center px-4 py-2 bg-white border-2 border-neutral-200 hover:border-primary-500 text-neutral-700 rounded-lg transition-colors"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Sidebar */}
          <FilterSidebar
            filters={filters}
            onFilterChange={setFilters}
            onClearFilters={handleClearFilters}
            isOpen={isFilterOpen}
            onClose={() => setIsFilterOpen(false)}
          />

          {/* Main content */}
          <div className="flex-1">
            {filteredTherapists.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-white rounded-2xl shadow-subtle p-8">
                  <Users className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                    No trainee practitioners found
                  </h3>
                  <p className="text-neutral-600 mb-4">
                    Try adjusting your filters to see more results.
                  </p>
                  <button
                    onClick={handleClearFilters}
                    className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-6">
                {filteredTherapists.map(therapist => (
                  <TherapistCard
                    key={therapist.id}
                    therapist={therapist}
                    onBookSession={handleBookSession}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Directory;