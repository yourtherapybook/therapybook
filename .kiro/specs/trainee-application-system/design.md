# Trainee Application System - Design Document

## Overview

The Trainee Application System is a comprehensive multi-step form application designed to onboard trainee therapists to the TherapyBook platform. The system emphasizes user experience, accessibility, and seamless integration with modern web services while maintaining data integrity and security.

## Current Platform Assessment & Integration Context

### Existing TherapyBook Platform Analysis

Based on comprehensive code review, the current TherapyBook platform has:

**✅ Strong Foundations:**
- Well-structured React/TypeScript application with clean component architecture
- Comprehensive UI/UX implementation using Tailwind CSS
- Detailed type definitions and business logic
- Professional design system with consistent branding
- Responsive layout working across devices
- Comprehensive feature set covering user journey from discovery to sessions

**⚠️ Critical Issues to Address:**
- **50 TypeScript compilation errors** preventing builds
- Missing backend API integration
- Incomplete authentication system (localStorage-based)
- Mock payment processing without real gateway integration
- No database connectivity or persistent storage
- Missing session scheduling and management system

**📋 Existing Features That Trainee Application Must Integrate With:**
- Landing page with hero, process, testimonials
- Therapist directory with filtering and search
- Matching questionnaire system
- Booking flow with payment integration (needs completion)
- Video session interface (UI only)
- Authentication system (needs backend)
- Pricing calculator
- Emergency contact system
- Verification badge system

**🔗 Integration Requirements:**
The Trainee Application System must seamlessly integrate with:
1. **Existing Authentication Flow**: Extend current `useAuth` hook and login modal
2. **Therapist Directory**: Populate directory with approved trainee applications
3. **Matching System**: Include trainee profiles in matching algorithm
4. **Booking System**: Enable clients to book sessions with trainees
5. **Verification System**: Leverage existing verification badge components
6. **Payment System**: Integrate with planned payment processing improvements

### Technical Debt & Prerequisites

**Before implementing Trainee Application System:**
1. **Fix TypeScript compilation errors** (50+ errors blocking builds)
2. **Implement backend API infrastructure** (currently missing)
3. **Add secure authentication system** (replace localStorage approach)
4. **Integrate real payment processing** (currently mock implementation)
5. **Add database connectivity** (no persistent storage currently)

**Platform Completion Priority:**
1. **Phase 1 (Critical)**: Fix build errors, basic backend API, secure auth
2. **Phase 2 (High)**: Payment integration, database setup, session scheduling
3. **Phase 3 (Medium)**: Trainee application system, advanced features

### Current Platform Architecture Assessment

**Existing Structure:**
```
src/
├── components/
│   ├── Auth/           ✅ LoginModal (needs backend integration)
│   ├── Common/         ✅ BookingButton, EmergencyContact, etc.
│   ├── LandingPage/    ✅ Hero, Process, Testimonials
│   ├── Layout/         ✅ Header, Footer
│   ├── MatchingFlow/   ✅ Questionnaire, Results
│   ├── TherapistDirectory/ ✅ TherapistCard, FilterSidebar
│   ├── Verification/   ✅ Badge system (can be leveraged)
│   └── VideoSession/   ✅ VideoInterface (UI only)
├── pages/              ✅ All major pages implemented
├── hooks/              ⚠️ useAuth (localStorage-based, needs improvement)
├── types/              ✅ Comprehensive type definitions
└── utils/              ✅ Constants and utilities
```

**Integration Points for Trainee Application:**
- Extend existing authentication system
- Leverage verification badge components
- Integrate with therapist directory
- Connect to booking flow
- Use existing design system and components

## Architecture

### Migration Strategy: Vite + React → Next.js

**Current State:** Vite + React with React Router DOM
**Target State:** Next.js full-stack application with API routes

**Migration Benefits:**
- ✅ **Single Deployment** - One app deployed to Vercel
- ✅ **Unified Codebase** - Frontend and backend in same repository
- ✅ **Built-in API Routes** - No separate backend server needed
- ✅ **Optimal Vercel Integration** - Made by the same company
- ✅ **Better SEO** - Server-side rendering for landing pages
- ✅ **Simplified Development** - One dev server, one build process

