"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import Questionnaire from '@/components/MatchingFlow/Questionnaire';
import Results from '@/components/MatchingFlow/Results';
import { MatchingResult, Therapist } from '@/types';
import { analytics } from '@/lib/analytics';

const normalize = (value: string) => value.toLowerCase().trim();

const getQuestionKeywords = (answers: Record<string, string[]>) => {
  const concerns = (answers['1'] || []).map(normalize);
  const therapyStyle = (answers['2'] || []).map(normalize);
  const languages = (answers['3'] || []).map(normalize);
  const schedule = (answers['4'] || []).map(normalize);

  return { concerns, therapyStyle, languages, schedule };
};

const buildMatches = (providers: Therapist[], answers: Record<string, string[]>): MatchingResult[] => {
  const { concerns, therapyStyle, languages, schedule } = getQuestionKeywords(answers);

  return providers
    .map((therapist) => {
      let score = therapist.availability === 'available' ? 45 : 20;
      const reasons: string[] = [];

      const specialtyMatches = therapist.specializations.filter((specialization) =>
        concerns.some((concern) => normalize(specialization).includes(concern.split(' ')[0]))
      );
      if (specialtyMatches.length > 0) {
        score += specialtyMatches.length * 18;
        reasons.push(`Specializes in ${specialtyMatches.slice(0, 2).join(' and ')}`);
      }

      const languageMatch = therapist.languages.find((language) =>
        languages.includes(normalize(language))
      );
      if (languageMatch) {
        score += 20;
        reasons.push(`Can work with you in ${languageMatch}`);
      }

      const orientationMatch = therapist.treatmentOrientation?.find((orientation) =>
        therapyStyle.some((style) => normalize(orientation).includes(style.includes('cbt') ? 'cbt' : style.split(' ')[0]))
      );
      if (orientationMatch) {
        score += 12;
        reasons.push(`Training includes ${orientationMatch}`);
      }

      if (schedule.length > 0 && therapist.availability === 'available') {
        score += 8;
        reasons.push('Has published availability for booking');
      }

      if (reasons.length === 0) {
        reasons.push('Approved trainee profile matches your overall intake preferences');
      }

      return {
        therapist,
        matchPercentage: Math.min(98, Math.max(55, score)),
        reasons: reasons.slice(0, 3),
      };
    })
    .sort((a, b) => b.matchPercentage - a.matchPercentage)
    .slice(0, 3);
};

const Matching: React.FC = () => {
  const router = useRouter();
  const [showResults, setShowResults] = useState(false);
  const [matchingResults, setMatchingResults] = useState<MatchingResult[]>([]);
  const [providers, setProviders] = useState<Therapist[]>([]);
  const [isLoadingProviders, setIsLoadingProviders] = useState(true);
  const [providerError, setProviderError] = useState<string | null>(null);

  useEffect(() => {
    const loadProviders = async () => {
      try {
        setIsLoadingProviders(true);
        const response = await fetch('/api/providers');
        if (!response.ok) {
          throw new Error('Failed to load providers');
        }

        const data = await response.json();
        setProviders(data.providers || []);
        setProviderError(null);
      } catch (error) {
        setProviderError(error instanceof Error ? error.message : 'Failed to load providers');
      } finally {
        setIsLoadingProviders(false);
      }
    };

    void loadProviders();
  }, []);

  const handleQuestionnaireComplete = (answers: Record<string, string[]>) => {
    const results = buildMatches(providers, answers);
    setMatchingResults(results);
    setShowResults(true);
    analytics.matchingCompleted(results.length);

    // Persist intake and match results server-side (fire-and-forget)
    fetch('/api/intake', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        responses: answers,
        matches: results.map((r) => ({
          therapistId: r.therapist.id,
          therapistName: r.therapist.name,
          score: r.matchPercentage,
          reasons: r.reasons,
        })),
      }),
    }).catch(() => {
      // Non-blocking — matching UX works without persistence
    });
  };

  const handleBookSession = (therapistId: string) => {
    router.push(`/booking?therapistId=${encodeURIComponent(therapistId)}`);
  };

  const handleRetakeAssessment = () => {
    setShowResults(false);
    setMatchingResults([]);
  };

  if (isLoadingProviders) {
    return (
      <div className="min-h-screen bg-neutral-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center py-20 text-neutral-600">
          <Loader2 className="h-6 w-6 animate-spin mr-3" />
          Loading approved providers...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {!showResults ? (
          <div>
            <div className="text-center mb-12">
              <h1 className="text-3xl font-bold text-neutral-900 mb-4">
                Find Your Best Trainee Match
              </h1>
              <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
                Answer a few questions and we&apos;ll rank approved trainee therapists using the live provider directory.
              </p>
            </div>

            {providerError ? (
              <div className="mx-auto max-w-2xl rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-800">
                {providerError}
              </div>
            ) : providers.length === 0 ? (
              <div className="mx-auto max-w-2xl rounded-xl border border-neutral-200 bg-white p-8 text-center">
                <h2 className="text-xl font-semibold text-neutral-900 mb-2">No providers available yet</h2>
                <p className="text-neutral-600">The matching flow will unlock once approved trainees publish their profiles.</p>
              </div>
            ) : (
              <Questionnaire onComplete={handleQuestionnaireComplete} />
            )}
          </div>
        ) : (
          <Results
            results={matchingResults}
            onBookSession={handleBookSession}
            onRetakeAssessment={handleRetakeAssessment}
          />
        )}
      </div>
    </div>
  );
};

export default Matching;
