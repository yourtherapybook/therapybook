import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const CURRENT_POLICY_VERSION = '2026-03-29-v1';

const consentSchema = z.object({
  essential: z.boolean(),
  analytics: z.boolean(),
  marketing: z.boolean(),
  sessionId: z.string().optional(), // Browser session ID for anonymous users
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = consentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid consent data' }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || null;
    const userAgent = request.headers.get('user-agent') || null;

    await prisma.consentRecord.create({
      data: {
        userId: session?.user?.id || null,
        sessionId: parsed.data.sessionId || null,
        policyVersion: CURRENT_POLICY_VERSION,
        essential: parsed.data.essential,
        analytics: parsed.data.analytics,
        marketing: parsed.data.marketing,
        ipAddress: ip,
        userAgent: userAgent?.slice(0, 500) || null,
      },
    });

    return NextResponse.json({
      success: true,
      policyVersion: CURRENT_POLICY_VERSION,
    });
  } catch (error) {
    console.error('Consent recording error:', error);
    return NextResponse.json({ error: 'Failed to record consent' }, { status: 500 });
  }
}