**Migration Approach:**
1. **Preserve Components** - 90% of existing React components can be reused
2. **Convert Routing** - React Router → Next.js file-based routing
3. **Add API Layer** - Create `pages/api/` for backend functionality
4. **Update Configuration** - Tailwind, TypeScript, ESLint for Next.js

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    EXISTING THERAPYBOOK PLATFORM                │
├─────────────────┬─────────────────┬─────────────────────────────┤
│   Frontend      │   Backend API   │   External Services         │
│   (React/Next)  │   (Next.js)     │                            │
│                 │   ⚠️ TO BUILD    │   ✅ PLANNED INTEGRATION    │
│ ✅ Landing      │                 │                            │
│ ✅ Directory    │ • Authentication│ • Resend (Email)           │
│ ✅ Matching     │ • User Management│ • UploadThing (Images)     │
│ ✅ Booking UI   │ • Session Mgmt  │ • Stripe/PayPal (Payment)  │
│ ✅ Video UI     │ • Payment API   │ • Database (PostgreSQL)    │
│ ⚠️ Auth (Local) │ • File Handling │ • Vercel (Deployment)      │
└─────────────────┴─────────────────┴─────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│              NEW: TRAINEE APPLICATION SYSTEM                    │
├─────────────────┬─────────────────┬─────────────────────────────┤
│ • Multi-step    │ • Application   │ • Integrates with existing │
│   Form (4 steps)│   Processing    │   services above           │
│ • Validation    │ • Email         │ • Extends current auth     │
│ • File Upload   │   Notifications │ • Populates therapist      │
│ • Progress Save │ • Data Storage  │   directory                │
│ • Integration   │ • Admin Review  │ • Connects to booking      │
│   with existing │   Interface     │   system                   │
└─────────────────┴─────────────────┴─────────────────────────────┘
```

### Next.js Project Structure

```
therapybook-nextjs/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── pages/
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...nextauth].ts (NextAuth.js)
│   │   ├── trainee/
│   │   │   ├── applications.ts (Prisma queries)
│   │   │   ├── [id].ts
│   │   │   └── submit.ts
│   │   ├── sessions/
│   │   │   ├── book.ts (Prisma transactions)
│   │   │   ├── cancel.ts
│   │   │   └── reschedule.ts
│   │   ├── payments/
│   │   │   ├── create-intent.ts
│   │   │   └── confirm.ts
│   │   ├── uploadthing.ts (UploadThing endpoint)
│   │   └── socket.ts (Socket.IO + WebRTC signaling)
│   ├── index.tsx (Landing)
│   ├── directory.tsx
│   ├── matching.tsx
│   ├── booking.tsx
│   ├── session.tsx
│   ├── pricing.tsx
│   ├── privacy-policy.tsx
│   ├── trainee-application.tsx
│   └── admin/
│       └── applications.tsx (TanStack Table)
├── components/
│   ├── ui/ (Shadcn/ui components)
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── form.tsx
│   │   ├── dialog.tsx
│   │   ├── table.tsx
│   │   ├── card.tsx
│   │   └── badge.tsx
│   ├── Layout/
│   │   ├── Header.tsx (using Shadcn/ui)
│   │   └── Footer.tsx
│   ├── Auth/
│   │   └── LoginModal.tsx (Shadcn/ui Dialog)
│   ├── TraineeApplication/
│   │   ├── ApplicationProvider.tsx
│   │   ├── ProgressIndicator.tsx (Shadcn/ui Progress)
│   │   ├── StepNavigation.tsx (Shadcn/ui Button)
│   │   └── Steps/
│   │       ├── Step1AccountInfo.tsx (Shadcn/ui Form)
│   │       ├── Step2OfficeLocation.tsx
│   │       ├── Step3PublicProfile.tsx
│   │       └── Step4Agreements.tsx
│   ├── Admin/
│   │   ├── ApplicationsTable.tsx (TanStack Table)
│   │   └── ApplicationDetail.tsx (Shadcn/ui)
│   └── Common/
│       ├── FormField.tsx (Shadcn/ui Input)
│       ├── MultiSelect.tsx (Shadcn/ui Select)
│       ├── ImageUpload.tsx (UploadThing + Shadcn/ui)
│       └── EmergencyContact.tsx
├── lib/
│   ├── prisma.ts (Prisma client)
│   ├── resend.ts (Email service)
│   ├── auth.ts (NextAuth.js config)
│   ├── webrtc.ts (WebRTC call manager)
│   ├── utils.ts (Shadcn/ui utilities)
│   └── validation.ts (Zod schemas)
├── hooks/
│   ├── useAuth.ts (NextAuth.js)
│   ├── useApplicationState.ts
│   └── useFormValidation.ts
├── types/
│   ├── index.ts (Prisma generated types)
│   ├── verification.ts
│   └── next-auth.d.ts (NextAuth.js types)
├── styles/
│   └── globals.css (Tailwind + Shadcn/ui)
├── components.json (Shadcn/ui config)
├── next.config.js
├── tailwind.config.js (Extended for Shadcn/ui)
├── tsconfig.json (Strict mode)
└── package.json
```

## Components and Interfaces

### Core Interfaces

```typescript
interface TraineeApplication {
  id: string;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected';
  currentStep: number;
  completedSteps: number[];
  createdAt: Date;
  updatedAt: Date;
  submittedAt?: Date;
  
  // Step 1: Account Information
  accountInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    password: string;
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
    title: 'Dr.' | 'Mr.' | 'Mrs.' | 'Ms.' | 'Mx.';
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
    profilePhotoUrl: string;
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

interface Referral {
  id: string;
  firstName: string;
  lastName: string;
  workEmail: string;
}

interface FormValidation {
  isValid: boolean;
  errors: Record<string, string>;
  warnings: Record<string, string>;
}

interface StepProps {
  data: Partial<TraineeApplication>;
  onUpdate: (data: Partial<TraineeApplication>) => void;
  onNext: () => void;
  onBack: () => void;
  validation: FormValidation;
}
```

### Application Context

```typescript
interface ApplicationContextType {
  application: Partial<TraineeApplication>;
  currentStep: number;
  isLoading: boolean;
  errors: Record<string, string>;
  
  // Actions
  updateApplication: (data: Partial<TraineeApplication>) => void;
  nextStep: () => void;
  previousStep: () => void;
  submitApplication: () => Promise<void>;
  saveProgress: () => Promise<void>;
  
