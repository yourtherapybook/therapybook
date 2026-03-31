import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { authenticateUser } from '../../../lib/auth-middleware';
import { prisma } from '../../../lib/prisma';
import { sendEmail, APP_URL } from '../../../lib/email';
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

/**
 * Determines refund eligibility based on cancellation timing.
 * >24h before session: full refund
 * Admin override: full refund regardless of timing
 */
function getRefundPolicy(hoursUntilSession: number, isAdmin: boolean): { eligible: boolean; type: 'FULL' | 'NONE' } {
  if (isAdmin) return { eligible: true, type: 'FULL' };
  if (hoursUntilSession > 24) return { eligible: true, type: 'FULL' };
  return { eligible: false, type: 'NONE' };
}

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

      // Allow therapist to close out their own past sessions (COMPLETED / NO_SHOW)
      if (isStatusChange && !isAdmin) {
        const isTherapist = user.id === session.therapist.id;
        const isCloseout = validatedData.status === 'COMPLETED' || validatedData.status === 'NO_SHOW';
        const sessionPassed = Date.now() > new Date(session.scheduledAt).getTime() + session.duration * 60 * 1000;

        if (!isTherapist || !isCloseout || !sessionPassed) {
          return res.status(403).json({ error: 'Only the session therapist can mark past sessions as completed or no-show.' });
        }
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

      // Use transaction for cancellation (session update + payment refund + audit log)
      let updatedSession;
      let refundApplied = false;

      if (isCancelling) {
        const refundPolicy = getRefundPolicy(hoursUntilSession, isAdmin);
        const cancelReason = validatedData.cancellationReason || 'Session cancelled';

        updatedSession = await prisma.$transaction(async (tx) => {
          // 1. Cancel session
          const cancelled = await tx.session.update({
            where: { id },
            data: {
              status: 'CANCELLED',
              cancelledAt: new Date(),
              cancellationReason: cancelReason,
            },
            include: sessionInclude,
          });

          // 2. Refund payment if eligible and payment exists
          if (refundPolicy.eligible && cancelled.payment?.id && cancelled.payment.status === 'COMPLETED') {
            await tx.payment.update({
              where: { id: cancelled.payment.id },
              data: { status: 'REFUNDED' },
            });
            refundApplied = true;
          }

          // 3. Audit log
          await tx.auditLog.create({
            data: {
              action: 'SESSION_CANCELLED',
              userId: user.id,
              entityId: id,
              entityType: 'Session',
              details: {
                cancelledBy: user.id,
                cancelledByRole: user.role,
                reason: cancelReason,
                hoursBeforeSession: Math.round(hoursUntilSession),
                refundApplied,
                refundType: refundPolicy.type,
                paymentId: cancelled.payment?.id || null,
              },
            },
          });

          return cancelled;
        });
      } else {
        // Non-cancellation updates (reschedule, notes, status change)
        const auditAction = isRescheduling ? 'SESSION_RESCHEDULED' : 'SESSION_UPDATED';

        updatedSession = await prisma.$transaction(async (tx) => {
          const updated = await tx.session.update({
            where: { id },
            data: {
              ...(validatedData.notes !== undefined ? { notes: validatedData.notes } : {}),
              ...(isRescheduling && validatedData.scheduledAt ? { scheduledAt: new Date(validatedData.scheduledAt) } : {}),
              ...(validatedData.status === 'COMPLETED' ? { completedAt: new Date() } : {}),
              ...(validatedData.status && !isCancelling ? { status: validatedData.status } : {}),
            },
            include: sessionInclude,
          });

          await tx.auditLog.create({
            data: {
              action: auditAction,
              userId: user.id,
              entityId: id,
              entityType: 'Session',
              details: {
                updatedBy: user.id,
                updatedByRole: user.role,
                changes: validatedData,
                ...(isRescheduling ? { previousScheduledAt: session.scheduledAt.toISOString() } : {}),
              },
            },
          });

          return updated;
        });
      }

      // Send email notifications to BOTH parties
      try {
        const appUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
        const clientName = `${updatedSession.client.firstName} ${updatedSession.client.lastName}`;
        const therapistName = `${updatedSession.therapist.firstName} ${updatedSession.therapist.lastName}`;

        if (isCancelling) {
          const sessionDate = session.scheduledAt.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          });
          const cancelReason = validatedData.cancellationReason || 'Session cancelled';

          // Notify both parties
          await sendEmail(updatedSession.client.email, 'SESSION_CANCELLED', {
            recipientName: clientName, otherPartyName: therapistName,
            date: sessionDate, reason: cancelReason,
          }).catch((e) => console.error('Client cancellation email:', e));

          await sendEmail(updatedSession.therapist.email, 'SESSION_CANCELLED', {
            recipientName: therapistName, otherPartyName: clientName,
            date: sessionDate, reason: cancelReason,
          }).catch((e) => console.error('Therapist cancellation email:', e));
        } else if (isRescheduling && validatedData.scheduledAt) {
          const oldDate = session.scheduledAt.toLocaleDateString('en-US', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
          });
          const newDate = updatedSession.scheduledAt.toLocaleDateString('en-US', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
          });
          const newTime = updatedSession.scheduledAt.toLocaleTimeString('en-US', {
            hour: '2-digit', minute: '2-digit', hour12: true,
          });
          const sessionUrl = updatedSession.meetingUrl || `${APP_URL}/session/${updatedSession.id}`;

          await sendEmail(updatedSession.client.email, 'SESSION_RESCHEDULED', {
            recipientName: clientName, otherPartyName: therapistName,
            oldDate, newDate, newTime, sessionUrl,
          }).catch((e) => console.error('Client reschedule email:', e));

          await sendEmail(updatedSession.therapist.email, 'SESSION_RESCHEDULED', {
            recipientName: therapistName, otherPartyName: clientName,
            oldDate, newDate, newTime, sessionUrl,
          }).catch((e) => console.error('Therapist reschedule email:', e));
        }
      } catch (emailError) {
        console.error('Session email notification error:', emailError);
      }

      return res.status(200).json({
        session: updatedSession,
        refundApplied,
        message: isCancelling
          ? refundApplied
            ? 'Session cancelled. Payment has been marked for refund.'
            : 'Session cancelled.'
          : 'Session updated successfully',
      });
    }

    // DELETE handler — redirect to PUT with CANCELLED status for consistency
    if (req.method === 'DELETE') {
      const hoursUntilSession = (new Date(session.scheduledAt).getTime() - Date.now()) / (1000 * 60 * 60);

      if (session.status !== 'SCHEDULED') {
        return res.status(400).json({ error: 'Only scheduled sessions can be cancelled.' });
      }

      if (!isAdmin && hoursUntilSession <= 24) {
        return res.status(400).json({ error: 'Sessions can only be cancelled at least 24 hours in advance.' });
      }

      // Reuse PUT cancellation logic by simulating the request
      req.method = 'PUT';
      req.body = { status: 'CANCELLED', cancellationReason: 'Session cancelled by user' };
      return handler(req, res);
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
