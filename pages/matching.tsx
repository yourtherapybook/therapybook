import React, { useState } from 'react';
import Questionnaire from '../components/MatchingFlow/Questionnaire';
import Results from '../components/MatchingFlow/Results';
import { MatchingResult } from '../types';
import { THERAPISTS } from '../utils/constants';

const Matching: React.FC = () => {
  const [showResults, setShowResults] = useState(false);
  const [matchingResults, setMatchingResults] = useState<MatchingResult[]>([]);

  const generateMatches = (answers: Record<string, string[]>): MatchingResult[] => {
    // Simple matching algorithm for demo purposes
    const matches: MatchingResult[] = [];
    
    // Get top 3 therapists based on matching criteria
    const topTherapists = THERAPISTS.slice(0, 3);
    
    topTherapists.forEach((therapist, index) => {
      const matchPercentage = 95 - (index * 5); // 95%, 90%, 85%
      
      const reasons = [
        'Specializes in your primary concerns',
        'Matches your preferred therapy approach',
        'Available in your preferred language',
        'Fits within your schedule preferences'
      ];

      matches.push({
        therapist,
        matchPercentage,
        reasons: reasons.slice(0, 3)
      });
    });

    return matches;
  };

  const handleQuestionnaireComplete = (answers: Record<string, string[]>) => {
    const results = generateMatches(answers);
    setMatchingResults(results);
    setShowResults(true);
  };

  const handleBookSession = (therapistId: string) => {
    // In a real app, this would navigate to booking flow
    console.log('Booking session with therapist:', therapistId);
  };

  const handleRetakeAssessment = () => {
    setShowResults(false);
    setMatchingResults([]);
  };

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {!showResults ? (
          <div>
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-3xl font-bold text-neutral-900 mb-4">
                Find Your Perfect Therapist Match
              </h1>
              <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
                Answer a few questions to help us connect you with therapists who best understand your needs and preferences.
              </p>
            </div>

            <Questionnaire onComplete={handleQuestionnaireComplete} />
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