  // Validation
  validateStep: (step: number) => FormValidation;
  validateField: (field: string, value: any) => string | null;
}
```

## Data Models

### Neon Database Integration

**Why Neon Database:**
- **Serverless PostgreSQL**: Perfect for Vercel deployments with automatic scaling
- **Branching**: Database branching for development, staging, and production
- **Connection Pooling**: Built-in connection pooling for optimal performance
- **Zero Downtime**: Automatic failover and high availability
- **Cost Effective**: Pay-per-use pricing model ideal for growing applications

**Neon Configuration:**
```typescript
// lib/neon.ts
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export { sql };
```

**Resend Email Integration:**
```typescript
// lib/resend.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export { resend };

// Email templates for trainee application
export const sendApplicationConfirmation = async (email: string, name: string) => {
  return await resend.emails.send({
    from: 'TherapyBook <yourtherapybook@gmail.com>',
    to: email,
    subject: 'Application Received - TherapyBook Trainee Program',
    html: `
      <h2>Thank you for your application, ${name}!</h2>
      <p>We've received your trainee application and will review it within 3-5 business days.</p>
      <p>You'll receive an email notification once your application status changes.</p>
    `
  });
};

export const sendApplicationStatusUpdate = async (
  email: string, 
  name: string, 
  status: 'approved' | 'rejected'
) => {
  const subject = status === 'approved' 
    ? 'Welcome to TherapyBook - Application Approved!' 
    : 'TherapyBook Application Update';
    
  const message = status === 'approved'
    ? `Congratulations ${name}! Your trainee application has been approved. You can now log in and start accepting clients.`
    : `Thank you for your interest, ${name}. Unfortunately, we cannot approve your application at this time. Please feel free to reapply in the future.`;

  return await resend.emails.send({
    from: 'TherapyBook <yourtherapybook@gmail.com>',
    to: email,
    subject,
    html: `<h2>${subject}</h2><p>${message}</p>`
  });
};

// === COMPLETE EMAIL NOTIFICATION SYSTEM ===

// 1. AUTHENTICATION & ACCOUNT MANAGEMENT
export const sendWelcomeEmail = async (email: string, name: string) => {
  return await resend.emails.send({
    from: 'TherapyBook <yourtherapybook@gmail.com>',
    to: email,
    subject: 'Welcome to TherapyBook - Your Mental Health Journey Starts Here',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #FF7F50;">Welcome to TherapyBook, ${name}!</h1>
        <p>Thank you for joining our community of mental health advocates.</p>
        <p>You can now:</p>
        <ul>
          <li>Browse our directory of qualified trainee therapists</li>
          <li>Take our matching assessment to find your perfect fit</li>
          <li>Book affordable therapy sessions starting at €30</li>
        </ul>
        <a href="https://therapybook.com/matching" style="background: #FF7F50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Find Your Therapist</a>
      </div>
    `
  });
};

export const sendPasswordResetEmail = async (email: string, resetToken: string) => {
  return await resend.emails.send({
    from: 'TherapyBook <yourtherapybook@gmail.com>',
    to: email,
    subject: 'Reset Your TherapyBook Password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset Request</h2>
        <p>You requested to reset your password. Click the link below to create a new password:</p>
        <a href="https://therapybook.com/reset-password?token=${resetToken}" style="background: #FF7F50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Reset Password</a>
        <p><small>This link expires in 1 hour. If you didn't request this, please ignore this email.</small></p>
      </div>
    `
  });
};

export const sendEmailVerification = async (email: string, verificationToken: string) => {
  return await resend.emails.send({
    from: 'TherapyBook <yourtherapybook@gmail.com>',
    to: email,
    subject: 'Verify Your TherapyBook Email Address',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Verify Your Email Address</h2>
        <p>Please click the link below to verify your email address and complete your registration:</p>
        <a href="https://therapybook.com/verify-email?token=${verificationToken}" style="background: #FF7F50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Verify Email</a>
        <p><small>This link expires in 24 hours.</small></p>
      </div>
    `
  });
};

// 2. TRAINEE APPLICATION PROCESS
export const sendApplicationSaved = async (email: string, name: string, step: number) => {
  return await resend.emails.send({
    from: 'TherapyBook <applications@therapybook.com>',
    to: email,
    subject: 'Application Progress Saved - TherapyBook Trainee Program',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Application Progress Saved</h2>
        <p>Hi ${name},</p>
        <p>Your trainee application progress has been saved at Step ${step} of 4.</p>
        <p>You can continue your application anytime by logging into your account.</p>
        <a href="https://therapybook.com/trainee-application" style="background: #FF7F50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Continue Application</a>
      </div>
    `
  });
};

export const sendApplicationReminder = async (email: string, name: string, daysLeft: number) => {
  return await resend.emails.send({
    from: 'TherapyBook <applications@therapybook.com>',
    to: email,
    subject: 'Complete Your Trainee Application - TherapyBook',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Don't Forget to Complete Your Application</h2>
        <p>Hi ${name},</p>
        <p>You started your trainee application but haven't finished it yet. You have ${daysLeft} days left to complete it.</p>
        <p>Join our mission to make mental health care accessible and affordable!</p>
        <a href="https://therapybook.com/trainee-application" style="background: #FF7F50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Complete Application</a>
      </div>
    `
  });
};

export const sendApplicationUnderReview = async (email: string, name: string) => {
  return await resend.emails.send({
    from: 'TherapyBook <applications@therapybook.com>',
    to: email,
    subject: 'Application Under Review - TherapyBook Trainee Program',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Application Under Review</h2>
        <p>Hi ${name},</p>
        <p>Great news! Your trainee application is now under review by our team.</p>
        <p>We typically complete reviews within 3-5 business days. We'll notify you as soon as we have an update.</p>
        <p>Thank you for your patience and for wanting to join our mission!</p>
      </div>
    `
  });
};

// 3. SESSION BOOKING & MANAGEMENT
export const sendBookingConfirmation = async (
  email: string, 
  clientName: string, 
  therapistName: string, 
  sessionDate: string, 
  sessionTime: string,
  meetingUrl: string
) => {
  return await resend.emails.send({
    from: 'TherapyBook <bookings@therapybook.com>',
    to: email,
    subject: 'Session Confirmed - TherapyBook',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Your Session is Confirmed!</h2>
        <p>Hi ${clientName},</p>
        <p>Your therapy session has been confirmed:</p>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Therapist:</strong> ${therapistName}</p>
          <p><strong>Date:</strong> ${sessionDate}</p>
          <p><strong>Time:</strong> ${sessionTime}</p>
          <p><strong>Duration:</strong> 50 minutes</p>
        </div>
        <a href="${meetingUrl}" style="background: #FF7F50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Join Session</a>
        <p><small>You'll receive a reminder 24 hours and 1 hour before your session.</small></p>
      </div>
    `
  });
};

export const sendSessionReminder = async (
  email: string, 
  clientName: string, 
  therapistName: string, 
  sessionTime: string,
  meetingUrl: string,
  hoursUntil: number
) => {
  return await resend.emails.send({
    from: 'TherapyBook <reminders@therapybook.com>',
    to: email,
    subject: `Session Reminder - ${hoursUntil}h until your appointment`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Session Reminder</h2>
        <p>Hi ${clientName},</p>
        <p>This is a reminder that you have a therapy session in ${hoursUntil} hour${hoursUntil > 1 ? 's' : ''}:</p>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Therapist:</strong> ${therapistName}</p>
          <p><strong>Time:</strong> ${sessionTime}</p>
        </div>
        <a href="${meetingUrl}" style="background: #FF7F50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Join Session</a>
      </div>
    `
  });
};

export const sendSessionCancellation = async (
  email: string, 
  clientName: string, 
  therapistName: string, 
  sessionDate: string,
  reason: string
) => {
  return await resend.emails.send({
    from: 'TherapyBook <bookings@therapybook.com>',
    to: email,
    subject: 'Session Cancelled - TherapyBook',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Session Cancelled</h2>
        <p>Hi ${clientName},</p>
        <p>Your session with ${therapistName} on ${sessionDate} has been cancelled.</p>
        <p><strong>Reason:</strong> ${reason}</p>
        <p>Your session credit has been restored to your account. You can book a new session anytime.</p>
        <a href="https://therapybook.com/booking" style="background: #FF7F50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Book New Session</a>
      </div>
    `
  });
};

export const sendSessionRescheduled = async (
  email: string, 
  clientName: string, 
  therapistName: string, 
  oldDate: string,
  newDate: string,
  newTime: string,
  meetingUrl: string
) => {
  return await resend.emails.send({
    from: 'TherapyBook <bookings@therapybook.com>',
    to: email,
    subject: 'Session Rescheduled - TherapyBook',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Session Rescheduled</h2>
        <p>Hi ${clientName},</p>
        <p>Your session with ${therapistName} has been rescheduled:</p>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Previous:</strong> ${oldDate}</p>
          <p><strong>New Date:</strong> ${newDate}</p>
          <p><strong>New Time:</strong> ${newTime}</p>
        </div>
        <a href="${meetingUrl}" style="background: #FF7F50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Join Session</a>
      </div>
    `
  });
};

// 4. PAYMENT & BILLING
export const sendPaymentConfirmation = async (
  email: string, 
  clientName: string, 
  amount: number, 
  sessionCount: number,
  receiptUrl: string
) => {
  return await resend.emails.send({
    from: 'TherapyBook <billing@therapybook.com>',
    to: email,
    subject: 'Payment Confirmed - TherapyBook',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Payment Confirmed</h2>
        <p>Hi ${clientName},</p>
        <p>Your payment has been successfully processed:</p>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Amount:</strong> €${amount}</p>
          <p><strong>Sessions:</strong> ${sessionCount}</p>
          <p><strong>Rate:</strong> €${Math.round(amount/sessionCount)}/session</p>
        </div>
        <a href="${receiptUrl}" style="background: #FF7F50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Download Receipt</a>
        <p>You can now book your sessions with any of our qualified trainee therapists.</p>
      </div>
    `
  });
};

export const sendPaymentFailed = async (email: string, clientName: string, amount: number) => {
  return await resend.emails.send({
    from: 'TherapyBook <billing@therapybook.com>',
    to: email,
    subject: 'Payment Failed - TherapyBook',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Payment Failed</h2>
        <p>Hi ${clientName},</p>
        <p>We were unable to process your payment of €${amount}. This could be due to:</p>
        <ul>
          <li>Insufficient funds</li>
          <li>Expired card</li>
          <li>Bank security restrictions</li>
        </ul>
        <p>Please try again or use a different payment method.</p>
        <a href="https://therapybook.com/booking" style="background: #FF7F50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Try Again</a>
      </div>
    `
  });
};

// 5. THERAPIST NOTIFICATIONS
export const sendNewClientInquiry = async (
  therapistEmail: string, 
  therapistName: string, 
  clientName: string,
  inquiryMessage: string
) => {
  return await resend.emails.send({
    from: 'TherapyBook <clients@therapybook.com>',
    to: therapistEmail,
    subject: 'New Client Inquiry - TherapyBook',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>New Client Inquiry</h2>
        <p>Hi ${therapistName},</p>
        <p>You have a new client inquiry from ${clientName}:</p>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><em>"${inquiryMessage}"</em></p>
        </div>
        <p>Please respond within 4 business days as per your agreement.</p>
        <a href="https://therapybook.com/dashboard/inquiries" style="background: #FF7F50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Respond to Inquiry</a>
      </div>
    `
  });
};

export const sendSessionBooked = async (
  therapistEmail: string, 
  therapistName: string, 
  clientName: string,
  sessionDate: string,
  sessionTime: string,
  meetingUrl: string
) => {
  return await resend.emails.send({
    from: 'TherapyBook <sessions@therapybook.com>',
    to: therapistEmail,
    subject: 'New Session Booked - TherapyBook',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>New Session Booked</h2>
        <p>Hi ${therapistName},</p>
        <p>A new session has been booked with you:</p>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Client:</strong> ${clientName}</p>
          <p><strong>Date:</strong> ${sessionDate}</p>
          <p><strong>Time:</strong> ${sessionTime}</p>
          <p><strong>Duration:</strong> 50 minutes</p>
        </div>
        <a href="${meetingUrl}" style="background: #FF7F50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Join Session</a>
      </div>
    `
  });
};

// 6. SYSTEM & EMERGENCY NOTIFICATIONS
export const sendEmergencyAlert = async (email: string, userName: string) => {
  return await resend.emails.send({
    from: 'TherapyBook <emergency@therapybook.com>',
    to: email,
    subject: 'URGENT: Emergency Resources - TherapyBook',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 3px solid #dc2626;">
        <div style="background: #dc2626; color: white; padding: 20px;">
          <h1>EMERGENCY RESOURCES</h1>
        </div>
        <div style="padding: 20px;">
          <p>Hi ${userName},</p>
          <p><strong>If you are in immediate danger, please call emergency services:</strong></p>
          <div style="background: #fee2e2; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Germany Emergency: 112</strong></p>
            <p><strong>Crisis Hotline: 08001110111</strong></p>
            <p><strong>Mental Health Crisis: 08001110222</strong></p>
          </div>
          <p>These resources are available 24/7. Please reach out for help.</p>
        </div>
      </div>
    `
  });
};

export const sendMaintenanceNotification = async (email: string, userName: string, maintenanceDate: string) => {
  return await resend.emails.send({
    from: 'TherapyBook <system@therapybook.com>',
    to: email,
    subject: 'Scheduled Maintenance - TherapyBook',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Scheduled Maintenance Notice</h2>
        <p>Hi ${userName},</p>
        <p>We'll be performing scheduled maintenance on ${maintenanceDate} from 2:00 AM to 4:00 AM CET.</p>
        <p>During this time, TherapyBook will be temporarily unavailable. All scheduled sessions will not be affected.</p>
        <p>Thank you for your understanding.</p>
      </div>
    `
  });
};
```

**Modern Tech Stack Integration:**

**Core Technologies:**
- **Next.js 14** - Full-stack React framework with App Router
- **Prisma ORM** - Type-safe database client with Neon PostgreSQL
- **Shadcn/ui** - Modern component library built on Radix UI + Tailwind
- **TanStack Table** - Powerful data tables for admin interfaces
- **WebRTC + SSE** - Real-time video/audio communication with Server-Sent Events
- **TypeScript** - Strict type checking throughout the application

**Environment Variables:**
```bash
# .env.local
DATABASE_URL=postgresql://neondb_owner:npg_DRObf83iVjGt@ep-little-firefly-agaes5oz-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require
RESEND_API_KEY=re_a5WKCgpL_AXnGqWTKW239SJPEsLZtHqFP
UPLOADTHING_SECRET=your_uploadthing_secret
UPLOADTHING_APP_ID=your_uploadthing_app_id
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
SOCKET_IO_SECRET=your_socket_secret
WEBRTC_STUN_SERVER=stun:stun.l.google.com:19302
WEBRTC_TURN_SERVER=your_turn_server_url
WEBRTC_TURN_USERNAME=your_turn_username
WEBRTC_TURN_CREDENTIAL=your_turn_password
UPSTASH_REDIS_REST_URL=your_upstash_redis_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token
```

**Prisma Configuration:**
```typescript
// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

**Shadcn/ui Integration:**
```typescript
// components/ui/button.tsx (example)
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// Preserving existing TherapyBook design system
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background",
  {
    variants: {
      variant: {
        default: "bg-primary-500 text-white hover:bg-primary-600", // Using existing primary colors
        destructive: "bg-red-500 text-white hover:bg-red-600",
        outline: "border-2 border-neutral-200 hover:bg-neutral-50 hover:border-neutral-300",
        secondary: "bg-neutral-100 text-neutral-900 hover:bg-neutral-200",
        ghost: "hover:bg-neutral-100 hover:text-neutral-900",
        link: "underline-offset-4 hover:underline text-primary-600",
      },
      size: {
        default: "h-10 py-2 px-4",
        sm: "h-9 px-3 rounded-md",
        lg: "h-11 px-8 rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)
```

**WebRTC with Server-Sent Events (Vercel-Optimized):**
```typescript
// lib/webrtc-sse.ts
import SimplePeer from 'simple-peer';

interface WebRTCConfig {
  iceServers: RTCIceServer[];
}

interface SignalMessage {
  type: 'signal' | 'user-joined' | 'user-left' | 'chat';
  from: string;
  to: string;
  data: any;
  timestamp: number;
}

export class VideoCallManager {
  private peer: SimplePeer.Instance | null = null;
  private eventSource: EventSource | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor(private sessionId: string, private userId: string) {
    this.initializeSSE();
  }

  private initializeSSE() {
    // Connect to Server-Sent Events stream
    this.eventSource = new EventSource(
      `/api/webrtc/events/${this.sessionId}?userId=${this.userId}`
    );

    this.eventSource.onmessage = (event) => {
      try {
        const message: SignalMessage = JSON.parse(event.data);
        this.handleSignalMessage(message);
      } catch (error) {
        console.error('Error parsing SSE message:', error);
      }
    };

    this.eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);
      this.handleSSEReconnection();
    };

    this.eventSource.onopen = () => {
      console.log('SSE connection established');
      this.reconnectAttempts = 0;
    };
  }

  private handleSSEReconnection() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        console.log(`Reconnecting SSE (attempt ${this.reconnectAttempts})`);
        this.eventSource?.close();
        this.initializeSSE();
      }, 1000 * this.reconnectAttempts);
    } else {
      console.error('Max SSE reconnection attempts reached');
      this.onConnectionError?.('Failed to maintain real-time connection');
    }
  }

  async initializeCall(isInitiator: boolean): Promise<MediaStream> {
    // Get user media (camera + microphone)
    this.localStream = await navigator.mediaDevices.getUserMedia({
      video: { 
        width: { ideal: 1280 }, 
        height: { ideal: 720 },
        frameRate: { ideal: 30 }
      },
      audio: { 
        echoCancellation: true, 
        noiseSuppression: true,
        autoGainControl: true
      }
    });

    // Configure WebRTC with STUN/TURN servers
    const config: WebRTCConfig = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        {
          urls: process.env.NEXT_PUBLIC_WEBRTC_TURN_SERVER || '',
          username: process.env.NEXT_PUBLIC_WEBRTC_TURN_USERNAME || '',
          credential: process.env.NEXT_PUBLIC_WEBRTC_TURN_CREDENTIAL || ''
        }
      ]
    };

    // Create peer connection
    this.peer = new SimplePeer({
      initiator: isInitiator,
      trickle: false,
      stream: this.localStream,
      config
    });

    this.setupPeerEvents();
    
    // Notify other users that we've joined
    await this.sendSignal({
      type: 'user-joined',
      from: this.userId,
      to: 'all',
      data: { userId: this.userId },
      timestamp: Date.now()
    });

    return this.localStream;
  }

  private setupPeerEvents() {
    if (!this.peer) return;

    this.peer.on('signal', async (data) => {
      await this.sendSignal({
        type: 'signal',
        from: this.userId,
        to: 'peer',
        data,
        timestamp: Date.now()
      });
    });

    this.peer.on('stream', (stream) => {
      this.remoteStream = stream;
      this.onRemoteStream?.(stream);
    });

    this.peer.on('connect', () => {
      console.log('WebRTC connection established');
      this.onConnectionEstablished?.();
    });

    this.peer.on('error', (error) => {
      console.error('WebRTC Error:', error);
      this.onError?.(error);
    });

    this.peer.on('close', () => {
      console.log('WebRTC connection closed');
      this.onConnectionClosed?.();
    });
  }

  private async sendSignal(message: SignalMessage) {
    try {
      const response = await fetch('/api/webrtc/signal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: this.sessionId,
          message
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error sending signal:', error);
      // Implement retry logic or fallback
      this.onSignalError?.(error as Error);
    }
  }

  private handleSignalMessage(message: SignalMessage) {
    // Ignore messages from ourselves
    if (message.from === this.userId) return;

    switch (message.type) {
      case 'signal':
        if (this.peer) {
          this.peer.signal(message.data);
        }
        break;
      case 'user-joined':
        this.onUserJoined?.(message.data.userId);
        break;
      case 'user-left':
        this.onUserLeft?.(message.data.userId);
        break;
      case 'chat':
        this.onChatMessage?.(message.data);
        break;
    }
  }

  // Event handlers (to be set by components)
  onRemoteStream?: (stream: MediaStream) => void;
  onConnectionEstablished?: () => void;
  onConnectionClosed?: () => void;
  onConnectionError?: (error: string) => void;
  onError?: (error: Error) => void;
  onSignalError?: (error: Error) => void;
  onUserJoined?: (userId: string) => void;
  onUserLeft?: (userId: string) => void;
  onChatMessage?: (message: any) => void;

  // Media controls
  toggleVideo(): boolean {
    if (!this.localStream) return false;
    const videoTrack = this.localStream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      return videoTrack.enabled;
    }
    return false;
  }

  toggleAudio(): boolean {
    if (!this.localStream) return false;
    const audioTrack = this.localStream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      return audioTrack.enabled;
    }
    return false;
  }

  async startScreenShare(): Promise<MediaStream | null> {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: 'always' },
        audio: true
      });
      
      if (this.peer && this.localStream) {
        // Replace video track with screen share
        const videoTrack = screenStream.getVideoTracks()[0];
        const sender = (this.peer as any)._pc.getSenders().find((s: RTCRtpSender) => 
          s.track && s.track.kind === 'video'
        );
        if (sender) {
          await sender.replaceTrack(videoTrack);
        }

        // Handle screen share end
        videoTrack.onended = () => {
          this.stopScreenShare();
        };
      }
      
      return screenStream;
    } catch (error) {
      console.error('Screen share error:', error);
      return null;
    }
  }

  async stopScreenShare() {
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (videoTrack && this.peer) {
        const sender = (this.peer as any)._pc.getSenders().find((s: RTCRtpSender) => 
          s.track && s.track.kind === 'video'
        );
        if (sender) {
          await sender.replaceTrack(videoTrack);
        }
      }
    }
  }

  async sendChatMessage(message: string) {
    await this.sendSignal({
      type: 'chat',
      from: this.userId,
      to: 'all',
      data: { message, timestamp: Date.now() },
      timestamp: Date.now()
    });
  }

  getConnectionStats(): Promise<RTCStatsReport | null> {
    if (this.peer && (this.peer as any)._pc) {
      return (this.peer as any)._pc.getStats();
    }
    return Promise.resolve(null);
  }

  async endCall() {
    // Notify other users we're leaving
    await this.sendSignal({
      type: 'user-left',
      from: this.userId,
      to: 'all',
      data: { userId: this.userId },
      timestamp: Date.now()
    });

    // Clean up resources
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
    }
    if (this.peer) {
      this.peer.destroy();
    }
    if (this.eventSource) {
      this.eventSource.close();
    }
  }
}

// API Endpoints for SSE-based signaling

// pages/api/webrtc/events/[sessionId].ts - Server-Sent Events stream
import { NextApiRequest, NextApiResponse } from 'next';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { sessionId } = req.query;
  const { userId } = req.query;

  if (!sessionId || !userId) {
    return res.status(400).json({ error: 'Missing sessionId or userId' });
  }

  // Set up SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control',
  });

  // Send initial connection confirmation
  res.write(`data: ${JSON.stringify({ type: 'connected', userId })}\n\n`);

  // Set up Redis subscription for this session
  const channelName = `webrtc:${sessionId}`;
  let lastMessageId = 0;

  // Polling mechanism (since Vercel doesn't support long-running connections)
  const pollInterval = setInterval(async () => {
    try {
      // Get new messages from Redis
      const messages = await redis.lrange(channelName, lastMessageId, -1);
      
      for (const message of messages) {
        if (message) {
          const parsedMessage = JSON.parse(message as string);
          // Don't send messages back to the sender
          if (parsedMessage.from !== userId) {
            res.write(`data: ${message}\n\n`);
          }
        }
        lastMessageId++;
      }
    } catch (error) {
      console.error('Error polling messages:', error);
    }
  }, 1000); // Poll every second

  // Clean up on client disconnect
  req.on('close', () => {
    clearInterval(pollInterval);
    res.end();
  });

  // Keep connection alive
  const keepAlive = setInterval(() => {
    res.write(': heartbeat\n\n');
  }, 30000);

  req.on('close', () => {
    clearInterval(keepAlive);
  });
}

// pages/api/webrtc/signal.ts - HTTP endpoint for sending signals
import { NextApiRequest, NextApiResponse } from 'next';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { sessionId, message } = req.body;

  if (!sessionId || !message) {
    return res.status(400).json({ error: 'Missing sessionId or message' });
  }

  try {
    // Store message in Redis for the session
    const channelName = `webrtc:${sessionId}`;
    await redis.lpush(channelName, JSON.stringify(message));
    
    // Set expiration for the channel (24 hours)
    await redis.expire(channelName, 86400);

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error storing signal:', error);
    res.status(500).json({ error: 'Failed to store signal' });
  }
}
```

**Resend Email Integration:**
```typescript
// lib/resend.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export { resend };

// === COMPLETE EMAIL NOTIFICATION SYSTEM ===
// All emails originate from: yourtherapybook@gmail.com

// 1. AUTHENTICATION & ACCOUNT MANAGEMENT
export const sendWelcomeEmail = async (email: string, name: string) => {
  return await resend.emails.send({
    from: 'TherapyBook <yourtherapybook@gmail.com>',
    to: email,
    subject: 'Welcome to TherapyBook - Your Mental Health Journey Starts Here',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #FF7F50;">Welcome to TherapyBook, ${name}!</h1>
        <p>Thank you for joining our community of mental health advocates.</p>
        <p>You can now:</p>
        <ul>
          <li>Browse our directory of qualified trainee therapists</li>
          <li>Take our matching assessment to find your perfect fit</li>
          <li>Book affordable therapy sessions starting at €30</li>
        </ul>
        <a href="https://therapybook.com/matching" style="background: #FF7F50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Find Your Therapist</a>
      </div>
    `
  });
};

