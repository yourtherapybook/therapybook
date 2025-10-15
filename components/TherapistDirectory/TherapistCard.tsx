import React from 'react';
import { Star, Globe, Euro, Clock, MessageCircle, GraduationCap, Building, Award } from 'lucide-react';
import { Therapist } from '../../types';

interface TherapistCardProps {
  therapist: Therapist;
  onBookSession: (therapistId: string) => void;
}

const TherapistCard: React.FC<TherapistCardProps> = ({ therapist, onBookSession }) => {
  // Mock data for trainee-specific information
  const mockTraineeData = {
    institution: "University of Leipzig – Systemic Therapy Program",
    trainingStage: "2nd year trainee",
    skillsAcquired: ["Active listening", "CBT techniques", "Crisis intervention", "Group facilitation"]
  };

  const getAvailabilityColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'busy':
        return 'bg-yellow-100 text-yellow-800';
      case 'offline':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-neutral-100 text-neutral-800';
    }
  };

  const getAvailabilityText = (status: string) => {
    switch (status) {
      case 'available':
        return 'Available';
      case 'busy':
        return 'Busy';
      case 'offline':
        return 'Offline';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-subtle hover:shadow-hover transition-all duration-300 overflow-hidden border border-neutral-100">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-4">
            <img
              src={therapist.image}
              alt={therapist.name}
              className="w-16 h-16 rounded-xl object-cover"
            />
            <div>
              <h3 className="text-lg font-semibold text-neutral-900">
                {therapist.name}
              </h3>
              <div className="flex items-center space-x-1 text-sm text-blue-600 mb-1">
                <Building className="h-3 w-3" />
                <span>{mockTraineeData.institution}</span>
              </div>
              <div className="flex items-center space-x-1 text-sm text-primary-600">
                <GraduationCap className="h-3 w-3" />
                <span>{mockTraineeData.trainingStage}</span>
              </div>
              <div className="flex items-center mt-1">
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <span className="text-sm text-neutral-600 ml-1">
                  {therapist.rating} ({therapist.reviewCount} reviews)
                </span>
              </div>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getAvailabilityColor(therapist.availability)}`}>
            {getAvailabilityText(therapist.availability)}
          </span>
        </div>

        {/* Bio */}
        <p className="text-neutral-600 text-sm leading-relaxed mb-4">
          {therapist.bio}
        </p>

        {/* Skills & Topics Acquired */}
        <div className="mb-4">
          <div className="flex items-center space-x-1 mb-2">
            <Award className="h-4 w-4 text-primary-500" />
            <span className="text-sm font-medium text-neutral-700">Skills & Topics Acquired</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {mockTraineeData.skillsAcquired.slice(0, 3).map((skill, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full"
              >
                {skill}
              </span>
            ))}
            {mockTraineeData.skillsAcquired.length > 3 && (
              <span className="px-2 py-1 bg-neutral-100 text-neutral-600 text-xs rounded-full">
                +{mockTraineeData.skillsAcquired.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Specializations */}
        <div className="mb-4">
          <div className="flex items-center space-x-1 mb-2">
            <span className="text-sm font-medium text-neutral-700">Specialties</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {therapist.specializations.slice(0, 3).map((spec, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded-full"
              >
                {spec}
              </span>
            ))}
          </div>
        </div>

        {/* Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center text-neutral-600">
            <Globe className="h-4 w-4 mr-2" />
            <span>{therapist.languages.join(', ')}</span>
          </div>
          <div className="flex items-center text-neutral-600">
            <Euro className="h-4 w-4 mr-2" />
            <span>€{therapist.hourlyRate}/session</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-100">
        <div className="flex space-x-3">
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
            Book Session
          </button>
          <button className="px-4 py-3 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors">
            <MessageCircle className="h-4 w-4 text-neutral-600" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TherapistCard;