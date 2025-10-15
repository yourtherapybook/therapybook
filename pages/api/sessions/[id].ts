import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { authenticateUser } from '../../../lib/auth-middleware';
import { sendSessionCancellation, sendSessionRescheduled } from '../../../lib/resend';
import { z } from 'zod';

const updateSessionSchema = z.object({
  status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW']).optional(),
  notes: z.string().optional(),
  scheduledAt: z.string().datetime().optional(),
  cancellationReason: z.string().optional(),
});

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

    if (req.method === 'GET') {
      // Get session details
      const session = await prisma.session.findFirst({
        where: {
          id,
          OR: [
            { clientId: user.id },
            { therapistId: user.id },
          ],
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
          payment: {
            select: {
              id: true,
              amount: true,
              currency: true,
              status: true,
            },
          },
        },
      });

      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }

      res.status(200).json({ session });
    } else if (req.method === 'PUT') {
      // Update session
      const validatedData = updateSessionSchema.parse(req.body);
      
      // Verify user has permission to update this session
      const existingSession = await prisma.session.findFirst({
        where: {
          id,
          OR: [
            { clientId: user.id },
            { therapistId: user.id },
          ],
        },
      });

      if (!existingSession) {
        return res.status(404).json({ error: 'Session not found' });
      }

      const isRescheduling = validatedData.scheduledAt && validatedData.scheduledAt !== existingSession.scheduledAt.toISOString();
      const isCancelling = validatedData.status === 'CANCELLED';
      
      // Update session
      const updatedSession = await prisma.session.update({
        where: { id },
        data: {
          ...validatedData,
          ...(validatedData.scheduledAt && { scheduledAt: new Date(validatedData.scheduledAt) }),
          ...(validatedData.status === 'COMPLETED' && { completedAt: new Date() }),
          ...(validatedData.status === 'CANCELLED' && { cancelledAt: new Date() }),
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
          payment: {
            select: {
              id: true,
              amount: true,
              currency: true,
              status: true,
            },
          },
        },
      });

      // Send email notifications
      try {
        if (isCancelling) {
          const sessionDate = existingSession.scheduledAt.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });

          // Send cancellation email to client
          await sendSessionCancellation(
            updatedSession.client.email,
            `${updatedSession.client.firstName} ${updatedSession.client.lastName}`,
            `${updatedSession.therapist.firstName} ${updatedSession.therapist.lastName}`,
            sessionDate,
            validatedData.cancellationReason || 'Session cancelled'
          );
        } else if (isRescheduling) {
          const oldDate = existingSession.scheduledAt.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
          
          const newDate = updatedSession.scheduledAt.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
          
          const newTime = updatedSession.scheduledAt.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          });

          // Send rescheduling email to client
          await sendSessionRescheduled(
            updatedSession.client.email,
            `${updatedSession.client.firstName} ${updatedSession.client.lastName}`,
            `${updatedSession.therapist.firstName} ${updatedSession.therapist.lastName}`,
            oldDate,
            newDate,
            newTime,
            updatedSession.meetingUrl || 'https://therapybook.com/session/' + updatedSession.id
          );
        }
      } catch (emailError) {
        console.error('Email notification error:', emailError);
        // Don't fail the update if email fails
      }

      res.status(200).json({ 
        session: updatedSession, 
        message: 'Session updated successfully' 
      });
    } else if (req.method === 'DELETE') {
      // Cancel session
      const session = await prisma.session.findFirst({
        where: {
          id,
          OR: [
            { clientId: user.id },
            { therapistId: user.id },
          ],
        },
      });

      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }

      if (session.status !== 'SCHEDULED') {
        return res.status(400).json({ error: 'Can only cancel scheduled sessions' });
      }

      const cancelledSession = await prisma.session.update({
        where: { id },
        data: {
          status: 'CANCELLED',
          cancelledAt: new Date(),
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

      // Send cancellation email
      try {
        const sessionDate = session.scheduledAt.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });

        await sendSessionCancellation(
          cancelledSession.client.email,
          `${cancelledSession.client.firstName} ${cancelledSession.client.lastName}`,
          `${cancelledSession.therapist.firstName} ${cancelledSession.therapist.lastName}`,
          sessionDate,
          'Session cancelled by user'
        );
      } catch (emailError) {
        console.error('Email notification error:', emailError);
        // Don't fail the cancellation if email fails
      }

      res.status(200).json({ 
        session: cancelledSession, 
        message: 'Session cancelled successfully' 
      });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.issues });
    }
    
    console.error('Session API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}