export const sendPasswordResetEmail = async (email: string, resetToken: string) => {
  return await resend.emails.send({
    from: 'TherapyBook <yourtherapybook@gmail.com>',
    to: email,
    subject: 'Reset Your TherapyBook Password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset Request</h2>
        <p>You requested to reset your password. Click the link below to create a new password:</p>
        <a href="https://therapybook.com/reset-password?token=${resetToken}" style="background: #FF7F50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Reset Password</a>
        <p><small>This link expires in 1 hour. If you didn't request this, please ignore this email.</small></p>
      </div>
    `
  });
};

// 2. TRAINEE APPLICATION PROCESS
export const sendApplicationConfirmation = async (email: string, name: string) => {
  return await resend.emails.send({
    from: 'TherapyBook <yourtherapybook@gmail.com>',
    to: email,
    subject: 'Application Received - TherapyBook Trainee Program',
    html: `
      <h2>Thank you for your application, ${name}!</h2>
      <p>We've received your trainee application and will review it within 3-5 business days.</p>
      <p>You'll receive an email notification once your application status changes.</p>
    `
  });
};

export const sendApplicationStatusUpdate = async (
  email: string, 
  name: string, 
  status: 'approved' | 'rejected'
) => {
  const subject = status === 'approved' 
    ? 'Welcome to TherapyBook - Application Approved!' 
    : 'TherapyBook Application Update';
    
  const message = status === 'approved'
    ? `Congratulations ${name}! Your trainee application has been approved. You can now log in and start accepting clients.`
    : `Thank you for your interest, ${name}. Unfortunately, we cannot approve your application at this time. Please feel free to reapply in the future.`;

  return await resend.emails.send({
    from: 'TherapyBook <yourtherapybook@gmail.com>',
    to: email,
    subject,
    html: `<h2>${subject}</h2><p>${message}</p>`
  });
};

// 3. SESSION BOOKING & MANAGEMENT
export const sendBookingConfirmation = async (
  email: string, 
  clientName: string, 
  therapistName: string, 
  sessionDate: string, 
  sessionTime: string,
  meetingUrl: string
) => {
  return await resend.emails.send({
    from: 'TherapyBook <yourtherapybook@gmail.com>',
    to: email,
    subject: 'Session Confirmed - TherapyBook',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Your Session is Confirmed!</h2>
        <p>Hi ${clientName},</p>
        <p>Your therapy session has been confirmed:</p>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Therapist:</strong> ${therapistName}</p>
          <p><strong>Date:</strong> ${sessionDate}</p>
          <p><strong>Time:</strong> ${sessionTime}</p>
          <p><strong>Duration:</strong> 50 minutes</p>
        </div>
        <a href="${meetingUrl}" style="background: #FF7F50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Join Session</a>
        <p><small>You'll receive a reminder 24 hours and 1 hour before your session.</small></p>
      </div>
    `
  });
};

