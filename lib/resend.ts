import { Resend } from 'resend';

const appUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
const bookingUrl = `${appUrl}/booking`;

export type TransactionalEmailPayload = {
  from: string;
  to: string | string[];
  subject: string;
  html: string;
};

let resendClient: Resend | null = null;

const getResendClient = () => {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error('RESEND_API_KEY is required to send email.');
  }

  if (!resendClient) {
    resendClient = new Resend(apiKey);
  }

  return resendClient;
};

export const sendTransactionalEmail = async (payload: TransactionalEmailPayload) => {
  return getResendClient().emails.send(payload);
};

export const sendVerificationEmail = async (email: string, token: string) => {
  const verificationUrl = `${appUrl}/auth/verify?token=${encodeURIComponent(token)}`;

  try {
    return await sendTransactionalEmail({
      from: 'TherapyBook <noreply@therapybook.com>',
      to: email,
      subject: 'Verify your TherapyBook account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #FF7F50;">Verify your email address</h2>
          <p>Welcome to TherapyBook.</p>
          <p>Please verify your email address to activate your account and continue with secure booking and onboarding.</p>
          <a href="${verificationUrl}" style="background: #FF7F50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0;">Verify Email</a>
          <p style="font-size: 12px; color: #666;">This link expires in 24 hours.</p>
        </div>
      `
    });
  } catch (error) {
    console.error('Email sending error:', error);
    throw error;
  }
};

export const sendPasswordReset = async (email: string, token: string) => {
  const resetUrl = `${appUrl}/auth/reset-password?token=${encodeURIComponent(token)}`;

  try {
    return await sendTransactionalEmail({
      from: 'TherapyBook <noreply@therapybook.com>',
      to: email,
      subject: 'Reset your TherapyBook password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #FF7F50;">Reset your password</h2>
          <p>We received a request to reset your TherapyBook password.</p>
          <a href="${resetUrl}" style="background: #FF7F50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0;">Choose New Password</a>
          <p style="font-size: 12px; color: #666;">This link expires in 1 hour. If you did not request it, you can ignore this email.</p>
        </div>
      `
    });
  } catch (error) {
    console.error('Email sending error:', error);
    throw error;
  }
};

// Email templates for trainee application
export const sendApplicationConfirmation = async (email: string, name: string) => {
  try {
    return await sendTransactionalEmail({
      from: 'TherapyBook <noreply@therapybook.com>',
      to: email,
      subject: 'Application Received - TherapyBook Trainee Program',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #FF7F50;">Thank you for your application, ${name}!</h2>
          <p>We've received your trainee application and will review it within 3-5 business days.</p>
          <p>You'll receive an email notification once your application status changes.</p>
          <p>Thank you for wanting to join our mission to make mental health care accessible and affordable!</p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
          <p style="font-size: 12px; color: #666;">
            TherapyBook - Making Mental Health Care Accessible<br>
            If you have any questions, please contact us at support@therapybook.com
          </p>
        </div>
      `
    });
  } catch (error) {
    console.error('Email sending error:', error);
    throw error;
  }
};

export const sendApplicationUnderReview = async (email: string, name: string) => {
  try {
    return await sendTransactionalEmail({
      from: 'TherapyBook <noreply@therapybook.com>',
      to: email,
      subject: 'Application Under Review - TherapyBook Trainee Program',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #FF7F50;">Application Under Review</h2>
          <p>Hi ${name},</p>
          <p>Great news! Your trainee application is now under review by our team.</p>
          <p>We typically complete reviews within 3-5 business days. We'll notify you as soon as we have an update.</p>
          <p>Thank you for your patience and for wanting to join our mission!</p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
          <p style="font-size: 12px; color: #666;">
            TherapyBook - Making Mental Health Care Accessible<br>
            If you have any questions, please contact us at applications@therapybook.com
          </p>
        </div>
      `
    });
  } catch (error) {
    console.error('Email sending error:', error);
    throw error;
  }
};

export const sendApplicationStatusUpdate = async (
  email: string,
  name: string,
  status: 'APPROVED' | 'REJECTED'
) => {
  const subject = status === 'APPROVED'
    ? 'Welcome to TherapyBook - Application Approved!'
    : 'TherapyBook Application Update';

  const message = status === 'APPROVED'
    ? `Congratulations ${name}! Your trainee application has been approved. You can now log in and start accepting clients.`
    : `Thank you for your interest, ${name}. Unfortunately, we cannot approve your application at this time. Please feel free to reapply in the future.`;

  const actionButton = status === 'APPROVED'
    ? `<a href="${appUrl}/auth/signin" style="background: #FF7F50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0;">Login to Your Account</a>`
    : '';

  try {
    return await sendTransactionalEmail({
      from: 'TherapyBook <noreply@therapybook.com>',
      to: email,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #FF7F50;">${subject}</h2>
          <p>${message}</p>
          ${actionButton}
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
          <p style="font-size: 12px; color: #666;">
            TherapyBook - Making Mental Health Care Accessible<br>
            If you have any questions, please contact us at applications@therapybook.com
          </p>
        </div>
      `
    });
  } catch (error) {
    console.error('Email sending error:', error);
    throw error;
  }
};

// Session booking notifications
export const sendBookingConfirmation = async (
  email: string,
  clientName: string,
  therapistName: string,
  sessionDate: string,
  sessionTime: string,
  meetingUrl: string
) => {
  try {
    return await sendTransactionalEmail({
      from: 'TherapyBook <noreply@therapybook.com>',
      to: email,
      subject: 'Session Confirmed - TherapyBook',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #FF7F50;">Your Session is Confirmed!</h2>
          <p>Hi ${clientName},</p>
          <p>Your therapy session has been confirmed:</p>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Therapist:</strong> ${therapistName}</p>
            <p><strong>Date:</strong> ${sessionDate}</p>
            <p><strong>Time:</strong> ${sessionTime}</p>
            <p><strong>Duration:</strong> 50 minutes</p>
          </div>
          <a href="${meetingUrl}" style="background: #FF7F50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Join Session</a>
          <p><small>You'll receive a reminder 24 hours and 1 hour before your session.</small></p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
          <p style="font-size: 12px; color: #666;">
            TherapyBook - Making Mental Health Care Accessible<br>
            If you need to cancel or reschedule, please do so at least 24 hours in advance.
          </p>
        </div>
      `
    });
  } catch (error) {
    console.error('Email sending error:', error);
    throw error;
  }
};

