import { z } from 'zod';
import { TraineeApplication, FormValidation } from '../types/trainee-application';

// Zod schemas for validation
export const accountInfoSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name must be less than 50 characters'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name must be less than 50 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional().refine((phone) => {
    if (!phone) return true;
    return /^[\+]?[1-9][\d]{0,15}$/.test(phone.replace(/\s/g, ''));
  }, 'Please enter a valid phone number'),
  password: z.string().optional(),
  confirmPassword: z.string().optional(),
  requiresPassword: z.boolean().optional(),
}).superRefine((data, ctx) => {
  const requiresPassword = data.requiresPassword !== false;
  const password = data.password || '';
  const confirmPassword = data.confirmPassword || '';

  if (!requiresPassword && !password && !confirmPassword) {
    return;
  }

  if (password.length < 8) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['password'],
      message: 'Password must be at least 8 characters',
    });
  }

  if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['password'],
      message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
    });
  }

  if (!confirmPassword) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['confirmPassword'],
      message: 'Please confirm your password',
    });
  }

  if (password !== confirmPassword) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['confirmPassword'],
      message: "Passwords don't match",
    });
  }
});

export const officeLocationSchema = z.object({
  practiceName: z.string().min(1, 'Practice name is required').max(100, 'Practice name must be less than 100 characters'),
  practiceWebsite: z.string().optional().refine((url) => {
    if (!url) return true;
    return /^https?:\/\/.+/.test(url);
  }, 'Please enter a valid URL (starting with http:// or https://)'),
  officePhone: z.string().optional().refine((phone) => {
    if (!phone) return true;
    return /^[\+]?[1-9][\d]{0,15}$/.test(phone.replace(/\s/g, ''));
  }, 'Please enter a valid phone number'),
  address: z.object({
    street: z.string().min(1, 'Street address is required').max(100, 'Street address must be less than 100 characters'),
    addressLine2: z.string().optional(),
    city: z.string().min(1, 'City is required').max(50, 'City must be less than 50 characters'),
    stateProvince: z.string().min(1, 'State/Province is required').max(50, 'State/Province must be less than 50 characters'),
    zipPostalCode: z.string().min(1, 'ZIP/Postal code is required').max(20, 'ZIP/Postal code must be less than 20 characters'),
    country: z.string().min(1, 'Country is required'),
  }),
});

export const publicProfileSchema = z.object({
  title: z.enum(['Dr.', 'Mr.', 'Mrs.', 'Ms.', 'Mx.', ''], {
    errorMap: () => ({ message: 'Please select a title' })
  }).refine((title) => title !== '', 'Title is required'),
  therapistType: z.literal('Student Intern / Trainee'),
  institutionOfStudy: z.string().min(1, 'Institution of study is required').max(100, 'Institution name must be less than 100 characters'),
  skillsAcquired: z.array(z.string()).min(1, 'Please select at least one skill'),
  otherSkills: z.string().optional(),
  specialties: z.array(z.string()).min(1, 'Please select at least one specialty'),
  treatmentOrientation: z.array(z.string()).min(1, 'Please select at least one treatment orientation'),
  modality: z.array(z.string()).min(1, 'Please select at least one modality'),
  ageGroups: z.array(z.string()).min(1, 'Please select at least one age group'),
  languages: z.array(z.string()).min(1, 'Please select at least one language'),
  otherLanguages: z.string().optional(),
  ethnicitiesServed: z.array(z.string()).min(1, 'Please select at least one ethnicity served'),
  personalStatement: z.string()
    .min(200, 'Personal statement must be at least 200 characters')
    .max(1000, 'Personal statement must be less than 1000 characters'),
  profilePhotoUrl: z.string().optional(),
});

export const agreementsSchema = z.object({
  motivationStatement: z.string()
    .min(1, 'Motivation statement is required')
    .max(250, 'Motivation statement must be 250 characters or less'),
  paymentAgreement: z.boolean().refine((val) => val === true, 'Payment agreement is required'),
  responseTimeAgreement: z.boolean().refine((val) => val === true, 'Response time agreement is required'),
  minimumClientCommitment: z.boolean().refine((val) => val === true, 'Minimum client commitment agreement is required'),
  termsOfService: z.boolean().refine((val) => val === true, 'Terms of service agreement is required'),
  referrals: z.array(z.object({
    id: z.string(),
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    workEmail: z.string().email('Please enter a valid email address'),
  })).optional(),
});