// 4. PAYMENT & BILLING
export const sendPaymentConfirmation = async (
  email: string, 
  clientName: string, 
  amount: number, 
  sessionCount: number,
  receiptUrl: string
) => {
  return await resend.emails.send({
    from: 'TherapyBook <yourtherapybook@gmail.com>',
    to: email,
    subject: 'Payment Confirmed - TherapyBook',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Payment Confirmed</h2>
        <p>Hi ${clientName},</p>
        <p>Your payment has been successfully processed:</p>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Amount:</strong> €${amount}</p>
          <p><strong>Sessions:</strong> ${sessionCount}</p>
          <p><strong>Rate:</strong> €${Math.round(amount/sessionCount)}/session</p>
        </div>
        <a href="${receiptUrl}" style="background: #FF7F50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Download Receipt</a>
        <p>You can now book your sessions with any of our qualified trainee therapists.</p>
      </div>
    `
  });
};

// 5. EMERGENCY NOTIFICATIONS
export const sendEmergencyAlert = async (email: string, userName: string) => {
  return await resend.emails.send({
    from: 'TherapyBook <yourtherapybook@gmail.com>',
    to: email,
    subject: 'URGENT: Emergency Resources - TherapyBook',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 3px solid #dc2626;">
        <div style="background: #dc2626; color: white; padding: 20px;">
          <h1>EMERGENCY RESOURCES</h1>
        </div>
        <div style="padding: 20px;">
          <p>Hi ${userName},</p>
          <p><strong>If you are in immediate danger, please call emergency services:</strong></p>
          <div style="background: #fee2e2; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Germany Emergency: 112</strong></p>
            <p><strong>Crisis Hotline: 08001110111</strong></p>
            <p><strong>Mental Health Crisis: 08001110222</strong></p>
          </div>
          <p>These resources are available 24/7. Please reach out for help.</p>
        </div>
      </div>
    `
  });
};
```

### Database Schema

```sql
-- Trainee Applications (Neon PostgreSQL)
CREATE TABLE trainee_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status VARCHAR(20) DEFAULT 'draft',
  current_step INTEGER DEFAULT 1,
  completed_steps INTEGER[] DEFAULT ARRAY[]::INTEGER[],
  
  -- Account Info
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  password_hash VARCHAR(255) NOT NULL,
  
  -- Office Location
  practice_name VARCHAR(200) NOT NULL,
  practice_website VARCHAR(255),
  office_phone VARCHAR(20),
  address_street VARCHAR(255) NOT NULL,
  address_line2 VARCHAR(255),
  address_city VARCHAR(100) NOT NULL,
  address_state_province VARCHAR(100) NOT NULL,
  address_zip_postal VARCHAR(20) NOT NULL,
  address_country VARCHAR(100) DEFAULT 'Germany',
  
  -- Public Profile
  title VARCHAR(10) NOT NULL,
  therapist_type VARCHAR(50) DEFAULT 'Student Intern / Trainee',
  institution_of_study VARCHAR(200) NOT NULL,
  skills_acquired TEXT[] NOT NULL,
  other_skills TEXT,
  specialties TEXT[] NOT NULL,
  treatment_orientation TEXT[] NOT NULL,
  modality TEXT[] NOT NULL,
  age_groups TEXT[] NOT NULL,
  languages TEXT[] NOT NULL,
  other_languages TEXT,
  ethnicities_served TEXT[],
  personal_statement TEXT NOT NULL,
  profile_photo_url VARCHAR(500) NOT NULL,
  
  -- Agreements
  motivation_statement TEXT NOT NULL,
  payment_agreement BOOLEAN DEFAULT FALSE,
  response_time_agreement BOOLEAN DEFAULT FALSE,
  minimum_client_commitment BOOLEAN DEFAULT FALSE,
  terms_of_service BOOLEAN DEFAULT FALSE,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  submitted_at TIMESTAMP,
  
  CONSTRAINT valid_status CHECK (status IN ('draft', 'submitted', 'under_review', 'approved', 'rejected')),
  CONSTRAINT valid_step CHECK (current_step BETWEEN 1 AND 4),
  CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Referrals
