/**
 * TherapyBook Email Templates  -  type-safe registry of all transactional emails.
 *
 * Each template has:
 * - subject: string or function returning string
 * - getHtml: function producing branded HTML via emailShell()
 * - getText: function producing plain-text fallback
 */

import {
  emailShell, escapeHtml, infoBox, detailTable,
  APP_NAME, APP_URL, SUPPORT_EMAIL, C,
} from './shell';

// ============================================================
// AUTH TEMPLATES
// ============================================================

const VERIFY_EMAIL = {
  subject: `Verify your ${APP_NAME} account`,
  getHtml: (vars: { name: string; verifyUrl: string }) =>
    emailShell({
      title: 'Verify Your Email',
      previewText: 'Please verify your email to activate your account.',
      bodyHtml: `
        <p style="margin:0 0 12px">Hi ${escapeHtml(vars.name)},</p>
        <p style="margin:0 0 12px">Please verify your email address to activate your ${APP_NAME} account. This link expires in 24 hours.</p>
      `,
      ctaText: 'Verify Email',
      ctaUrl: vars.verifyUrl,
    }),
  getText: (vars: { name: string; verifyUrl: string }) =>
    `Hi ${vars.name},\n\nVerify your email: ${vars.verifyUrl}\n\nThis link expires in 24 hours.`,
};

const PASSWORD_RESET = {
  subject: `Reset your ${APP_NAME} password`,
  getHtml: (vars: { name: string; resetUrl: string }) =>
    emailShell({
      title: 'Reset Your Password',
      previewText: 'A password reset was requested for your account.',
      bodyHtml: `
        <p style="margin:0 0 12px">Hi ${escapeHtml(vars.name)},</p>
        <p style="margin:0 0 12px">We received a request to reset your password. Click below to choose a new one. This link expires in 1 hour.</p>
        <p style="margin:16px 0 0;font-size:12px;color:${C.textMuted}">If you did not request this, you can safely ignore this email.</p>
      `,
      ctaText: 'Reset Password',
      ctaUrl: vars.resetUrl,
    }),
  getText: (vars: { name: string; resetUrl: string }) =>
    `Hi ${vars.name},\n\nReset your password: ${vars.resetUrl}\n\nThis link expires in 1 hour. If you did not request this, ignore this email.`,
};

// ============================================================
// APPLICATION TEMPLATES
// ============================================================

const APPLICATION_RECEIVED = {
  subject: `Application Received  -  ${APP_NAME}`,
  getHtml: (vars: { name: string }) =>
    emailShell({
      title: 'Application Received',
      previewText: 'We received your trainee therapist application.',
      bodyHtml: `
        <p style="margin:0 0 12px">Hi ${escapeHtml(vars.name)},</p>
        <p style="margin:0 0 12px">Thank you for applying to the ${APP_NAME} trainee program. Weve received your application and will begin reviewing it shortly.</p>
        ${infoBox('<strong>What happens next?</strong><br>Our team reviews applications within 3 - 5 business days. You will receive an email when your status changes.')}
      `,
    }),
  getText: (vars: { name: string }) =>
    `Hi ${vars.name},\n\nWe received your ${APP_NAME} trainee application. We will review it within 3-5 business days.`,
};

const APPLICATION_UNDER_REVIEW = {
  subject: `Application Under Review  -  ${APP_NAME}`,
  getHtml: (vars: { name: string }) =>
    emailShell({
      title: 'Application Under Review',
      previewText: 'Your application is being actively reviewed.',
      bodyHtml: `
        <p style="margin:0 0 12px">Hi ${escapeHtml(vars.name)},</p>
        <p style="margin:0 0 12px">Your ${APP_NAME} trainee application is now being actively reviewed by our team. We will notify you once a decision has been made.</p>
      `,
    }),
  getText: (vars: { name: string }) =>
    `Hi ${vars.name},\n\nYour application is now under active review. We will notify you when a decision is made.`,
};

const APPLICATION_APPROVED = {
  subject: `Welcome to ${APP_NAME}  -  Application Approved!`,
  getHtml: (vars: { name: string }) =>
    emailShell({
      title: 'Application Approved!',
      previewText: 'Your application has been approved. Set up your profile.',
      bodyHtml: `
        <p style="margin:0 0 12px">Hi ${escapeHtml(vars.name)},</p>
        <p style="margin:0 0 12px">Congratulations! Your trainee therapist application has been approved. You can now sign in, set your availability, and start accepting bookings.</p>
        ${infoBox('<strong>Next steps:</strong><br>1. Sign in to your practitioner workspace<br>2. Set your weekly availability<br>3. Clients can start booking with you', 'success')}
      `,
      ctaText: 'Go to Your Workspace',
      ctaUrl: `${APP_URL}/auth/signin`,
    }),
  getText: (vars: { name: string }) =>
    `Hi ${vars.name},\n\nYour application has been approved! Sign in to set your availability and start accepting bookings.\n\n${APP_URL}/auth/signin`,
};

