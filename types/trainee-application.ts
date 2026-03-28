export interface TraineeApplication {
  id?: string;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected';
  currentStep: number;
  completedSteps: number[];
  createdAt?: Date;
  updatedAt?: Date;
  submittedAt?: Date;
  
  // Step 1: Account Information
  accountInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    password: string;
    confirmPassword: string;
    requiresPassword?: boolean;
  };
  
  // Step 2: Office Location
  officeLocation: {
    practiceName: string;
    practiceWebsite?: string;
    officePhone?: string;
    address: {
      street: string;
      addressLine2?: string;
      city: string;
      stateProvince: string;
      zipPostalCode: string;
      country: string;
    };
  };
  
  // Step 3: Public Profile
  publicProfile: {
    title: 'Dr.' | 'Mr.' | 'Mrs.' | 'Ms.' | 'Mx.' | '';
    therapistType: 'Student Intern / Trainee';
    institutionOfStudy: string;
    skillsAcquired: string[];
    otherSkills?: string;
    specialties: string[];
    treatmentOrientation: string[];
    modality: string[];
    ageGroups: string[];
    languages: string[];
    otherLanguages?: string;
    ethnicitiesServed: string[];
    personalStatement: string;
    profilePhotoUrl?: string;
  };
  
  // Step 4: Agreements
  agreements: {
    motivationStatement: string;
    paymentAgreement: boolean;
    responseTimeAgreement: boolean;
    minimumClientCommitment: boolean;
    termsOfService: boolean;
    referrals?: Referral[];
  };
}

export interface Referral {
  id: string;
  firstName: string;
  lastName: string;
  workEmail: string;
}

export interface FormValidation {
  isValid: boolean;
  errors: Record<string, string>;
  warnings: Record<string, string>;
}

export interface StepProps {
  data: Partial<TraineeApplication>;
  onUpdate: (data: Partial<TraineeApplication>) => void;
  onNext: () => void;
  onBack: () => void;
  validation: FormValidation;
}

export interface ApplicationContextType {
  application: Partial<TraineeApplication>;
  currentStep: number;
  isLoading: boolean;
  isSaving: boolean;
  errors: Record<string, string>;
  lastSaved?: Date;
  
  // Actions
  updateApplication: (data: Partial<TraineeApplication>) => void;
  nextStep: () => void;
  previousStep: () => void;
  goToStep: (step: number) => void;
  submitApplication: () => Promise<void>;
  saveProgress: () => Promise<void>;
  loadApplication: (id?: string) => Promise<void>;
  
  // Validation
  validateStep: (step: number) => FormValidation;
  validateField: (field: string, value: any) => string | null;
  validateAllSteps: () => FormValidation;
}

export interface ApplicationProviderProps {
  children: React.ReactNode;
  initialData?: Partial<TraineeApplication>;
  applicationId?: string;
}

// Default empty application data
export const createEmptyApplication = (): Partial<TraineeApplication> => ({
  status: 'draft',
  currentStep: 1,
  completedSteps: [],
  accountInfo: {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    requiresPassword: true,
  },
  officeLocation: {
    practiceName: '',
    practiceWebsite: '',
    officePhone: '',
    address: {
      street: '',
      addressLine2: '',
      city: '',
      stateProvince: '',
      zipPostalCode: '',
      country: 'US',
    },
  },
  publicProfile: {
    title: '',
    therapistType: 'Student Intern / Trainee',
    institutionOfStudy: '',
    skillsAcquired: [],
    otherSkills: '',
    specialties: [],
    treatmentOrientation: [],
    modality: [],
    ageGroups: [],
    languages: [],
    otherLanguages: '',
    ethnicitiesServed: [],
    personalStatement: '',
    profilePhotoUrl: '',
  },
  agreements: {
    motivationStatement: '',
    paymentAgreement: false,
    responseTimeAgreement: false,
    minimumClientCommitment: false,
    termsOfService: false,
    referrals: [],
  },
});