// Complete application schema
export const traineeApplicationSchema = z.object({
  accountInfo: accountInfoSchema,
  officeLocation: officeLocationSchema,
  publicProfile: publicProfileSchema,
  agreements: agreementsSchema,
});

// Validation functions
export const validateStep = (step: number, data: Partial<TraineeApplication>): FormValidation => {
  const errors: Record<string, string> = {};
  const warnings: Record<string, string> = {};

  try {
    switch (step) {
      case 1:
        if (data.accountInfo) {
          accountInfoSchema.parse(data.accountInfo);
        } else {
          return { isValid: false, errors: { general: 'Account information is missing' }, warnings };
        }
        break;

      case 2:
        if (data.officeLocation) {
          officeLocationSchema.parse(data.officeLocation);
        } else {
          return { isValid: false, errors: { general: 'Office location information is missing' }, warnings };
        }
        break;

      case 3:
        if (data.publicProfile) {
          publicProfileSchema.parse(data.publicProfile);
        } else {
          return { isValid: false, errors: { general: 'Public profile information is missing' }, warnings };
        }
        break;

      case 4:
        if (data.agreements) {
          agreementsSchema.parse(data.agreements);
        } else {
          return { isValid: false, errors: { general: 'Agreements information is missing' }, warnings };
        }
        break;

      default:
        return { isValid: false, errors: { general: 'Invalid step' }, warnings };
    }

    return { isValid: true, errors, warnings };
  } catch (error) {
    if (error instanceof z.ZodError) {
      error.errors.forEach((err) => {
        const path = err.path.join('.');
        errors[path] = err.message;
      });
    } else {
      errors.general = 'Validation error occurred';
    }

    return { isValid: false, errors, warnings };
  }
};

export const validateField = (field: string, value: any, step: number): string | null => {
  try {
    // Simple field validation based on common patterns
    if (!value && field.includes('required')) {
      return 'This field is required';
    }
    
    if (field.includes('email') && value) {
      const emailSchema = z.string().email();
      emailSchema.parse(value);
    }
    
    if (field.includes('password') && value) {
      if (value.length < 8) {
        return 'Password must be at least 8 characters';
      }
      if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
        return 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
      }
    }
    
    if (field.includes('phone') && value) {
      if (!/^[\+]?[1-9][\d]{0,15}$/.test(value.replace(/\s/g, ''))) {
        return 'Please enter a valid phone number';
      }
    }
    
    if (field.includes('website') && value) {
      if (!/^https?:\/\/.+/.test(value)) {
        return 'Please enter a valid URL (starting with http:// or https://)';
      }
    }
    
    return null;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.errors[0]?.message || 'Validation error';
    }
    return 'Validation error';
  }
};

export const validateAllSteps = (data: Partial<TraineeApplication>): FormValidation => {
  const allErrors: Record<string, string> = {};
  const allWarnings: Record<string, string> = {};

  for (let step = 1; step <= 4; step++) {
    const stepValidation = validateStep(step, data);
    Object.assign(allErrors, stepValidation.errors);
    Object.assign(allWarnings, stepValidation.warnings);
  }

  return {
    isValid: Object.keys(allErrors).length === 0,
    errors: allErrors,
    warnings: allWarnings,
  };
};

// Email validation utility
export const isValidEmail = (email: string): boolean => {
  return z.string().email().safeParse(email).success;
};

// Password strength validation
export const getPasswordStrength = (password: string): { score: number; feedback: string[] } => {
  const feedback: string[] = [];
  let score = 0;

  if (password.length >= 8) score += 1;
  else feedback.push('Use at least 8 characters');

  if (/[a-z]/.test(password)) score += 1;
  else feedback.push('Include lowercase letters');

  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push('Include uppercase letters');

  if (/\d/.test(password)) score += 1;
  else feedback.push('Include numbers');

  if (/[^a-zA-Z\d]/.test(password)) score += 1;
  else feedback.push('Include special characters');

  return { score, feedback };
};
