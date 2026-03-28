"use client";
import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Filter, Info, Loader2, Users } from 'lucide-react';
import TherapistCard from '@/components/TherapistDirectory/TherapistCard';
import FilterSidebar from '@/components/TherapistDirectory/FilterSidebar';
import { FilterOptions, Therapist } from '@/types';

interface ProviderDirectoryResponse {
  providers: Therapist[];
  filters: {
    issueTypes: string[];
    languages: string[];
  };
}

const emptyFilters: FilterOptions = {
  issueTypes: [],
  languages: [],
  availability: [],
};

const Directory: React.FC = () => {
  const router = useRouter();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>(emptyFilters);
  const [providers, setProviders] = useState<Therapist[]>([]);
  const [filterOptions, setFilterOptions] = useState<ProviderDirectoryResponse['filters']>({ issueTypes: [], languages: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const loadProviders = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/providers');
        if (!response.ok) {
          throw new Error('Failed to load directory');
        }

        const data: ProviderDirectoryResponse = await response.json();
        setProviders(data.providers);
        setFilterOptions(data.filters);
        setLoadError(null);
      } catch (error) {
        setLoadError(error instanceof Error ? error.message : 'Failed to load directory');
      } finally {
        setIsLoading(false);
      }
    };

    void loadProviders();
  }, []);

  const filteredTherapists = useMemo(() => {
    return providers.filter((therapist) => {
      if (filters.issueTypes.length > 0) {
        const hasMatchingSpecialization = therapist.specializations.some((specialization) =>
          filters.issueTypes.includes(specialization)
        );
        if (!hasMatchingSpecialization) return false;
      }

      if (filters.languages.length > 0) {
        const hasMatchingLanguage = therapist.languages.some((language) =>
          filters.languages.includes(language)
        );
        if (!hasMatchingLanguage) return false;
      }

      if (filters.availability.length > 0 && !filters.availability.includes(therapist.availability)) {
        return false;
      }

      return true;
    });
  }, [filters, providers]);

  const handleBookSession = (therapistId: string) => {
    router.push(`/booking?therapistId=${encodeURIComponent(therapistId)}`);
  };

  const handleClearFilters = () => {
    setFilters(emptyFilters);
  };

  const activeFilterCount = filters.issueTypes.length + filters.languages.length + filters.availability.length;

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <Info className="h-6 w-6 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">About Our Trainee Practitioners</h3>
              <p className="text-blue-800 leading-relaxed">
                All practitioners listed here are approved trainees enrolled in accredited institutions and operating under supervision.
                Availability and profile details come directly from the live provider onboarding data.
              </p>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 mb-2">
                Find Your Trainee Practitioner
              </h1>
              <p className="text-lg text-neutral-600">
                {isLoading ? 'Loading providers...' : `${filteredTherapists.length} trainee practitioners available`}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {activeFilterCount > 0 && (
                <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm">
                  {activeFilterCount} filters active
                </span>
              )}
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
          <FilterSidebar
            filters={filters}
            onFilterChange={setFilters}
            onClearFilters={handleClearFilters}
            isOpen={isFilterOpen}
            onClose={() => setIsFilterOpen(false)}
            issueTypes={filterOptions.issueTypes}
            languages={filterOptions.languages}
          />

          <div className="flex-1">
            {isLoading ? (
              <div className="flex items-center justify-center py-20 text-neutral-600">
                <Loader2 className="h-6 w-6 animate-spin mr-3" />
                Loading approved providers...
              </div>
            ) : loadError ? (
              <div className="text-center py-12">
                <div className="bg-white rounded-2xl shadow-subtle p-8">
                  <Users className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                    Directory unavailable
                  </h3>
                  <p className="text-neutral-600 mb-4">
                    {loadError}
                  </p>
                  <button
                    onClick={() => window.location.reload()}
                    className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                  >
                    Retry
                  </button>
                </div>
              </div>
            ) : filteredTherapists.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-white rounded-2xl shadow-subtle p-8">
                  <Users className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                    No trainee practitioners found
                  </h3>
                  <p className="text-neutral-600 mb-4">
                    {providers.length === 0
                      ? 'Approved providers have not published profiles yet.'
                      : 'Try adjusting your filters to see more results.'}
                  </p>
                  {providers.length > 0 && (
                    <button
                      onClick={handleClearFilters}
                      className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-6">
                {filteredTherapists.map((therapist) => (
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