export const sendSessionBooked = async (
  therapistEmail: string,
  therapistName: string,
  clientName: string,
  sessionDate: string,
  sessionTime: string,
  meetingUrl: string
) => {
  try {
    return await sendTransactionalEmail({
      from: 'TherapyBook <noreply@therapybook.com>',
      to: therapistEmail,
      subject: 'New Session Booked - TherapyBook',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #FF7F50;">New Session Booked</h2>
          <p>Hi ${therapistName},</p>
          <p>A new session has been booked with you:</p>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Client:</strong> ${clientName}</p>
            <p><strong>Date:</strong> ${sessionDate}</p>
            <p><strong>Time:</strong> ${sessionTime}</p>
            <p><strong>Duration:</strong> 50 minutes</p>
          </div>
          <a href="${meetingUrl}" style="background: #FF7F50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Join Session</a>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
          <p style="font-size: 12px; color: #666;">
            TherapyBook - Making Mental Health Care Accessible<br>
            Please be prepared to join the session 5 minutes early.
          </p>
        </div>
      `
    });
  } catch (error) {
    console.error('Email sending error:', error);
    throw error;
  }
};

export const sendSessionCancellation = async (
  email: string,
  clientName: string,
  therapistName: string,
  sessionDate: string,
  reason: string
) => {
  try {
    return await sendTransactionalEmail({
      from: 'TherapyBook <noreply@therapybook.com>',
      to: email,
      subject: 'Session Cancelled - TherapyBook',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #FF7F50;">Session Cancelled</h2>
          <p>Hi ${clientName},</p>
          <p>Your session with ${therapistName} on ${sessionDate} has been cancelled.</p>
          <p><strong>Reason:</strong> ${reason}</p>
          <p>Your session credit has been restored to your account. You can book a new session anytime.</p>
          <a href="${bookingUrl}" style="background: #FF7F50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Book New Session</a>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
          <p style="font-size: 12px; color: #666;">
            TherapyBook - Making Mental Health Care Accessible<br>
            If you have any questions, please contact us at support@therapybook.com
          </p>
        </div>
      `
    });
  } catch (error) {
    console.error('Email sending error:', error);
    throw error;
  }
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
  try {
    return await sendTransactionalEmail({
      from: 'TherapyBook <noreply@therapybook.com>',
      to: email,
      subject: 'Session Rescheduled - TherapyBook',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #FF7F50;">Session Rescheduled</h2>
          <p>Hi ${clientName},</p>
          <p>Your session with ${therapistName} has been rescheduled:</p>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Previous:</strong> ${oldDate}</p>
            <p><strong>New Date:</strong> ${newDate}</p>
            <p><strong>New Time:</strong> ${newTime}</p>
          </div>
          <a href="${meetingUrl}" style="background: #FF7F50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Join Session</a>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
          <p style="font-size: 12px; color: #666;">
            TherapyBook - Making Mental Health Care Accessible<br>
            You'll receive a reminder 24 hours and 1 hour before your new session time.
          </p>
        </div>
      `
    });
  } catch (error) {
    console.error('Email sending error:', error);
    throw error;
  }
};

export const sendSessionReminder = async (
  email: string,
  clientName: string,
  therapistName: string,
  sessionTime: string,
  meetingUrl: string,
  hoursUntil: number
) => {
  try {
    return await sendTransactionalEmail({
      from: 'TherapyBook <noreply@therapybook.com>',
      to: email,
      subject: `Session Reminder - ${hoursUntil}h until your appointment`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #FF7F50;">Session Reminder</h2>
          <p>Hi ${clientName},</p>
          <p>This is a reminder that you have a therapy session in ${hoursUntil} hour${hoursUntil > 1 ? 's' : ''}:</p>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Therapist:</strong> ${therapistName}</p>
            <p><strong>Time:</strong> ${sessionTime}</p>
          </div>
          <a href="${meetingUrl}" style="background: #FF7F50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Join Session</a>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
          <p style="font-size: 12px; color: #666;">
            TherapyBook - Making Mental Health Care Accessible<br>
            Please join the session a few minutes early to test your connection.
          </p>
        </div>
      `
    });
  } catch (error) {
    console.error('Email sending error:', error);
    throw error;
  }
};

export const sendAdminApplicationAlert = async (applicantName: string, applicationId: string) => {
  try {
    const adminEmail = process.env.ADMIN_ALERT_EMAIL || 'admin@therapybook.com';

    return await sendTransactionalEmail({
      from: 'TherapyBook System <noreply@therapybook.com>',
      to: adminEmail,
      subject: `Action Required: New Trainee Application (${applicantName})`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2F3E46;">New Application Submitted</h2>
          <p><strong>${applicantName}</strong> has just submitted a trainee application.</p>
          <p>Please review and explicitly approve or reject the submission within the Admin extranet to unblock their onboarding flow.</p>
          <a href="${appUrl}/admin/applications/${applicationId}" style="background: #2F3E46; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0;">Review Application</a>
        </div>
      `
    });
  } catch (error) {
    console.error('Admin alert dispatch error:', error);
  }
};
