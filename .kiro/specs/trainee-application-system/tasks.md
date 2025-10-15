# Implementation Plan

## Prerequisites Tasks (Must Complete Before Trainee Application)

### Phase 1: Next.js Migration and Infrastructure Setup

- [x] 1. Migrate from Vite + React to Next.js with modern tooling
  - Install Next.js and core dependencies: `npm install next react react-dom`
  - Install Shadcn/ui: `npx shadcn-ui@latest init` with existing Tailwind config
  - Install TanStack Table: `npm install @tanstack/react-table`
  - Install Prisma ORM: `npm install prisma @prisma/client` and `npx prisma init`
  - Create `next.config.js` preserving existing TypeScript and Tailwind configuration
  - Create `pages/` directory and migrate existing routes:
    - `src/pages/Landing.tsx` → `pages/index.tsx`
    - `src/pages/Directory.tsx` → `pages/directory.tsx`
    - `src/pages/Matching.tsx` → `pages/matching.tsx`
    - `src/pages/Booking.tsx` → `pages/booking.tsx`
    - `src/pages/VideoSession.tsx` → `pages/session.tsx`
    - `src/pages/Pricing.tsx` → `pages/pricing.tsx`
    - `src/pages/PrivacyPolicy.tsx` → `pages/privacy-policy.tsx`
    - `src/pages/TraineeApplication.tsx` → `pages/trainee-application.tsx`
  - Move `src/components/` to root level `components/`
  - Preserve existing Tailwind design system (primary colors, spacing, etc.)
  - Update all import paths to use relative imports from new structure
  - Remove React Router DOM dependencies and routing logic
  - Update TypeScript configuration for Next.js with strict mode
  - **Run `npm run type-check` and fix all TypeScript compilation errors**
  - _Requirements: 12.1, 12.5_

- [x] 2. Set up Prisma ORM and Next.js API routes with database integration
  - Configure Prisma schema (`prisma/schema.prisma`) for Neon PostgreSQL:
    - User model with authentication fields
    - TraineeApplication model with all form steps
    - Session model for booking management
    - Payment model for transaction tracking
  - Set up Neon Database URL in `.env.local` and `DATABASE_URL` in Prisma
  - Generate Prisma client: `npx prisma generate`
  - Create and run initial migration: `npx prisma migrate dev --name init`
  - Create `lib/prisma.ts` for database client singleton
  - Create `pages/api/` directory structure:
    - `pages/api/auth/` - Authentication endpoints using Prisma
    - `pages/api/users/` - User management with Prisma queries
    - `pages/api/trainee/` - Trainee application CRUD with Prisma
    - `pages/api/sessions/` - Session booking with Prisma transactions
    - `pages/api/payments/` - Payment processing with Prisma logging
  - Implement type-safe API endpoints using Prisma client
  - Add environment configuration for Neon, Resend, and UploadThing
  - Create API middleware for authentication and error handling
  - **Run `npm run type-check` and ensure all Prisma types are properly generated**
  - _Requirements: 12.1, 12.4_

