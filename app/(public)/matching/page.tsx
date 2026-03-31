"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, AlertTriangle, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Questionnaire from '@/components/MatchingFlow/Questionnaire';
import Results from '@/components/MatchingFlow/Results';
import { MatchingResult, Therapist } from '@/types';
import { analytics } from '@/lib/analytics';
import {
  CRISIS_SCREENING_STEP,
  CONCERN_SPECIALTY_MAP,
  STYLE_ORIENTATION_MAP,
  SCHEDULE_MAP,
} from '@/utils/constants';

const normalize = (value: string) => value.toLowerCase().trim();

// --- Improved matching algorithm ---

interface ProviderWithMeta extends Therapist {
  averageRating?: number | null;
  ratingCount?: number;
  hasSupervisor?: boolean;
  availabilitySlots?: { dayOfWeek: number; startTime: string; endTime: string }[];
}

function parseTime(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + (m || 0);
}

function matchSpecialties(therapistSpecialties: string[], concerns: string[]): string[] {
  const matched: string[] = [];
  for (const concern of concerns) {
    const keywords = CONCERN_SPECIALTY_MAP[concern] || [];
    if (keywords.length === 0) continue;
    for (const spec of therapistSpecialties) {
      const normSpec = normalize(spec);
      if (keywords.some((kw) => normSpec.includes(kw))) {
        if (!matched.includes(spec)) matched.push(spec);
      }
    }
  }
  return matched;
}

function matchOrientation(therapistOrientations: string[], styles: string[]): string | null {
  for (const style of styles) {
    const keywords = STYLE_ORIENTATION_MAP[style] || [];
    if (keywords.length === 0) continue;
    for (const orient of therapistOrientations) {
      const normOrient = normalize(orient);
      if (keywords.some((kw) => normOrient.includes(kw))) {
        return orient;
      }
    }
  }
  return null;
}

function matchSchedule(
  slots: { dayOfWeek: number; startTime: string; endTime: string }[] | undefined,
  schedulePrefs: string[]
): boolean {
  if (!slots || slots.length === 0 || schedulePrefs.length === 0) return false;

  for (const pref of schedulePrefs) {
    const mapping = SCHEDULE_MAP[pref];
    if (!mapping) continue;

    for (const slot of slots) {
      if (!mapping.days.includes(slot.dayOfWeek)) continue;
      const slotStart = parseTime(slot.startTime);
      const slotEnd = parseTime(slot.endTime);
      const prefStart = mapping.startHour * 60;
      const prefEnd = mapping.endHour * 60;
      // Check overlap
      if (slotStart < prefEnd && slotEnd > prefStart) {
        return true;
      }
    }
  }
  return false;
}

function getMatchLabel(score: number): string {
  if (score >= 80) return 'Strong fit';
  if (score >= 55) return 'Good fit';
  if (score >= 35) return 'Possible fit';
  return 'Limited fit';
}

const buildMatches = (providers: ProviderWithMeta[], answers: Record<string, string[]>): MatchingResult[] => {
  const concerns = (answers['1'] || []).map(normalize);
  const therapyStyle = (answers['2'] || []).map(normalize);
  const languages = (answers['3'] || []).map(normalize);
  const schedule = (answers['4'] || []).map(normalize);

  return providers
    .filter((t) => t.availability === 'available') // Only match available providers
    .map((therapist) => {
      let score = 30; // base score for being available and approved
      const reasons: string[] = [];

      // Specialty matching (capped at 36 = 2 × 18)
      const specialtyMatches = matchSpecialties(therapist.specializations, concerns);
      if (specialtyMatches.length > 0) {
        score += Math.min(specialtyMatches.length * 18, 36);
        reasons.push(`Specializes in ${specialtyMatches.slice(0, 2).join(' and ')}`);
      }

      // Language matching (required signal, strong weight)
      const languageMatch = therapist.languages.find((lang) =>
        languages.includes(normalize(lang))
      );
      if (languageMatch) {
        score += 20;
        reasons.push(`Speaks ${languageMatch}`);
      }

      // Treatment orientation matching
      const orientationMatch = matchOrientation(therapist.treatmentOrientation || [], therapyStyle);
      if (orientationMatch) {
        score += 15;
        reasons.push(`Trained in ${orientationMatch}`);
      }

      // Real schedule compatibility
      const scheduleMatch = matchSchedule(
        (therapist as ProviderWithMeta).availabilitySlots,
        schedule
      );
      if (scheduleMatch) {
        score += 12;
        reasons.push('Available when you are');
      }

      // Rating quality bonus (small but meaningful)
      const avgRating = (therapist as ProviderWithMeta).averageRating;
      if (avgRating && avgRating >= 4.0) {
        score += 5;
      }

      // Supervision status bonus (safety signal)
      if ((therapist as ProviderWithMeta).hasSupervisor) {
        score += 8;
        reasons.push('Under active supervision');
      }

      if (reasons.length === 0) {
        reasons.push('Approved trainee available for booking');
      }

      return {
        therapist,
        matchPercentage: Math.min(98, score),
        matchLabel: getMatchLabel(score),
        reasons: reasons.slice(0, 3),
      };
    })
    .sort((a, b) => b.matchPercentage - a.matchPercentage)
    .slice(0, 5); // Show up to 5 results
};

