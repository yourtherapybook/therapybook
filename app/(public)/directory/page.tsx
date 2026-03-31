"use client";
import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Filter, Loader2, Users, Search, ArrowUpDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import TherapistCard from '@/components/TherapistDirectory/TherapistCard';
import FilterSidebar from '@/components/TherapistDirectory/FilterSidebar';
import { FilterOptions, Therapist } from '@/types';
import { analytics } from '@/lib/analytics';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'availability'>('availability');
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
        analytics.directoryViewed();
      }
    };

    void loadProviders();
  }, []);

  const filteredTherapists = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    const filtered = providers.filter((therapist) => {
      // Text search across name, specializations, languages, bio
      if (query) {
        const searchable = [
          therapist.name,
          ...therapist.specializations,
          ...therapist.languages,
          therapist.bio,
          therapist.credentials,
          therapist.institutionOfStudy || '',
        ].join(' ').toLowerCase();
        if (!searchable.includes(query)) return false;
      }

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

    // Sort
    if (sortBy === 'availability') {
      filtered.sort((a, b) => {
        if (a.availability === 'available' && b.availability !== 'available') return -1;
        if (a.availability !== 'available' && b.availability === 'available') return 1;
        return a.name.localeCompare(b.name);
      });
    } else {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    return filtered;
  }, [filters, providers, searchQuery, sortBy]);

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
        <div className="mb-8 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 mb-2">
                Find Your Therapist
              </h1>
              <p className="text-neutral-600">
                {isLoading ? 'Loading providers...' : `${filteredTherapists.length} verified trainee therapists · Credentials reviewed · Book instantly`}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {activeFilterCount > 0 && (
                <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm">
                  {activeFilterCount} filters active
                </span>
              )}
              <Button
                variant="outline"
                onClick={() => setIsFilterOpen(true)}
                className="md:hidden"
              >
                <Filter className="h-4 w-4" />
                Filter
              </Button>
            </div>
          </div>

          {/* Search + Sort bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <Input
                type="text"
                placeholder="Search by name, specialty, or language..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setSortBy(sortBy === 'availability' ? 'name' : 'availability')}
              className="shrink-0"
            >
              <ArrowUpDown className="h-4 w-4" />
              Sort: {sortBy === 'availability' ? 'Available first' : 'Name A–Z'}
            </Button>
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
                <div className="bg-white rounded-xl shadow-subtle p-8">
                  <Users className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                    Directory unavailable
                  </h3>
                  <p className="text-neutral-600 mb-4">
                    {loadError}
                  </p>
                  <Button onClick={() => window.location.reload()}>
                    Retry
                  </Button>
                </div>
              </div>
            ) : filteredTherapists.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-white rounded-xl shadow-subtle p-8">
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
                    <Button onClick={handleClearFilters}>
                      Clear Filters
                    </Button>
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
