import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { authenticateUser } from '../../../lib/auth-middleware';
import { DEFAULT_SESSION_CURRENCY, DEFAULT_SESSION_PRICE_EUR } from '../../../lib/pricing';
import { validateTherapistSlot } from '../../../lib/scheduling';
import { z } from 'zod';

const bookingSchema = z.object({
  therapistId: z.string().cuid('Invalid therapist ID'),
  scheduledAt: z.string().datetime('Invalid date format'),
  duration: z.number().min(30).max(120).default(50),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const user = await authenticateUser(req, res);

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Force verified email check for booking sessions independently of cached session logic
    const freshUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!freshUser?.emailVerified) {
      return res.status(403).json({ error: 'Active email verification boundary required to book sessions' });
    }

    const validatedData = bookingSchema.parse(req.body);

    // Verify therapist exists and is approved
    const therapist = await prisma.user.findFirst({
      where: {
        id: validatedData.therapistId,
        role: 'TRAINEE',
        traineeApplication: {
          status: 'APPROVED',
        },
      },
      include: {
        traineeApplication: {
          select: {
            status: true,
          },
        },
      },
    });

    if (!therapist) {
      return res.status(404).json({ error: 'Therapist not found or not approved' });
    }

    const scheduledAt = new Date(validatedData.scheduledAt);
    const slot = await validateTherapistSlot({
      therapistId: validatedData.therapistId,
      scheduledAt,
      duration: validatedData.duration,
    });

    if (!slot) {
      return res.status(409).json({ error: 'Time slot not available' });
    }

    const appUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

    const result = await prisma.$transaction(async (tx) => {
      const createdSession = await tx.session.create({
        data: {
          clientId: user.id,
          therapistId: validatedData.therapistId,
          scheduledAt,
          duration: validatedData.duration,
          price: DEFAULT_SESSION_PRICE_EUR,
          currency: DEFAULT_SESSION_CURRENCY,
          status: 'SCHEDULED',
        },
      });

      const session = await tx.session.update({
        where: { id: createdSession.id },
        data: {
          meetingUrl: `${appUrl}/session/${createdSession.id}`,
        },
        include: {
          client: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          therapist: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      // Create payment record
      const payment = await tx.payment.create({
        data: {
          userId: user.id,
          sessionId: session.id,
          amount: DEFAULT_SESSION_PRICE_EUR,
          currency: DEFAULT_SESSION_CURRENCY,
          status: 'PENDING',
          description: `Therapy session with ${therapist.firstName} ${therapist.lastName}`,
        },
      });

      return { session, payment };
    });

    res.status(201).json({
      session: result.session,
      payment: result.payment,
      message: 'Session reserved pending payment'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.issues });
    }

    console.error('Session booking error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