const Matching: React.FC = () => {
  const router = useRouter();
  const [showResults, setShowResults] = useState(false);
  const [showCrisisAlert, setShowCrisisAlert] = useState(false);
  const [matchingResults, setMatchingResults] = useState<MatchingResult[]>([]);
  const [providers, setProviders] = useState<ProviderWithMeta[]>([]);
  const [isLoadingProviders, setIsLoadingProviders] = useState(true);
  const [providerError, setProviderError] = useState<string | null>(null);

  useEffect(() => {
    const loadProviders = async () => {
      try {
        setIsLoadingProviders(true);
        const response = await fetch('/api/providers?includeMatchData=true');
        if (!response.ok) throw new Error('Failed to load providers');
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
    // Crisis screening check (question 0)
    const crisisAnswers = answers['0'] || [];
    const hasCrisisFlag = crisisAnswers.some(
      (a) => a !== "None of the above — I'm ready to continue"
    );

    if (hasCrisisFlag) {
      setShowCrisisAlert(true);
      return;
    }

    const results = buildMatches(providers, answers);
    setMatchingResults(results);
    setShowResults(true);
    analytics.matchingCompleted(results.length);

    // Persist intake
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
    }).catch(() => {});
  };

  const handleBookSession = (therapistId: string) => {
    // Carry intake context to booking via URL
    const intakeContext = matchingResults.find((r) => r.therapist.id === therapistId);
    const params = new URLSearchParams({ therapistId });
    if (intakeContext) {
      params.set('matchSource', 'intake');
      params.set('matchReasons', intakeContext.reasons.join('|'));
    }
    router.push(`/booking?${params.toString()}`);
  };

  const handleRetakeAssessment = () => {
    setShowResults(false);
    setShowCrisisAlert(false);
    setMatchingResults([]);
  };

  // Crisis alert screen
  if (showCrisisAlert) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
        <div className="max-w-lg mx-auto text-center space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-neutral-900">
            We want to make sure you're safe
          </h1>
          <p className="text-neutral-600 leading-relaxed">
            TherapyBook connects you with trainee therapists for non-crisis support.
            If you're experiencing a mental health emergency, please reach out to
            a crisis service immediately.
          </p>
          <div className="space-y-3">
            <a
              href="tel:112"
              className="flex items-center justify-center gap-2 w-full py-3 px-6 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
            >
              <Phone className="h-5 w-5" />
              Emergency: 112
            </a>
            <a
              href="tel:+498001110111"
              className="flex items-center justify-center gap-2 w-full py-3 px-6 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
            >
              <Phone className="h-5 w-5" />
              Crisis Line: 0800 111 0 111
            </a>
            <a
              href="https://www.telefonseelsorge.de/"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Telefonseelsorge — 24/7 Support
            </a>
          </div>
          <div className="pt-4 border-t border-neutral-200">
            <p className="text-sm text-neutral-500 mb-3">
              If you're not in immediate danger and would like to continue:
            </p>
            <Button variant="outline" onClick={handleRetakeAssessment}>
              Return to questionnaire
            </Button>
          </div>
        </div>
      </div>
    );
  }

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
                Answer a few questions and we'll rank approved trainee therapists based on your preferences.
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
              <Questionnaire
                onComplete={handleQuestionnaireComplete}
                crisisScreeningStep={CRISIS_SCREENING_STEP}
              />
            )}
          </div>
        ) : (
          <div>
            <Results
              results={matchingResults}
              onBookSession={handleBookSession}
              onRetakeAssessment={handleRetakeAssessment}
            />
            {matchingResults.length === 0 && (
              <div className="mx-auto max-w-2xl mt-8 rounded-xl border border-amber-200 bg-amber-50 p-6 text-center">
                <h3 className="font-semibold text-amber-900 mb-2">We're still growing our network</h3>
                <p className="text-sm text-amber-800 mb-4">
                  We don't have a strong match for your preferences right now. You can browse all available therapists in the directory or contact us for help.
                </p>
                <div className="flex justify-center gap-3">
                  <Button variant="outline" asChild>
                    <Link href="/directory">Browse Directory</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <a href="mailto:support@therapybook.com">Contact Support</a>
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Matching;