const APPLICATION_REJECTED = {
  subject: `${APP_NAME} Application Update`,
  getHtml: (vars: { name: string }) =>
    emailShell({
      title: 'Application Update',
      previewText: 'We have an update about your application.',
      bodyHtml: `
        <p style="margin:0 0 12px">Hi ${escapeHtml(vars.name)},</p>
        <p style="margin:0 0 12px">After careful review, were unable to approve your application at this time. This may be due to incomplete documentation or credential requirements.</p>
        <p style="margin:0 0 12px">If you believe this was in error or would like to reapply, please contact us at <a href="mailto:${SUPPORT_EMAIL}" style="color:${C.primary}">${SUPPORT_EMAIL}</a>.</p>
      `,
    }),
  getText: (vars: { name: string }) =>
    `Hi ${vars.name},\n\nWe are unable to approve your application at this time. Contact ${SUPPORT_EMAIL} for more information.`,
};

// ============================================================
// BOOKING / SESSION TEMPLATES
// ============================================================

const BOOKING_CONFIRMED = {
  subject: `Session Confirmed  -  ${APP_NAME}`,
  getHtml: (vars: { clientName: string; therapistName: string; date: string; time: string; duration: number; sessionType: string; location?: string; sessionUrl: string }) =>
    emailShell({
      title: 'Session Confirmed',
      previewText: `Your session with ${vars.therapistName} is confirmed.`,
      bodyHtml: `
        <p style="margin:0 0 12px">Hi ${escapeHtml(vars.clientName)},</p>
        <p style="margin:0 0 12px">Your therapy session has been confirmed.</p>
        ${detailTable([
          ['Therapist', vars.therapistName],
          ['Date', vars.date],
          ['Time', vars.time],
          ['Duration', `${vars.duration} minutes`],
          ['Type', vars.sessionType === 'IN_PERSON' ? 'In Person' : 'Online Video'],
          ...(vars.sessionType === 'IN_PERSON' && vars.location ? [['Location', vars.location] as [string, string]] : []),
        ])}
        ${vars.sessionType === 'ONLINE'
          ? infoBox('The video room opens 15 minutes before your session. You will receive a reminder email beforehand.')
          : infoBox(`Please arrive at the practice location 5 minutes before your session.${vars.location ? '<br><strong>' + escapeHtml(vars.location) + '</strong>' : ''}`)}
      `,
      ctaText: vars.sessionType === 'ONLINE' ? 'View Session' : 'View Details',
      ctaUrl: vars.sessionUrl,
    }),
  getText: (vars: { clientName: string; therapistName: string; date: string; time: string; duration: number; sessionType: string }) =>
    `Hi ${vars.clientName},\n\nSession confirmed with ${vars.therapistName} on ${vars.date} at ${vars.time} (${vars.duration} min, ${vars.sessionType === 'ONLINE' ? 'Online' : 'In Person'}).`,
};

const SESSION_BOOKED_THERAPIST = {
  subject: `New Session Booked  -  ${APP_NAME}`,
  getHtml: (vars: { therapistName: string; clientName: string; date: string; time: string; duration: number; sessionType: string; sessionUrl: string }) =>
    emailShell({
      title: 'New Session Booked',
      previewText: `${vars.clientName} has booked a session with you.`,
      bodyHtml: `
        <p style="margin:0 0 12px">Hi ${escapeHtml(vars.therapistName)},</p>
        <p style="margin:0 0 12px">A new session has been booked with you.</p>
        ${detailTable([
          ['Client', vars.clientName],
          ['Date', vars.date],
          ['Time', vars.time],
          ['Duration', `${vars.duration} minutes`],
          ['Type', vars.sessionType === 'IN_PERSON' ? 'In Person' : 'Online Video'],
        ])}
      `,
      ctaText: 'View in Workspace',
      ctaUrl: vars.sessionUrl,
    }),
  getText: (vars: { therapistName: string; clientName: string; date: string; time: string }) =>
    `Hi ${vars.therapistName},\n\n${vars.clientName} booked a session on ${vars.date} at ${vars.time}.`,
};

const SESSION_CANCELLED = {
  subject: `Session Cancelled  -  ${APP_NAME}`,
  getHtml: (vars: { recipientName: string; otherPartyName: string; date: string; reason: string }) =>
    emailShell({
      title: 'Session Cancelled',
      previewText: `A session with ${vars.otherPartyName} has been cancelled.`,
      bodyHtml: `
        <p style="margin:0 0 12px">Hi ${escapeHtml(vars.recipientName)},</p>
        <p style="margin:0 0 12px">A session with ${escapeHtml(vars.otherPartyName)} on ${escapeHtml(vars.date)} has been cancelled.</p>
        ${vars.reason ? infoBox(`<strong>Reason:</strong> ${escapeHtml(vars.reason)}`) : ''}
        <p style="margin:12px 0 0;font-size:13px;color:${C.textMuted}">If a refund is applicable, it will be processed automatically. You can book a new session anytime.</p>
      `,
      ctaText: 'Book New Session',
      ctaUrl: `${APP_URL}/booking`,
    }),
  getText: (vars: { recipientName: string; otherPartyName: string; date: string; reason: string }) =>
    `Hi ${vars.recipientName},\n\nSession with ${vars.otherPartyName} on ${vars.date} was cancelled. Reason: ${vars.reason}`,
};

