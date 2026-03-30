import React from 'react';
import Link from 'next/link';
import { Building, Clock, Euro, Globe, GraduationCap } from 'lucide-react';
import { Therapist } from '../../types';

interface TherapistCardProps {
  therapist: Therapist;
  onBookSession: (therapistId: string) => void;
}

const TherapistCard: React.FC<TherapistCardProps> = ({ therapist, onBookSession }) => {
  const initials = therapist.name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const availabilityColor =
    therapist.availability === 'available'
      ? 'bg-green-100 text-green-800'
      : 'bg-neutral-200 text-neutral-700';

  const availabilityText =
    therapist.availability === 'available'
      ? 'Booking open'
      : 'Availability not published';

  return (
    <div className="bg-white rounded-xl shadow-subtle hover:shadow-hover transition-all duration-300 overflow-hidden border border-neutral-100">
      <div className="p-6 pb-4">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center space-x-4">
            {therapist.image ? (
              <img
                src={therapist.image}
                alt={therapist.name}
                className="w-16 h-16 rounded-xl object-cover border border-neutral-200"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-neutral-100 text-lg font-semibold text-neutral-700">
                {initials}
              </div>
            )}
            <div>
              <h3 className="text-lg font-semibold text-neutral-900">
                {therapist.name}
              </h3>
              <div className="text-sm text-neutral-600 mb-1">{therapist.credentials}</div>
              {therapist.institutionOfStudy && (
                <div className="flex items-center space-x-1 text-sm text-blue-600">
                  <Building className="h-3 w-3" />
                  <span>{therapist.institutionOfStudy}</span>
                </div>
              )}
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${availabilityColor}`}>
            {availabilityText}
          </span>
        </div>

        <p className="text-neutral-600 text-sm leading-relaxed mb-4 line-clamp-2">
          {therapist.bio}
        </p>

        {therapist.skillsAcquired && therapist.skillsAcquired.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center space-x-1 mb-2">
              <GraduationCap className="h-4 w-4 text-primary-500" />
              <span className="text-sm font-medium text-neutral-700">Training focus</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {therapist.skillsAcquired.slice(0, 4).map((skill) => (
                <span
                  key={skill}
                  className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mb-4">
          <span className="text-sm font-medium text-neutral-700">Specialties</span>
          <div className="mt-2 flex flex-wrap gap-2">
            {therapist.specializations.length > 0 ? therapist.specializations.slice(0, 4).map((spec) => (
              <span
                key={spec}
                className="px-3 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded-full"
              >
                {spec}
              </span>
            )) : (
              <span className="text-sm text-neutral-500">Specialties will be added shortly.</span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center text-neutral-600">
            <Globe className="h-4 w-4 mr-2" />
            <span>{therapist.languages.length > 0 ? therapist.languages.join(', ') : 'Language profile pending'}</span>
          </div>
          <div className="flex items-center text-neutral-600">
            <Euro className="h-4 w-4 mr-2" />
            <span>€{therapist.hourlyRate}/session</span>
          </div>
        </div>
      </div>

      <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-100 flex gap-2">
        <Link
          href={`/directory/${therapist.id}`}
          className="flex-1 py-3 px-4 rounded-lg font-medium text-sm text-center transition-colors border-2 border-neutral-200 text-neutral-700 hover:bg-neutral-100"
        >
          View Profile
        </Link>
        <button
          onClick={() => onBookSession(therapist.id)}
          disabled={therapist.availability === 'offline'}
          className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-colors ${
            therapist.availability === 'offline'
              ? 'bg-neutral-200 text-neutral-500 cursor-not-allowed'
              : 'bg-primary-500 hover:bg-primary-600 text-white'
          }`}
        >
          <Clock className="h-4 w-4 inline mr-2" />
          {therapist.availability === 'offline' ? 'Unavailable' : 'Book Session'}
        </button>
      </div>
    </div>
  );
};

export default TherapistCard;
