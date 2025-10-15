import { Therapist, Testimonial, QuestionnaireStep } from '../types';

export const THERAPISTS: Therapist[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    credentials: 'Psychology Student',
    image: 'https://images.pexels.com/photos/5214329/pexels-photo-5214329.jpeg?auto=compress&cs=tinysrgb&w=400',
    specializations: ['Anxiety', 'Depression', 'PTSD'],
    languages: ['English', 'Mandarin'],
    hourlyRate: 40,
    availability: 'available',
    rating: 4.9,
    reviewCount: 127,
    bio: 'Second-year psychology student specializing in cognitive behavioral therapy approaches with a focus on anxiety and trauma recovery under supervision.'
  },
  {
    id: '2',
    name: 'Marcus Rodriguez',
    credentials: 'Systemic Therapy Trainee',
    image: 'https://images.pexels.com/photos/5407206/pexels-photo-5407206.jpeg?auto=compress&cs=tinysrgb&w=400',
    specializations: ['Couples Therapy', 'Family', 'Communication'],
    languages: ['English', 'Spanish'],
    hourlyRate: 45,
    availability: 'available',
    rating: 4.8,
    reviewCount: 89,
    bio: 'Advanced trainee in systemic therapy helping couples and families build stronger relationships through evidence-based approaches under professional supervision.'
  },
  {
    id: '3',
    name: 'Aisha Patel',
    credentials: 'Clinical Psychology Student',
    image: 'https://images.pexels.com/photos/5452268/pexels-photo-5452268.jpeg?auto=compress&cs=tinysrgb&w=400',
    specializations: ['ADHD', 'Autism', 'Workplace Stress'],
    languages: ['English', 'Hindi', 'Gujarati'],
    hourlyRate: 35,
    availability: 'busy',
    rating: 4.7,
    reviewCount: 156,
    bio: 'Clinical psychology student supporting neurodivergent individuals and professionals managing workplace challenges under licensed supervision.'
  },
  {
    id: '4',
    name: 'Jordan Kim',
    credentials: 'Counseling Psychology Trainee',
    image: 'https://images.pexels.com/photos/5214320/pexels-photo-5214320.jpeg?auto=compress&cs=tinysrgb&w=400',
    specializations: ['LGBTQ+', 'Identity', 'Young Adults'],
    languages: ['English', 'Korean'],
    hourlyRate: 40,
    availability: 'available',
    rating: 4.9,
    reviewCount: 203,
    bio: 'Counseling psychology trainee creating safe spaces for LGBTQ+ individuals and young adults navigating identity and relationships under supervision.'
  },
  {
    id: '5',
    name: 'Emily Watson',
    credentials: 'Gestalt Therapy Student',
    image: 'https://images.pexels.com/photos/5452201/pexels-photo-5452201.jpeg?auto=compress&cs=tinysrgb&w=400',
    specializations: ['Grief', 'Loss', 'Life Transitions'],
    languages: ['English'],
    hourlyRate: 30,
    availability: 'available',
    rating: 4.8,
    reviewCount: 94,
    bio: 'Gestalt therapy student providing compassionate support through life\'s most difficult transitions and losses under professional guidance.'
  },
  {
    id: '6',
    name: 'Carlos Morales',
    credentials: 'Humanistic Therapy Trainee',
    image: 'https://images.pexels.com/photos/5407204/pexels-photo-5407204.jpeg?auto=compress&cs=tinysrgb&w=400',
    specializations: ['Addiction', 'Recovery', 'Mindfulness'],
    languages: ['English', 'Spanish', 'Portuguese'],
    hourlyRate: 50,
    availability: 'offline',
    rating: 4.6,
    reviewCount: 78,
    bio: 'Advanced humanistic therapy trainee integrating mindfulness-based approaches in addiction recovery and mental wellness under supervision.'
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: '1',
    name: 'Jessica M.',
    role: 'Marketing Professional',
    content: 'TherapyBook connected me with the perfect therapist who understood my anxiety around work presentations. No upfront fees and the matching process was incredibly thoughtful.',
    image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400',
    rating: 5
  },
  {
    id: '2',
    name: 'David L.',
    role: 'College Student',
    content: 'As a college student on a budget, I was worried about finding affordable therapy. The platform made it easy with no upfront costs - I only pay for sessions I book.',
    image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=400',
    rating: 5
  },
  {
    id: '3',
    name: 'Maria S.',
    role: 'Working Parent',
    content: 'The video sessions are a game-changer for busy parents like me. I can get the support I need without leaving home. The therapists are professional and caring.',
    image: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400',
    rating: 5
  }
];

export const QUESTIONNAIRE_STEPS: QuestionnaireStep[] = [
  {
    id: '1',
    title: 'Primary Concerns',
    question: 'What brings you to therapy today? Select all that apply.',
    type: 'multiple',
    options: [
      'Anxiety or worry',
      'Depression or sadness',
      'Relationship issues',
      'Work or career stress',
      'Family problems',
      'Grief or loss',
      'Trauma or PTSD',
      'Identity or self-esteem',
      'Life transitions',
      'Other'
    ]
  },
  {
    id: '2',
    title: 'Therapy Style',
    question: 'What type of therapy approach appeals to you most?',
    type: 'single',
    options: [
      'Cognitive Behavioral Therapy (CBT) - Practical, goal-oriented',
      'Psychodynamic - Exploring past experiences and patterns',
      'Humanistic - Person-centered, empathetic approach',
      'Solution-Focused - Brief, outcome-oriented',
      'I\'m not sure - Help me decide'
    ]
  },
  {
    id: '3',
    title: 'Language Preference',
    question: 'In what language would you prefer to conduct therapy?',
    type: 'single',
    options: ['English', 'Spanish', 'Mandarin', 'Hindi', 'Korean', 'Other']
  },
  {
    id: '4',
    title: 'Schedule Availability',
    question: 'When are you typically available for sessions?',
    type: 'multiple',
    options: [
      'Weekday mornings (9 AM - 12 PM)',
      'Weekday afternoons (12 PM - 5 PM)',
      'Weekday evenings (5 PM - 8 PM)',
      'Weekend mornings',
      'Weekend afternoons',
      'Weekend evenings'
    ]
  }
];

export const ISSUE_TYPES = [
  'Anxiety',
  'Depression',
  'PTSD',
  'Couples Therapy',
  'Family',
  'ADHD',
  'Autism',
  'LGBTQ+',
  'Grief',
  'Addiction'
];

export const LANGUAGES = [
  'English',
  'Spanish',
  'Mandarin',
  'Hindi',
  'Korean',
  'Gujarati',
  'Portuguese'
];