import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { authenticateUser } from '../../../lib/auth-middleware';
import { prisma } from '../../../lib/prisma';
import { sendSessionCancellation, sendSessionRescheduled } from '../../../lib/resend';
import { validateTherapistSlot } from '../../../lib/scheduling';

const updateSessionSchema = z.object({
  status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW']).optional(),
  notes: z.string().optional(),
  scheduledAt: z.string().datetime().optional(),
  cancellationReason: z.string().optional(),
});

const sessionInclude = {
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
  payment: {
    select: {
      id: true,
      amount: true,
      currency: true,
      status: true,
    },
  },
} as const;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const user = await authenticateUser(req, res);

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.query;
    if (typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid session ID' });
    }

    const isAdmin = user.role === 'ADMIN';
    const session = await prisma.session.findFirst({
      where: isAdmin
        ? { id }
        : {
            id,
            OR: [
              { clientId: user.id },
              { therapistId: user.id },
            ],
          },
      include: sessionInclude,
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    if (req.method === 'GET') {
      return res.status(200).json({ session });
    }

    if (req.method === 'PUT') {
      const validatedData = updateSessionSchema.parse(req.body);
      const hoursUntilSession = (new Date(session.scheduledAt).getTime() - Date.now()) / (1000 * 60 * 60);
      const isRescheduling = Boolean(
        validatedData.scheduledAt &&
        validatedData.scheduledAt !== session.scheduledAt.toISOString()
      );
      const isCancelling = validatedData.status === 'CANCELLED';
      const isStatusChange = Boolean(validatedData.status && !isCancelling);

      if (isStatusChange && !isAdmin) {
        return res.status(403).json({ error: 'Only admins can change session status directly.' });
      }

      if (validatedData.notes && user.id !== session.therapist.id && !isAdmin) {
        return res.status(403).json({ error: 'Only the therapist can update session notes.' });
      }

      if ((isRescheduling || isCancelling) && !isAdmin && hoursUntilSession <= 24) {
        return res.status(400).json({ error: 'Sessions can only be changed at least 24 hours in advance.' });
      }

      if (isRescheduling && validatedData.scheduledAt) {
        const newScheduledAt = new Date(validatedData.scheduledAt);
        const slot = await validateTherapistSlot({
          therapistId: session.therapist.id,
          scheduledAt: newScheduledAt,
          duration: session.duration,
        });

        if (!slot) {
          return res.status(409).json({ error: 'Selected slot is no longer available.' });
        }
      }

      const updatedSession = await prisma.session.update({
        where: { id },
        data: {
          ...(validatedData.notes !== undefined ? { notes: validatedData.notes } : {}),
          ...(isRescheduling && validatedData.scheduledAt ? { scheduledAt: new Date(validatedData.scheduledAt) } : {}),
          ...(isCancelling
            ? {
                status: 'CANCELLED',
                cancelledAt: new Date(),
                cancellationReason: validatedData.cancellationReason || 'Session cancelled',
              }
            : {}),
          ...(validatedData.status === 'COMPLETED' ? { completedAt: new Date() } : {}),
          ...(validatedData.status && !isCancelling ? { status: validatedData.status } : {}),
        },
        include: sessionInclude,
      });

      try {
        const appUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

        if (isCancelling) {
          const sessionDate = session.scheduledAt.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          });

          await sendSessionCancellation(
            updatedSession.client.email,
            `${updatedSession.client.firstName} ${updatedSession.client.lastName}`,
            `${updatedSession.therapist.firstName} ${updatedSession.therapist.lastName}`,
            sessionDate,
            validatedData.cancellationReason || 'Session cancelled'
          );
        } else if (isRescheduling && validatedData.scheduledAt) {
          const oldDate = session.scheduledAt.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          });
          const newDate = updatedSession.scheduledAt.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          });
          const newTime = updatedSession.scheduledAt.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          });

          await sendSessionRescheduled(
            updatedSession.client.email,
            `${updatedSession.client.firstName} ${updatedSession.client.lastName}`,
            `${updatedSession.therapist.firstName} ${updatedSession.therapist.lastName}`,
            oldDate,
            newDate,
            newTime,
            updatedSession.meetingUrl || `${appUrl}/session/${updatedSession.id}`
          );
        }
      } catch (emailError) {
        console.error('Session email notification error:', emailError);
      }

      return res.status(200).json({
        session: updatedSession,
        message: 'Session updated successfully',
      });
    }

    if (req.method === 'DELETE') {
      const hoursUntilSession = (new Date(session.scheduledAt).getTime() - Date.now()) / (1000 * 60 * 60);

      if (session.status !== 'SCHEDULED') {
        return res.status(400).json({ error: 'Only scheduled sessions can be cancelled.' });
      }

      if (!isAdmin && hoursUntilSession <= 24) {
        return res.status(400).json({ error: 'Sessions can only be cancelled at least 24 hours in advance.' });
      }

      const cancelledSession = await prisma.session.update({
        where: { id },
        data: {
          status: 'CANCELLED',
          cancelledAt: new Date(),
          cancellationReason: 'Session cancelled by user',
        },
        include: sessionInclude,
      });

      try {
        const sessionDate = session.scheduledAt.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });

        await sendSessionCancellation(
          cancelledSession.client.email,
          `${cancelledSession.client.firstName} ${cancelledSession.client.lastName}`,
          `${cancelledSession.therapist.firstName} ${cancelledSession.therapist.lastName}`,
          sessionDate,
          'Session cancelled by user'
        );
      } catch (emailError) {
        console.error('Session cancellation email error:', emailError);
      }

      return res.status(200).json({
        session: cancelledSession,
        message: 'Session cancelled successfully',
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.issues });
    }

    console.error('Session API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
