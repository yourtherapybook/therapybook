export interface Therapist {
  id: string;
  name: string;
  credentials: string;
  image?: string;
  institutionOfStudy?: string;
  skillsAcquired?: string[];
  specializations: string[];
  treatmentOrientation?: string[];
  modality?: string[];
  ageGroups?: string[];
  languages: string[];
  hourlyRate: number;
  availability: 'available' | 'offline';
  rating?: number;
  reviewCount?: number;
  bio: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  content: string;
  image: string;
  rating: number;
}

export interface QuestionnaireStep {
  id: string;
  title: string;
  question: string;
  type: 'single' | 'multiple' | 'scale';
  options: string[];
}

export interface MatchingResult {
  therapist: Therapist;
  matchPercentage: number;
  matchLabel?: string;
  reasons: string[];
}

export interface FilterOptions {
  issueTypes: string[];
  languages: string[];
  availability: string[];
}
