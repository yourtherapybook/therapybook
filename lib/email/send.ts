/**
 * TherapyBook Email Send Service — centralized sending with Resend.
 *
 * Features:
 * - Type-safe template key + variables
 * - Resend API integration
 * - Dev mode fallback (console logging)
 * - Plain-text fallback generation
 * - Error handling with non-blocking behavior
 */

import { Resend } from 'resend';
import { EMAIL_TEMPLATES, type EmailTemplateKey } from './templates';

const FROM_EMAIL = process.env.FROM_EMAIL || 'TherapyBook <noreply@therapybook.online>';

let resendClient: Resend | null = null;

function getResend(): Resend | null {
  if (resendClient) return resendClient;
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  resendClient = new Resend(apiKey);
  return resendClient;
}

/**
 * Send a transactional email using a registered template.
 *
 * @param to - Recipient email(s)
 * @param templateKey - Key from EMAIL_TEMPLATES
 * @param variables - Type-safe variables for the template
 * @param options - Optional overrides
 */
export async function sendEmail<K extends EmailTemplateKey>(
  to: string | string[],
  templateKey: K,
  variables: Parameters<(typeof EMAIL_TEMPLATES)[K]['getHtml']>[0],
  options?: {
    from?: string;
    replyTo?: string;
  }
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const template = EMAIL_TEMPLATES[templateKey];
    if (!template) {
      console.error(`[email] Unknown template: ${templateKey}`);
      return { success: false, error: `Unknown template: ${templateKey}` };
    }

    // Resolve subject
    const subject = typeof template.subject === 'function'
      ? (template.subject as (vars: any) => string)(variables)
      : template.subject;

    // Generate HTML
    const html = template.getHtml(variables as any);

    // Generate plain text
    const text = 'getText' in template && typeof template.getText === 'function'
      ? (template.getText as (vars: any) => string)(variables)
      : undefined;

    const resend = getResend();

    if (!resend) {
      // Dev mode: log to console
      console.log(`[email:dev] To: ${Array.isArray(to) ? to.join(', ') : to}`);
      console.log(`[email:dev] Subject: ${subject}`);
      console.log(`[email:dev] Template: ${templateKey}`);
      if (text) console.log(`[email:dev] Text: ${text.slice(0, 200)}...`);
      return { success: true, messageId: `dev_${Date.now()}` };
    }

    const result = await resend.emails.send({
      from: options?.from || FROM_EMAIL,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      text,
      ...(options?.replyTo ? { replyTo: options.replyTo } : {}),
    });

    if (result.error) {
      console.error(`[email] Send failed for ${templateKey}:`, result.error);
      return { success: false, error: result.error.message };
    }

    return { success: true, messageId: result.data?.id };
  } catch (error) {
    console.error(`[email] Exception sending ${templateKey}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Re-export for convenience
export { EMAIL_TEMPLATES, type EmailTemplateKey };