CREATE TABLE trainee_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES trainee_applications(id) ON DELETE CASCADE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  work_email VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Application Progress Tracking
CREATE TABLE application_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES trainee_applications(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  completed_at TIMESTAMP DEFAULT NOW(),
  data_snapshot JSONB,
  
  UNIQUE(application_id, step_number)
);
```

## Error Handling

### Validation Strategy

```typescript
// Field-level validation
const fieldValidators = {
  email: (value: string) => {
    if (!value) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Invalid email format';
    return null;
  },
  
  password: (value: string) => {
    if (!value) return 'Password is required';
    if (value.length < 8) return 'Password must be at least 8 characters';
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
      return 'Password must contain uppercase, lowercase, and number';
    }
    return null;
  },
  
  personalStatement: (value: string) => {
    if (!value) return 'Personal statement is required';
    if (value.length < 200) return 'Personal statement must be at least 200 characters';
    return null;
  },
  
  motivationStatement: (value: string) => {
    if (!value) return 'Motivation statement is required';
    if (value.length > 250) return 'Motivation statement must be 250 characters or less';
    return null;
  }
};

// Step-level validation
const stepValidators = {
  1: (data: Partial<TraineeApplication>) => {
    const errors: Record<string, string> = {};
    
    if (!data.accountInfo?.firstName) errors.firstName = 'First name is required';
    if (!data.accountInfo?.lastName) errors.lastName = 'Last name is required';
    
    const emailError = fieldValidators.email(data.accountInfo?.email || '');
    if (emailError) errors.email = emailError;
    
    const passwordError = fieldValidators.password(data.accountInfo?.password || '');
    if (passwordError) errors.password = passwordError;
    
    return { isValid: Object.keys(errors).length === 0, errors, warnings: {} };
  }
  // ... other step validators
};
```

### Error Recovery

```typescript
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ApplicationErrorBoundary extends Component<Props, ErrorBoundaryState> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to monitoring service
    console.error('Application Error:', error, errorInfo);
    
    // Save current form state before error
    const currentState = this.props.applicationState;
    localStorage.setItem('trainee-app-recovery', JSON.stringify(currentState));
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorRecoveryComponent 
          onRecover={() => this.setState({ hasError: false })}
          savedState={localStorage.getItem('trainee-app-recovery')}
        />
      );
    }

    return this.props.children;
  }
}
```

## Testing Strategy

### Unit Testing

```typescript
// Form validation tests
describe('TraineeApplication Validation', () => {
  test('should validate email format', () => {
    expect(fieldValidators.email('invalid-email')).toBe('Invalid email format');
    expect(fieldValidators.email('valid@email.com')).toBeNull();
  });

  test('should validate password strength', () => {
    expect(fieldValidators.password('weak')).toContain('Password must');
    expect(fieldValidators.password('StrongPass123')).toBeNull();
  });

  test('should validate personal statement length', () => {
    const shortStatement = 'Too short';
    const validStatement = 'A'.repeat(200);
    
    expect(fieldValidators.personalStatement(shortStatement)).toContain('at least 200');
    expect(fieldValidators.personalStatement(validStatement)).toBeNull();
  });
});

