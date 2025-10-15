import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { authenticateUser } from '../../../lib/auth-middleware';
import { sendBookingConfirmation, sendSessionBooked } from '../../../lib/resend';
import { z } from 'zod';

const bookingSchema = z.object({
  therapistId: z.string().cuid('Invalid therapist ID'),
  scheduledAt: z.string().datetime('Invalid date format'),
  duration: z.number().min(30).max(120).default(50),
  price: z.number().positive('Price must be positive'),
  currency: z.string().default('EUR'),
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

    // Check for scheduling conflicts
    const scheduledAt = new Date(validatedData.scheduledAt);
    const endTime = new Date(scheduledAt.getTime() + validatedData.duration * 60000);
    
    const conflictingSession = await prisma.session.findFirst({
      where: {
        therapistId: validatedData.therapistId,
        status: {
          in: ['SCHEDULED', 'IN_PROGRESS'],
        },
        OR: [
          {
            AND: [
              { scheduledAt: { lte: scheduledAt } },
              { scheduledAt: { gte: new Date(scheduledAt.getTime() - 50 * 60000) } },
            ],
          },
          {
            AND: [
              { scheduledAt: { gte: scheduledAt } },
              { scheduledAt: { lte: endTime } },
            ],
          },
        ],
      },
    });

    if (conflictingSession) {
      return res.status(409).json({ error: 'Time slot not available' });
    }

    // Create session and payment record in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create session
      const session = await tx.session.create({
        data: {
          clientId: user.id,
          therapistId: validatedData.therapistId,
          scheduledAt,
          duration: validatedData.duration,
          price: validatedData.price,
          currency: validatedData.currency,
          status: 'SCHEDULED',
          meetingUrl: `https://therapybook.com/session/${Math.random().toString(36).substring(7)}`,
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
          amount: validatedData.price,
          currency: validatedData.currency,
          status: 'PENDING',
          description: `Therapy session with ${therapist.firstName} ${therapist.lastName}`,
        },
      });

      return { session, payment };
    });

    // Send confirmation emails
    try {
      const sessionDate = scheduledAt.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      const sessionTime = scheduledAt.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });

      // Send confirmation to client
      await sendBookingConfirmation(
        result.session.client.email,
        `${result.session.client.firstName} ${result.session.client.lastName}`,
        `${result.session.therapist.firstName} ${result.session.therapist.lastName}`,
        sessionDate,
        sessionTime,
        result.session.meetingUrl || 'https://therapybook.com/session/' + result.session.id
      );

      // Send notification to therapist
      await sendSessionBooked(
        result.session.therapist.email,
        `${result.session.therapist.firstName} ${result.session.therapist.lastName}`,
        `${result.session.client.firstName} ${result.session.client.lastName}`,
        sessionDate,
        sessionTime,
        result.session.meetingUrl || 'https://therapybook.com/session/' + result.session.id
      );
    } catch (emailError) {
      console.error('Email notification error:', emailError);
      // Don't fail the booking if email fails
    }

    res.status(201).json({ 
      session: result.session,
      payment: result.payment,
      message: 'Session booked successfully' 
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.issues });
    }
    
    console.error('Session booking error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}