const SESSION_RESCHEDULED = {
  subject: `Session Rescheduled  -  ${APP_NAME}`,
  getHtml: (vars: { recipientName: string; otherPartyName: string; oldDate: string; newDate: string; newTime: string; sessionUrl: string }) =>
    emailShell({
      title: 'Session Rescheduled',
      previewText: `Your session has been moved to ${vars.newDate}.`,
      bodyHtml: `
        <p style="margin:0 0 12px">Hi ${escapeHtml(vars.recipientName)},</p>
        <p style="margin:0 0 12px">Your session with ${escapeHtml(vars.otherPartyName)} has been rescheduled.</p>
        ${detailTable([
          ['Previous', vars.oldDate],
          ['New Date', vars.newDate],
          ['New Time', vars.newTime],
        ])}
        <p style="margin:12px 0 0;font-size:13px;color:${C.textMuted}">You will receive updated reminders before the new session time.</p>
      `,
      ctaText: 'View Session',
      ctaUrl: vars.sessionUrl,
    }),
  getText: (vars: { recipientName: string; otherPartyName: string; oldDate: string; newDate: string; newTime: string }) =>
    `Hi ${vars.recipientName},\n\nSession rescheduled from ${vars.oldDate} to ${vars.newDate} at ${vars.newTime}.`,
};

const SESSION_REMINDER = {
  subject: (vars: { hoursUntil: number }) =>
    `Session Reminder  -  ${vars.hoursUntil}h until your appointment`,
  getHtml: (vars: { recipientName: string; otherPartyName: string; sessionTime: string; hoursUntil: number; sessionType: string; sessionUrl: string }) =>
    emailShell({
      title: `Session in ${vars.hoursUntil} Hour${vars.hoursUntil !== 1 ? 's' : ''}`,
      previewText: `Your session is in ${vars.hoursUntil} hour${vars.hoursUntil !== 1 ? 's' : ''}.`,
      bodyHtml: `
        <p style="margin:0 0 12px">Hi ${escapeHtml(vars.recipientName)},</p>
        <p style="margin:0 0 12px">This is a reminder that you have a therapy session coming up.</p>
        ${detailTable([
          ['With', vars.otherPartyName],
          ['Time', vars.sessionTime],
          ['Type', vars.sessionType === 'IN_PERSON' ? 'In Person' : 'Online Video'],
        ])}
        ${vars.sessionType === 'ONLINE'
          ? `<p style="margin:12px 0 0;font-size:13px;color:${C.textMuted}">Please join a few minutes early to test your connection.</p>`
          : `<p style="margin:12px 0 0;font-size:13px;color:${C.textMuted}">Please arrive at the practice location 5 minutes early.</p>`}
      `,
      ctaText: vars.sessionType === 'ONLINE' ? 'Join Session' : 'View Details',
      ctaUrl: vars.sessionUrl,
    }),
  getText: (vars: { recipientName: string; otherPartyName: string; sessionTime: string; hoursUntil: number }) =>
    `Hi ${vars.recipientName},\n\nReminder: session with ${vars.otherPartyName} at ${vars.sessionTime} (in ${vars.hoursUntil}h).`,
};

// ============================================================
// ADMIN TEMPLATES
// ============================================================

const ADMIN_NEW_APPLICATION = {
  subject: `New Trainee Application  -  ${APP_NAME}`,
  getHtml: (vars: { applicantName: string; applicationId: string }) =>
    emailShell({
      title: 'New Trainee Application',
      previewText: `${vars.applicantName} submitted a trainee application.`,
      bodyHtml: `
        <p style="margin:0 0 12px">${escapeHtml(vars.applicantName)} has submitted a new trainee therapist application for review.</p>
      `,
      ctaText: 'Review Application',
      ctaUrl: `${APP_URL}/admin/applications/${vars.applicationId}`,
    }),
  getText: (vars: { applicantName: string; applicationId: string }) =>
    `${vars.applicantName} submitted a new application. Review: ${APP_URL}/admin/applications/${vars.applicationId}`,
};

// ============================================================
// EXPORT REGISTRY
// ============================================================

export const EMAIL_TEMPLATES = {
  VERIFY_EMAIL,
  PASSWORD_RESET,
  APPLICATION_RECEIVED,
  APPLICATION_UNDER_REVIEW,
  APPLICATION_APPROVED,
  APPLICATION_REJECTED,
  BOOKING_CONFIRMED,
  SESSION_BOOKED_THERAPIST,
  SESSION_CANCELLED,
  SESSION_RESCHEDULED,
  SESSION_REMINDER,
  ADMIN_NEW_APPLICATION,
} as const;

export type EmailTemplateKey = keyof typeof EMAIL_TEMPLATES;
