import { QuestionnaireStep } from '../types';

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
