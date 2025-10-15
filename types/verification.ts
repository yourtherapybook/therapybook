export interface VerificationBadge {
  id: string;
  providerId: string;
  tier: 'basic' | 'enhanced' | 'premium';
  status: 'pending' | 'in_review' | 'verified' | 'rejected' | 'expired';
  issuedDate?: Date;
  expiryDate?: Date;
  verifiedBy: string;
  verificationNotes?: string;
  requirements: VerificationRequirement[];
  credibilityScore: number; // 1-100 based on verification completeness
}

export interface VerificationRequirement {
  id: string;
  type: 'license' | 'certification' | 'education' | 'insurance' | 'background_check' | 'reference' | 'portfolio' | 'supervision';
  title: string;
  status: 'pending' | 'verified' | 'rejected' | 'not_required';
  documentUrl?: string;
  verificationUrl?: string;
  issuer: string;
  issueDate?: Date;
  expiryDate?: Date;
  verificationDate?: Date;
  verifiedBy?: string;
  notes?: string;
  priority: 'mandatory' | 'optional' | 'recommended';
}

export interface InstitutionalAffiliation {
  id: string;
  providerId: string;
  institutionName: string;
  institutionType: 'university' | 'hospital' | 'clinic' | 'research_center' | 'professional_association' | 'training_institute';
  affiliationType: 'faculty' | 'alumni' | 'staff' | 'member' | 'fellow' | 'resident' | 'intern' | 'student' | 'supervisor';
  position?: string;
  department?: string;
  startDate?: Date;
  endDate?: Date;
  isActive: boolean;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  verificationUrl?: string;
  credibilityScore: number; // 1-10 based on institution prestige
  logoUrl?: string;
  description?: string;
}

export interface ProviderProfile {
  id: string;
  userId: string;
  
  // Basic Information (Mandatory)
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  profilePhoto?: string;
  
  // Professional Information (Mandatory)
  currentEducationLevel: 'bachelor' | 'master' | 'doctorate' | 'postdoc';
  specializations: string[];
  languages: string[];
  yearsInTraining: number;
  
  // Verification Status
  verificationBadges: VerificationBadge[];
  overallVerificationTier: 'basic' | 'enhanced' | 'premium' | 'unverified';
  
  // Profile Sections
  bio: string;
  education: EducationRecord[];
  certifications: CertificationRecord[];
  institutionalAffiliations: InstitutionalAffiliation[];
  supervisors: SupervisorRecord[];
  
  // Optional Sections
  awards?: AwardRecord[];
  publications?: PublicationRecord[];
  presentations?: PresentationRecord[];
  volunteerWork?: VolunteerRecord[];
  
  // Metadata
  profileCompleteness: number; // 0-100%
  lastUpdated: Date;
  isPublic: boolean;
  isActive: boolean;
  trustScore: number; // Calculated based on verifications and affiliations
}

export interface EducationRecord {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: Date;
  endDate?: Date;
  isCompleted: boolean;
  gpa?: number;
  honors?: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  documentUrl?: string;
  credibilityScore: number; // Based on institution ranking
}

export interface CertificationRecord {
  id: string;
  name: string;
  issuer: string;
  issueDate: Date;
  expiryDate?: Date;
  credentialId?: string;
  verificationUrl?: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  documentUrl?: string;
  type: 'professional' | 'training' | 'specialty' | 'continuing_education';
}

export interface SupervisorRecord {
  id: string;
  name: string;
  credentials: string;
  institution: string;
  email: string;
  phone?: string;
  supervisionType: 'clinical' | 'academic' | 'research';
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  licenseNumber?: string;
  supervisorBadge?: VerificationBadge;
}

export interface AwardRecord {
  id: string;
  title: string;
  issuer: string;
  date: Date;
  description?: string;
  category: 'academic' | 'professional' | 'research' | 'service';
  verificationStatus: 'pending' | 'verified' | 'rejected';
  credibilityScore: number;
}

export interface PublicationRecord {
  id: string;
  title: string;
  authors: string[];
  journal: string;
  publicationDate: Date;
  doi?: string;
  url?: string;
  type: 'journal' | 'conference' | 'book' | 'chapter';
  verificationStatus: 'pending' | 'verified' | 'rejected';
  citationCount?: number;
}

export interface PresentationRecord {
  id: string;
  title: string;
  event: string;
  date: Date;
  location: string;
  type: 'oral' | 'poster' | 'keynote' | 'workshop';
  verificationStatus: 'pending' | 'verified' | 'rejected';
}

export interface VolunteerRecord {
  id: string;
  organization: string;
  role: string;
  startDate: Date;
  endDate?: Date;
  description?: string;
  hoursPerWeek?: number;
  verificationStatus: 'pending' | 'verified' | 'rejected';
}

// Verification System Configuration
export interface VerificationTierConfig {
  tier: 'basic' | 'enhanced' | 'premium';
  displayName: string;
  description: string;
  color: string;
  icon: string;
  requirements: {
    mandatory: VerificationRequirementConfig[];
    optional: VerificationRequirementConfig[];
  };
  benefits: string[];
  processingTime: string; // e.g., "3-5 business days"
  cost?: number; // in euros
  renewalPeriod?: number; // in months
  minimumCredibilityScore: number;
}

export interface VerificationRequirementConfig {
  type: string;
  title: string;
  description: string;
  acceptedDocuments: string[];
  verificationMethod: 'automatic' | 'manual' | 'third_party';
  processingTime: string;
  weight: number; // For credibility score calculation
}

// API Response Types
export interface VerificationResponse {
  success: boolean;
  message: string;
  verificationId?: string;
  estimatedCompletionDate?: Date;
  nextSteps?: string[];
  requiredDocuments?: string[];
}

export interface VerificationStatusResponse {
  verificationId: string;
  status: 'pending' | 'in_review' | 'verified' | 'rejected';
  progress: number; // 0-100%
  completedRequirements: string[];
  pendingRequirements: string[];
  rejectedRequirements: string[];
  estimatedCompletionDate?: Date;
  notes?: string;
  credibilityScore: number;
}

// Institution Credibility Database
export interface InstitutionCredibility {
  id: string;
  name: string;
  type: 'university' | 'hospital' | 'clinic' | 'research_center' | 'professional_association';
  country: string;
  credibilityScore: number; // 1-10
  ranking?: number;
  accreditation: string[];
  verificationUrl?: string;
  logoUrl?: string;
  lastUpdated: Date;
}

// Verification Workflow States
export type VerificationWorkflowState = 
  | 'application_submitted'
  | 'documents_uploaded'
  | 'initial_review'
  | 'document_verification'
  | 'reference_check'
  | 'final_review'
  | 'approved'
  | 'rejected'
  | 'requires_additional_info';

export interface VerificationWorkflow {
  id: string;
  providerId: string;
  tier: 'basic' | 'enhanced' | 'premium';
  currentState: VerificationWorkflowState;
  stateHistory: {
    state: VerificationWorkflowState;
    timestamp: Date;
    notes?: string;
    reviewedBy?: string;
  }[];
  assignedReviewer?: string;
  priority: 'low' | 'medium' | 'high';
  estimatedCompletionDate: Date;
  actualCompletionDate?: Date;
}