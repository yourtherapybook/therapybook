/**
 * TherapyBook Analytics — lightweight event tracking layer.
 *
 * Events are logged to console in development. In production, swap the
 * `dispatch` function to send to PostHog, Mixpanel, GA4, or any provider.
 *
 * Usage:
 *   import { track } from '@/lib/analytics';
 *   track('booking_started', { therapistId: '...', source: 'directory' });
 */

type EventProperties = Record<string, string | number | boolean | null | undefined>;

function dispatch(event: string, properties?: EventProperties) {
  if (typeof window === 'undefined') return;

  // Development: console log
  if (process.env.NODE_ENV === 'development') {
    console.log(`[analytics] ${event}`, properties || {});
  }

  // Production: send to your analytics provider
  // Example PostHog:
  //   if (window.posthog) window.posthog.capture(event, properties);
  // Example GA4:
  //   if (window.gtag) window.gtag('event', event, properties);
}

// ---- Funnel Events ----

export function track(event: string, properties?: EventProperties) {
  dispatch(event, properties);
}

// Visitor funnel
export const analytics = {
  // Landing
  pageView: (page: string) => dispatch('page_view', { page }),
  heroCtaClicked: (cta: string) => dispatch('hero_cta_clicked', { cta }),

  // Directory
  directoryViewed: () => dispatch('directory_viewed'),
  directorySearched: (query: string) => dispatch('directory_searched', { query }),
  directoryFiltered: (filterType: string, value: string) => dispatch('directory_filtered', { filterType, value }),
  providerCardViewed: (therapistId: string) => dispatch('provider_card_viewed', { therapistId }),
  providerDetailViewed: (therapistId: string) => dispatch('provider_detail_viewed', { therapistId }),

  // Matching
  matchingStarted: () => dispatch('matching_started'),
  matchingCompleted: (matchCount: number) => dispatch('matching_completed', { matchCount }),
  matchSelected: (therapistId: string, rank: number) => dispatch('match_selected', { therapistId, rank }),

  // Booking
  bookingStarted: (therapistId: string, source: string) => dispatch('booking_started', { therapistId, source }),
  dateSelected: (therapistId: string, date: string) => dispatch('booking_date_selected', { therapistId, date }),
  slotSelected: (therapistId: string, datetime: string) => dispatch('booking_slot_selected', { therapistId, datetime }),
  checkoutStarted: (therapistId: string, amount: number) => dispatch('checkout_started', { therapistId, amount }),
  checkoutCompleted: (sessionId: string, amount: number) => dispatch('checkout_completed', { sessionId, amount }),
  checkoutAbandoned: (therapistId: string) => dispatch('checkout_abandoned', { therapistId }),

  // Session
  sessionJoined: (sessionId: string, role: string) => dispatch('session_joined', { sessionId, role }),
  sessionCancelled: (sessionId: string, hoursBeforeSession: number) => dispatch('session_cancelled', { sessionId, hoursBeforeSession }),
  sessionRescheduled: (sessionId: string) => dispatch('session_rescheduled', { sessionId }),
  sessionRated: (sessionId: string, rating: number) => dispatch('session_rated', { sessionId, rating }),

  // Auth
  signUpStarted: (source: string) => dispatch('signup_started', { source }),
  signUpCompleted: () => dispatch('signup_completed'),
  signInCompleted: (role: string) => dispatch('signin_completed', { role }),

  // Trainee supply
  applicationStarted: () => dispatch('application_started'),
  applicationStepCompleted: (step: number) => dispatch('application_step_completed', { step }),
  applicationSubmitted: () => dispatch('application_submitted'),
  applicationApproved: () => dispatch('application_approved'),

  // Admin ops
  applicationReviewed: (decision: string) => dispatch('admin_application_reviewed', { decision }),
  documentVerified: (documentId: string) => dispatch('admin_document_verified', { documentId }),
  sessionStatusChanged: (sessionId: string, newStatus: string) => dispatch('admin_session_status_changed', { sessionId, newStatus }),
};
