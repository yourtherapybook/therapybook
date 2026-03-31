/**
 * TherapyBook Email Shell — shared branded wrapper for all transactional emails.
 *
 * Design: table-based layout with inline CSS for maximum email client compatibility.
 * Palette: coral primary (#FF7F50), neutral surfaces, Inter-like system fonts.
 */

const APP_NAME = 'TherapyBook';
const APP_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';
const SUPPORT_EMAIL = 'support@therapybook.com';

// Colors
const C = {
  primary: '#FF7F50',
  primaryDark: '#e6663a',
  bg: '#f9f9f9',
  card: '#ffffff',
  text: '#171717',
  textSecondary: '#525252',
  textMuted: '#737373',
  textLight: '#a3a3a3',
  border: '#e5e5e5',
  borderLight: '#f5f5f5',
  success: '#16a34a',
  successBg: '#f0fdf4',
  error: '#dc2626',
  errorBg: '#fef2f2',
  info: '#2563eb',
  infoBg: '#eff6ff',
  warning: '#d97706',
  warningBg: '#fffbeb',
};

const FONT = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";

export function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

interface EmailShellOptions {
  title: string;
  previewText?: string;
  bodyHtml: string;
  ctaText?: string;
  ctaUrl?: string;
  footerHtml?: string;
}

export function emailShell({
  title,
  previewText,
  bodyHtml,
  ctaText,
  ctaUrl,
  footerHtml,
}: EmailShellOptions): string {
  const ctaButton = ctaText && ctaUrl
    ? `<table role="presentation" style="margin:24px 0"><tr><td>
        <a href="${ctaUrl}" target="_blank" style="display:inline-block;background:${C.primary};color:#ffffff;font-weight:600;font-size:14px;padding:12px 28px;border-radius:8px;text-decoration:none;mso-padding-alt:0">
          ${escapeHtml(ctaText)}
        </a>
      </td></tr></table>`
    : '';

  const footer = footerHtml || `
    <p style="font-size:12px;color:${C.textLight};margin:0">
      ${APP_NAME} — Affordable Therapy with Supervised Trainees
    </p>
    <p style="font-size:12px;color:${C.textLight};margin:4px 0 0">
      Questions? Contact <a href="mailto:${SUPPORT_EMAIL}" style="color:${C.primary};text-decoration:none">${SUPPORT_EMAIL}</a>
    </p>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="color-scheme" content="light">
  <title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;padding:0;background:${C.bg};font-family:${FONT}">
  ${previewText ? `<div style="display:none;max-height:0;overflow:hidden">${escapeHtml(previewText)}</div>` : ''}
  <table role="presentation" style="width:100%;border:0;border-spacing:0;background:${C.bg}">
    <tr><td style="padding:24px 16px">
      <table role="presentation" style="max-width:560px;margin:0 auto;border:0;border-spacing:0;width:100%">

        <!-- Header -->
        <tr><td style="padding:0 0 20px">
          <table role="presentation" style="border:0;border-spacing:0"><tr>
            <td style="width:32px;height:32px;background:${C.primary};border-radius:8px;text-align:center;vertical-align:middle">
              <span style="color:#fff;font-size:16px;font-weight:700">♥</span>
            </td>
            <td style="padding-left:10px;font-size:16px;font-weight:700;color:${C.text}">
              ${APP_NAME}
            </td>
          </tr></table>
        </td></tr>

        <!-- Card -->
        <tr><td style="background:${C.card};border-radius:12px;border:1px solid ${C.border};padding:32px">
          <h1 style="margin:0 0 16px;font-size:20px;font-weight:700;color:${C.text};line-height:1.3">
            ${escapeHtml(title)}
          </h1>
          <div style="font-size:14px;line-height:1.6;color:${C.textSecondary}">
            ${bodyHtml}
          </div>
          ${ctaButton}
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:24px 0 0;text-align:center">
          ${footer}
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// Info box helper
export function infoBox(content: string, variant: 'default' | 'success' | 'warning' | 'error' = 'default'): string {
  const bgMap = { default: C.borderLight, success: C.successBg, warning: C.warningBg, error: C.errorBg };
  const borderMap = { default: C.border, success: '#bbf7d0', warning: '#fde68a', error: '#fecaca' };
  return `<div style="background:${bgMap[variant]};border:1px solid ${borderMap[variant]};border-radius:8px;padding:16px;margin:16px 0;font-size:13px;line-height:1.5">
    ${content}
  </div>`;
}

// Detail row helper
export function detailRow(label: string, value: string): string {
  return `<tr>
    <td style="padding:6px 0;font-size:13px;color:${C.textMuted};width:120px;vertical-align:top">${escapeHtml(label)}</td>
    <td style="padding:6px 0;font-size:13px;color:${C.text};font-weight:500">${escapeHtml(value)}</td>
  </tr>`;
}

export function detailTable(rows: [string, string][]): string {
  return `<table role="presentation" style="width:100%;border:0;border-spacing:0;margin:16px 0">
    ${rows.map(([label, value]) => detailRow(label, value)).join('')}
  </table>`;
}

export { C, APP_NAME, APP_URL, SUPPORT_EMAIL };