- [x] 3. Set up Shadcn/ui components with existing TherapyBook design system
  - Initialize Shadcn/ui with existing Tailwind configuration: `npx shadcn-ui@latest init`
  - Configure `components.json` to preserve existing color scheme and design tokens
  - Install core Shadcn/ui components: Button, Input, Form, Dialog, Table, Card, Badge
  - Customize Shadcn/ui theme to match existing TherapyBook design:
    - Primary colors: `primary-500` (#FF7F50 coral orange)
    - Neutral colors: existing neutral palette
    - Border radius: existing `rounded-lg` (12px)
    - Font family: existing Inter font
  - Create custom component variants that extend Shadcn/ui with TherapyBook styling
  - Update existing components to use Shadcn/ui primitives where beneficial
  - **Run `npm run type-check` to ensure all Shadcn/ui components are properly typed**
  - _Requirements: 6.1, 6.2, 13.4_

- [x] 4. Replace localStorage authentication with secure JWT system
  - Install NextAuth.js: `npm install next-auth @next-auth/prisma-adapter`
  - Configure NextAuth.js with Prisma adapter for database sessions
  - Implement JWT token-based authentication with secure httpOnly cookies
  - Add refresh token mechanism and session management
  - Create secure login/logout API endpoints using NextAuth.js
  - Update useAuth hook to use NextAuth.js session management
  - Integrate with Prisma User model for authentication
  - **Run `npm run type-check` to ensure NextAuth.js types are properly configured**
  - _Requirements: 12.2_

### Phase 2: Core Platform Completion

- [x] 5. Update package.json with complete modern tech stack
  - Add all required dependencies:
    ```json
    {
      "dependencies": {
        "next": "^14.0.0",
        "react": "^18.2.0",
        "react-dom": "^18.2.0",
        "@prisma/client": "^5.0.0",
        "prisma": "^5.0.0",
        "next-auth": "^4.24.0",
        "@next-auth/prisma-adapter": "^1.0.7",
        "@tanstack/react-table": "^8.10.0",
        "@radix-ui/react-dialog": "^1.0.5",
        "@radix-ui/react-form": "^0.0.3",
        "class-variance-authority": "^0.7.0",
        "clsx": "^2.0.0",
        "tailwind-merge": "^2.0.0",
        "react-hook-form": "^7.47.0",
        "@hookform/resolvers": "^3.3.0",
        "zod": "^3.22.0",
        "resend": "^2.0.0",
        "uploadthing": "^6.0.0",
        "lucide-react": "^0.441.0",
        "simple-peer": "^9.11.1",
        "@upstash/redis": "^1.25.0"
      },
      "devDependencies": {
        "@types/node": "^20.0.0",
        "@types/react": "^18.2.0",
        "@types/react-dom": "^18.2.0",
        "@types/simple-peer": "^9.11.5",
        "typescript": "^5.2.0",
        "tailwindcss": "^3.3.0",
        "autoprefixer": "^10.4.0",
        "postcss": "^8.4.0",
        "eslint": "^8.50.0",
        "eslint-config-next": "^14.0.0"
      },
      "scripts": {
        "dev": "next dev",
        "build": "next build",
        "start": "next start",
        "lint": "next lint",
        "type-check": "tsc --noEmit",
        "db:generate": "prisma generate",
        "db:push": "prisma db push",
        "db:migrate": "prisma migrate dev",
        "db:studio": "prisma studio"
      }
    }
    ```
  - **Run `npm run type-check` after installation to ensure all dependencies are properly typed**
  - _Requirements: 12.1, 12.4_

- [ ] 6. Integrate real payment processing
  - Set up Stripe/PayPal integration
  - Replace mock payment handling in Booking.tsx
  - Implement secure payment endpoints
  - Add transaction logging and receipt generation
  - _Requirements: 12.3_

- [x] 5. Complete session scheduling system
  - Integrate SessionScheduler component with backend
  - Implement therapist availability management
  - Add booking confirmation and email notifications
  - Create cancellation and rescheduling functionality
  - _Requirements: 11.4_

## Trainee Application System Implementation

### Phase 3: Application Form Foundation

- [x] 6. Create trainee application routing and navigation
  - Add /trainee-application route to App.tsx
  - Create TraineeApplicationFlow main component
  - Implement step-based routing with URL state management
  - Add progress indicator component with step validation
  - _Requirements: 1.1, 1.3_

- [x] 7. Build application context and state management
  - Create ApplicationProvider context for form state
  - Implement useApplicationState hook for data management
  - Add auto-save functionality with debounced API calls
  - Create form validation utilities and error handling
  - _Requirements: 1.3, 9.2, 9.3_

- [x] 8. Develop Step 1: Account Information component with Shadcn/ui
  - Create Step1AccountInfo component using Shadcn/ui Form and Input components
  - Implement real-time validation using Zod schemas and react-hook-form
  - Add password strength indicator using Shadcn/ui Progress component
  - Integrate with NextAuth.js authentication system
  - Ensure responsive mobile-first layout following existing design patterns
  - Use existing TherapyBook color scheme and spacing in Shadcn/ui components
  - **Run `npm run type-check` to ensure all form types and validation schemas are correct**
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

### Phase 4: Location and Profile Steps

- [x] 9. Build Step 2: Office Location component
  - Create Step2OfficeLocation component with address form
  - Implement address validation and formatting
  - Add optional fields handling for website and office phone
  - Create reusable AddressForm component for future use
  - Add back/next navigation with data preservation
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

- [x] 10. Develop Step 3: Public Profile component
  - Create Step3PublicProfile component with comprehensive form
  - Implement multi-select components for specialties and skills
  - Add searchable dropdown for treatment orientations
  - Create dynamic "Other" field handling for custom entries
  - Integrate UploadThing for profile photo upload
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_

- [x] 11. Build profile photo upload functionality
  - Integrate UploadThing SDK for secure image uploads
  - Add image preview and crop functionality
  - Implement file validation (type, size, dimensions)
  - Create loading states and error handling for uploads
  - Add accessibility features for screen readers
  - _Requirements: 4.6, 8.2_

### Phase 5: Agreements and Submission

- [x] 12. Create Step 4: Agreements and Submission component
  - Build Step4Agreements component with all agreement checkboxes
  - Implement motivation statement textarea with character counter
  - Add collapsible referral section with dynamic colleague fields
  - Create terms of service modal with scrollable content
  - Implement final validation before submission
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

- [ ] 13. Implement dynamic referral system
  - Create ReferralForm component for colleague references
  - Add "Add Another Colleague" functionality with form arrays
  - Implement remove referral functionality
  - Add validation for email formats in referral fields
  - Create smooth animations for adding/removing entries
  - _Requirements: 5.4, 10.3, 10.4_

- [ ] 14. Build application submission and processing
  - Create application submission API endpoint
  - Implement complete form validation across all steps
  - Add application status tracking (draft, submitted, under_review)
  - Create success confirmation page with next steps
  - Integrate Resend for confirmation email notifications
  - _Requirements: 5.5, 8.1, 8.4_

### Phase 6: Integration with Existing Platform

- [ ] 15. Integrate with existing authentication system
  - Extend useAuth hook to handle trainee application state
  - Update LoginModal to support trainee login flow
  - Add trainee-specific user roles and permissions
  - Create seamless transition from application to platform access
  - _Requirements: 11.1, 13.1_

- [ ] 16. Connect to therapist directory system
  - Modify TherapistDirectory to include approved trainees
  - Update TherapistCard component for trainee-specific information
  - Integrate trainee profiles with existing filtering system
  - Add trainee badge/indicator to distinguish from licensed therapists
  - _Requirements: 11.1, 11.3, 13.3_

- [ ] 17. Integrate with matching algorithm
  - Update matching system to include trainee profiles
  - Modify Questionnaire component to consider trainee preferences
  - Update Results component to display trainee matches
  - Ensure trainee specialties and skills are included in matching logic
  - **Run `npm run type-check` to ensure matching algorithm types are correct**
  - _Requirements: 11.2, 13.3_

- [ ] 18. Implement WebRTC video calling system with SSE signaling
  - Create Server-Sent Events API endpoints for real-time signaling:
    - `pages/api/webrtc/events/[sessionId].ts` - SSE stream for signaling
    - `pages/api/webrtc/signal.ts` - HTTP POST for sending signals
    - `pages/api/webrtc/sessions.ts` - Session management
  - Set up Redis/Upstash for signaling message queue (Vercel-compatible)
  - Create WebRTC peer connection management utilities in `lib/webrtc-sse.ts`
  - Implement video call initiation and acceptance flow using HTTP + SSE
  - Add media stream management (camera, microphone, screen sharing)
  - Create call quality monitoring and connection status indicators
  - Implement graceful fallback for connection issues
  - **Run `npm run type-check` to ensure WebRTC and SSE types are properly configured**
  - _Requirements: Video session functionality_

- [ ] 19. Enhance VideoSession component with SSE-based WebRTC integration
  - Replace mock video interface with real WebRTC peer connections using SSE signaling
  - Implement camera and microphone controls with actual media streams
  - Add screen sharing functionality using WebRTC screen capture
  - Create connection quality indicators and network status monitoring
  - Implement call recording and session management
  - Add emergency disconnect and reconnection handling with HTTP polling fallback
  - Integrate chat functionality using SSE for real-time messages
  - Ensure responsive design and accessibility for video controls
  - Add automatic reconnection logic for SSE connection drops
  - **Run `npm run type-check` to ensure video component and SSE types are correct**
  - _Requirements: Video session real-time communication_

### Phase 7: Admin Interface and Review System

- [ ] 18. Create admin application review interface with TanStack Table
  - Install and configure Shadcn/ui Table components preserving existing design system
  - Build admin dashboard using TanStack Table for trainee applications listing
  - Create sortable, filterable, and paginated applications table
  - Implement application detail view with all submitted information using Shadcn/ui components
  - Add approve/reject functionality with status updates using Shadcn/ui Dialog and Form components
  - Create admin notes and feedback system with Shadcn/ui Textarea and Button components
  - Implement bulk actions for processing multiple applications using TanStack Table row selection
  - Ensure all components follow existing TherapyBook color scheme (primary-500, neutral colors)
  - **Run `npm run type-check` to ensure all TanStack Table types are properly configured**
  - _Requirements: 8.4, 11.1_

- [ ] 19. Implement application status notifications
  - Create email templates for application status updates
  - Integrate Resend for automated status change notifications
  - Add in-app notification system for status updates
  - Create trainee dashboard showing application progress
  - Implement reminder emails for incomplete applications
  - _Requirements: 8.1, 9.1_

### Phase 8: Advanced Features and Polish

- [ ] 20. Add comprehensive form validation and error handling
  - Implement field-level validation with real-time feedback
  - Create step-level validation preventing invalid progression
  - Add accessibility-compliant error announcements
  - Implement form recovery after browser crashes or network issues
  - Create validation summary component for error overview
  - _Requirements: 6.1, 6.2, 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 21. Implement responsive design and accessibility
  - Ensure mobile-first responsive design across all steps
  - Add keyboard navigation support for all interactive elements
  - Implement ARIA labels and screen reader compatibility
  - Create high contrast mode support
  - Add focus management for step transitions
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 22. Build progress tracking and auto-save system
  - Implement automatic form data saving every 30 seconds
  - Create progress recovery system for interrupted sessions
  - Add visual progress indicators with completion percentages
  - Implement session timeout warnings with data preservation
  - Create draft application management system
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

### Phase 9: Testing and Quality Assurance

- [ ] 23. Create comprehensive unit tests
  - Write tests for all form validation functions
  - Test multi-step navigation and data preservation
  - Create tests for file upload functionality
  - Test integration with existing authentication system
  - Add tests for error handling and recovery scenarios
  - _Requirements: All requirements validation_

- [ ] 24. Implement integration tests
  - Test complete application submission flow
  - Verify integration with Resend email service
  - Test UploadThing image upload integration
  - Validate database operations and data persistence
  - Test admin review and approval workflow
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [ ] 25. Conduct end-to-end testing
  - Test complete user journey from application start to approval
  - Verify responsive design across different devices
  - Test accessibility compliance with screen readers
  - Validate email notifications and status updates
  - Test error scenarios and recovery mechanisms
  - _Requirements: All requirements comprehensive testing_

### Phase 10: Deployment and Monitoring

- [ ] 26. Deploy Next.js application to Vercel with integrated services
  - Configure Vercel deployment settings for Next.js full-stack app
  - Set up Neon Database environment variables in Vercel dashboard
  - Configure automatic Vercel-Neon integration for seamless database access
  - Set up Resend and UploadThing environment variables in Vercel
  - Implement proper error logging and monitoring for API routes
  - Configure Vercel serverless functions for optimal performance
  - Set up automatic deployments from Git repository
  - _Requirements: 8.3_

- [ ] 27. Implement monitoring and analytics
  - Add application completion tracking and analytics
  - Implement error monitoring and alerting
  - Create admin dashboard for application metrics
  - Add performance monitoring for form interactions
  - Set up user feedback collection system
  - _Requirements: Platform monitoring and optimization_

This implementation plan provides a comprehensive roadmap for building the Trainee Application System while ensuring seamless integration with the existing TherapyBook platform. Each task builds incrementally on previous work and includes specific requirement references for traceability.