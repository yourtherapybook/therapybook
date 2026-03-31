import { QuestionnaireStep } from '../types';

export const CRISIS_SCREENING_STEP: QuestionnaireStep = {
  id: '0',
  title: 'Safety Check',
  question: 'Before we begin, are you currently experiencing any of the following?',
  type: 'multiple',
  options: [
    'Thoughts of harming myself or others',
    'A mental health emergency or crisis',
    'None of the above — I\'m ready to continue'
  ]
};

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
    options: ['English', 'Spanish', 'German', 'Mandarin', 'Hindi', 'Korean', 'Other']
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

// Concern → specialty keyword mapping (replaces brittle first-word substring matching)
export const CONCERN_SPECIALTY_MAP: Record<string, string[]> = {
  'anxiety or worry': ['anxiety', 'worry', 'panic', 'stress', 'generalized anxiety'],
  'depression or sadness': ['depression', 'mood', 'sadness', 'depressive'],
  'relationship issues': ['relationships', 'couples', 'intimacy', 'communication', 'marriage'],
  'work or career stress': ['work stress', 'burnout', 'career', 'workplace', 'occupational'],
  'family problems': ['family', 'parenting', 'family conflict', 'domestic'],
  'grief or loss': ['grief', 'loss', 'bereavement', 'mourning'],
  'trauma or ptsd': ['trauma', 'ptsd', 'post-traumatic', 'abuse', 'sexual abuse'],
  'identity or self-esteem': ['identity', 'self-esteem', 'self-worth', 'self-image', 'lgbtq'],
  'life transitions': ['life transitions', 'adjustment', 'change', 'transition', 'relocation'],
  'other': [],
};

// Therapy style → orientation mapping
export const STYLE_ORIENTATION_MAP: Record<string, string[]> = {
  'cognitive behavioral therapy (cbt) - practical, goal-oriented': ['cbt', 'cognitive behavioral', 'cognitive-behavioral', 'behavioral'],
  'psychodynamic - exploring past experiences and patterns': ['psychodynamic', 'psychoanalytic', 'depth psychology'],
  'humanistic - person-centered, empathetic approach': ['humanistic', 'person-centered', 'person centered', 'gestalt', 'existential', 'rogerian'],
  'solution-focused - brief, outcome-oriented': ['solution-focused', 'solution focused', 'brief therapy', 'sfbt'],
  "i'm not sure - help me decide": [],
};

// Schedule preference → day-of-week + time-range mapping
export const SCHEDULE_MAP: Record<string, { days: number[]; startHour: number; endHour: number }> = {
  'weekday mornings (9 am - 12 pm)': { days: [1, 2, 3, 4, 5], startHour: 9, endHour: 12 },
  'weekday afternoons (12 pm - 5 pm)': { days: [1, 2, 3, 4, 5], startHour: 12, endHour: 17 },
  'weekday evenings (5 pm - 8 pm)': { days: [1, 2, 3, 4, 5], startHour: 17, endHour: 20 },
  'weekend mornings': { days: [0, 6], startHour: 9, endHour: 12 },
  'weekend afternoons': { days: [0, 6], startHour: 12, endHour: 17 },
  'weekend evenings': { days: [0, 6], startHour: 17, endHour: 20 },
};
