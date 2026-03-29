import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const intakeSchema = z.object({
  responses: z.record(z.any()), // flexible questionnaire answers
  matches: z.array(z.object({
    therapistId: z.string(),
    therapistName: z.string(),
    score: z.number(),
    reasons: z.array(z.string()),
  })).optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = intakeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid intake data' }, { status: 400 });
    }

    const session = await getServerSession(authOptions);

    const record = await prisma.intakeRecord.create({
      data: {
        userId: session?.user?.id || null,
        responses: parsed.data.responses as any,
        matches: parsed.data.matches ? (parsed.data.matches as any) : null,
      },
    });

    return NextResponse.json({ success: true, intakeId: record.id });
  } catch (error) {
    console.error('Intake recording error:', error);
    return NextResponse.json({ error: 'Failed to save intake' }, { status: 500 });
  }
}
