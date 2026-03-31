import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { EMAIL_TEMPLATES, EmailTemplateKey } from '@/lib/email/templates';

// Sample data for each template preview
const SAMPLE_VARS: Record<EmailTemplateKey, Record<string, unknown>> = {
  VERIFY_EMAIL: { name: 'Jane Smith', verifyUrl: '#' },
  PASSWORD_RESET: { name: 'Jane Smith', resetUrl: '#' },
  APPLICATION_RECEIVED: { name: 'Jane Smith' },
  APPLICATION_UNDER_REVIEW: { name: 'Jane Smith' },
  APPLICATION_APPROVED: { name: 'Jane Smith' },
  APPLICATION_REJECTED: { name: 'Jane Smith' },
  BOOKING_CONFIRMED: {
    clientName: 'Jane Smith',
    therapistName: 'Alex Brown',
    date: 'Tuesday, 7 April 2026',
    time: '10:00 AM',
    duration: 50,
    sessionType: 'ONLINE',
    sessionUrl: '#',
  },
  SESSION_BOOKED_THERAPIST: {
    therapistName: 'Alex Brown',
    clientName: 'Jane Smith',
    date: 'Tuesday, 7 April 2026',
    time: '10:00 AM',
    duration: 50,
    sessionType: 'ONLINE',
    sessionUrl: '#',
  },
  SESSION_CANCELLED: {
    recipientName: 'Jane Smith',
    otherPartyName: 'Alex Brown',
    date: 'Tuesday, 7 April 2026',
    reason: 'Therapist is unavailable',
  },
  SESSION_RESCHEDULED: {
    recipientName: 'Jane Smith',
    otherPartyName: 'Alex Brown',
    oldDate: 'Monday, 6 April 2026',
    newDate: 'Wednesday, 8 April 2026',
    newTime: '2:00 PM',
    sessionUrl: '#',
  },
  SESSION_REMINDER: {
    recipientName: 'Jane Smith',
    otherPartyName: 'Alex Brown',
    sessionTime: '10:00 AM',
    hoursUntil: 24,
    sessionType: 'ONLINE',
    sessionUrl: '#',
  },
  ADMIN_NEW_APPLICATION: {
    applicantName: 'Jane Smith',
    applicationId: 'preview-id-123',
  },
};

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const key = req.nextUrl.searchParams.get('key') as EmailTemplateKey | null;
  const mode = req.nextUrl.searchParams.get('mode') ?? 'html';

  if (!key || !(key in EMAIL_TEMPLATES)) {
    return NextResponse.json({ error: 'Invalid template key' }, { status: 400 });
  }

  const template = EMAIL_TEMPLATES[key];
  const vars = SAMPLE_VARS[key];

  if (mode === 'text') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const text = template.getText(vars as any);
    return new NextResponse(text, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const html = template.getHtml(vars as any);
  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
