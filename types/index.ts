export interface Therapist {
  id: string;
  name: string;
  credentials: string;
  image: string;
  specializations: string[];
  languages: string[];
  hourlyRate: number;
  availability: 'available' | 'busy' | 'offline';
  rating: number;
  reviewCount: number;
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
  reasons: string[];
}

export interface FilterOptions {
  issueTypes: string[];
  languages: string[];
  priceRange: [number, number];
  availability: string[];
}