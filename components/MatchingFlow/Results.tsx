import React from 'react';
import Link from 'next/link';
import { Heart, Calendar, ArrowRight } from 'lucide-react';
import { MatchingResult } from '../../types';

interface ResultsProps {
  results: MatchingResult[];
  onBookSession: (therapistId: string) => void;
  onRetakeAssessment: () => void;
}

const Results: React.FC<ResultsProps> = ({ results, onBookSession, onRetakeAssessment }) => {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
          <Heart className="h-8 w-8 text-primary-500" />
        </div>
        <h1 className="text-3xl font-bold text-neutral-900 mb-4">
          Your Perfect Matches
        </h1>
        <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
          Based on your responses, we've found {results.length} therapists who are perfectly suited to support your mental health journey.
        </p>
      </div>

      {/* Results */}
      <div className="space-y-6 mb-12">
        {results.map((result, index) => (
          <div
            key={result.therapist.id}
            className="bg-white rounded-xl shadow-subtle hover:shadow-hover transition-all duration-300 overflow-hidden border border-neutral-100"
          >
            <div className="p-6">
              {/* Match badge */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <span className="bg-primary-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    #{index + 1} Match
                  </span>
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                    {result.matchPercentage}% Match
                  </span>
                </div>
                <div className="text-sm text-neutral-600">
                  {result.therapist.institutionOfStudy || 'Approved TherapyBook trainee'}
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {/* Therapist info */}
                <div className="md:col-span-2">
                  <div className="flex items-start space-x-4 mb-4">
                    <img
                      src={result.therapist.image}
                      alt={result.therapist.name}
                      className="w-20 h-20 rounded-xl object-cover"
                    />
                    <div>
                      <h3 className="text-xl font-semibold text-neutral-900 mb-1">
                        {result.therapist.name}
                      </h3>
                      <p className="text-neutral-600 mb-2">
                        {result.therapist.credentials}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {result.therapist.specializations.map((spec, specIndex) => (
                          <span
                            key={specIndex}
                            className="px-2 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded-full"
                          >
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <p className="text-neutral-600 mb-4 leading-relaxed">
                    {result.therapist.bio}
                  </p>

                  {/* Match reasons */}
                  <div>
                    <h4 className="font-medium text-neutral-900 mb-2">
                      Why this is a great match:
                    </h4>
                    <ul className="space-y-1">
                      {result.reasons.map((reason, reasonIndex) => (
                        <li key={reasonIndex} className="flex items-center text-sm text-neutral-600">
                          <div className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-2" />
                          {reason}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-4">
                  <div className="bg-neutral-50 rounded-xl p-4">
                    <div className="text-2xl font-bold text-neutral-900 mb-1">
                      €{result.therapist.hourlyRate}
                    </div>
                    <div className="text-sm text-neutral-600">per session</div>
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={() => onBookSession(result.therapist.id)}
                      className="w-full bg-primary-500 hover:bg-primary-600 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Book Session
                    </button>
                    <Link
                      href="/directory"
                      className="block w-full border border-neutral-200 hover:bg-neutral-50 text-neutral-700 py-3 px-4 rounded-lg font-medium transition-colors text-center"
                    >
                      Browse Directory
                    </Link>
                  </div>

                  <div className="text-center">
                    <span className="text-xs text-neutral-500">
                      Languages: {result.therapist.languages.join(', ')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom actions */}
      <div className="text-center space-y-4">
        <button
          onClick={onRetakeAssessment}
          className="text-primary-600 hover:text-primary-700 font-medium inline-flex items-center"
        >
          Not satisfied with these matches?
          <ArrowRight className="h-4 w-4 ml-1" />
        </button>
        <p className="text-sm text-neutral-500">
          You can retake the assessment or continue into the full directory.
        </p>
      </div>
    </div>
  );
};

export default Results;