// Component integration tests
describe('Step Navigation', () => {
  test('should prevent navigation with invalid data', () => {
    const { getByText } = render(<Step1AccountInfo {...invalidProps} />);
    const nextButton = getByText('Next');
    
    fireEvent.click(nextButton);
    expect(mockOnNext).not.toHaveBeenCalled();
  });

  test('should allow navigation with valid data', () => {
    const { getByText } = render(<Step1AccountInfo {...validProps} />);
    const nextButton = getByText('Next');
    
    fireEvent.click(nextButton);
    expect(mockOnNext).toHaveBeenCalled();
  });
});
```

### Integration Testing

```typescript
// API integration tests
describe('Application Submission', () => {
  test('should submit complete application', async () => {
    const mockApplication = createMockApplication();
    
    const response = await submitTraineeApplication(mockApplication);
    
    expect(response.status).toBe('submitted');
    expect(response.id).toBeDefined();
  });

  test('should handle submission errors gracefully', async () => {
    const invalidApplication = createInvalidApplication();
    
    await expect(submitTraineeApplication(invalidApplication))
      .rejects.toThrow('Validation failed');
  });
});

// File upload integration
describe('Image Upload', () => {
  test('should upload profile photo via UploadThing', async () => {
    const mockFile = new File(['test'], 'profile.jpg', { type: 'image/jpeg' });
    
    const uploadResult = await uploadProfilePhoto(mockFile);
    
    expect(uploadResult.url).toMatch(/^https:\/\//);
    expect(uploadResult.success).toBe(true);
  });
});
```

### End-to-End Testing

```typescript
// E2E flow testing with Playwright
describe('Complete Application Flow', () => {
  test('should complete full application process', async ({ page }) => {
    await page.goto('/trainee-application');
    
    // Step 1: Account Information
    await page.fill('[data-testid="firstName"]', 'John');
    await page.fill('[data-testid="lastName"]', 'Doe');
    await page.fill('[data-testid="email"]', 'john.doe@example.com');
    await page.fill('[data-testid="password"]', 'SecurePass123');
    await page.fill('[data-testid="confirmPassword"]', 'SecurePass123');
    await page.click('[data-testid="next-button"]');
    
    // Step 2: Office Location
    await page.fill('[data-testid="practiceName"]', 'Test Practice');
    await page.fill('[data-testid="street"]', '123 Main St');
    await page.fill('[data-testid="city"]', 'Berlin');
    await page.fill('[data-testid="state"]', 'Berlin');
    await page.fill('[data-testid="zipCode"]', '10115');
    await page.click('[data-testid="next-button"]');
    
    // Step 3: Public Profile
    await page.selectOption('[data-testid="title"]', 'Ms.');
    await page.fill('[data-testid="institution"]', 'University of Berlin');
    await page.check('[data-testid="skill-cbt"]');
    await page.check('[data-testid="specialty-anxiety"]');
    await page.selectOption('[data-testid="treatment-cbt"]', 'CBT');
    await page.fill('[data-testid="personalStatement"]', 'A'.repeat(200));
    
    // Upload profile photo
    await page.setInputFiles('[data-testid="profilePhoto"]', 'test-profile.jpg');
    await page.click('[data-testid="next-button"]');
    
    // Step 4: Agreements
    await page.fill('[data-testid="motivationStatement"]', 'I want to help people');
    await page.check('[data-testid="paymentAgreement"]');
    await page.check('[data-testid="responseTimeAgreement"]');
    await page.check('[data-testid="minimumClientCommitment"]');
    await page.check('[data-testid="termsOfService"]');
    
    await page.click('[data-testid="submit-button"]');
    
    // Verify success
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
  });
});
```

## Performance Considerations

### Optimization Strategies

1. **Code Splitting**: Lazy load each step component
2. **Form State Management**: Use efficient state updates with useCallback
3. **Image Optimization**: Compress and resize profile photos
4. **Auto-save Debouncing**: Prevent excessive API calls
5. **Progressive Enhancement**: Core functionality works without JavaScript

### Monitoring and Analytics

```typescript
// Performance monitoring
const trackStepCompletion = (step: number, timeSpent: number) => {
  analytics.track('Application Step Completed', {
    step,
    timeSpent,
    timestamp: new Date().toISOString()
  });
};

// Error tracking
const trackApplicationError = (error: Error, context: string) => {
  errorTracking.captureException(error, {
    tags: { context },
    extra: { applicationStep: currentStep }
  });
};
```

## Platform Completion Roadmap

### Prerequisites (Must Complete Before Trainee Application)

**Phase 1: Critical Infrastructure (1-2 weeks)**
1. **Fix TypeScript Compilation Errors**
   - Remove unused React imports (50+ files)
   - Fix type mismatches in FilterSidebar.tsx
   - Remove JSX style syntax errors
   - Clean up unused variables and imports

2. **Implement Backend API Foundation**
   - Set up Next.js API routes
   - Database connection and schema
   - Basic CRUD operations
   - Authentication endpoints

3. **Secure Authentication System**
   - Replace localStorage with JWT tokens
   - Implement refresh token mechanism
   - Add password reset functionality
   - Session management

**Phase 2: Core Platform Features (2-3 weeks)**
1. **Payment Integration**
   - Stripe/PayPal integration
   - Secure payment processing
   - Transaction logging
   - Refund handling

2. **Session Management System**
   - Real scheduling functionality
   - Calendar integration
   - Booking confirmation
   - Cancellation/rescheduling

3. **Database Integration**
   - User profiles and sessions
   - Therapist availability
   - Payment records
   - Application data

**Phase 3: Trainee Application System (2-3 weeks)**
Only after Phases 1-2 are complete:
1. Multi-step application form
2. Integration with existing auth
3. Admin review interface
4. Email notifications via Resend
5. Profile photo upload via UploadThing

### Integration Strategy

**Leveraging Existing Components:**
- Extend `useAuth` hook for trainee authentication
- Use existing `LoginModal` component pattern
- Integrate with `VerificationBadgeSystem` components
- Utilize `TherapistCard` for displaying approved trainees
- Connect to existing `BookingButton` and booking flow

**Data Flow Integration:**
```
Trainee Application → Admin Review → Approval → 
Therapist Directory → Client Matching → Booking System → 
Video Sessions → Payment Processing
```

**Shared Services:**
- Authentication: Extend existing auth system
- File Upload: UploadThing for profile photos
- Email: Resend for notifications
- Database: Shared user and session tables
- Payment: Same Stripe integration for trainee payments

This design provides a comprehensive foundation for implementing the Trainee Application System that seamlessly integrates with the existing TherapyBook platform while addressing current technical debt and infrastructure needs.