import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { authenticateUser } from '../../../lib/auth-middleware';
import { z } from 'zod';

const confirmPaymentSchema = z.object({
  paymentId: z.string().cuid('Invalid payment ID'),
  externalPaymentId: z.string().min(1, 'External payment ID is required'),
  status: z.enum(['COMPLETED', 'FAILED']),
  receiptUrl: z.string().url().optional(),
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

    const validatedData = confirmPaymentSchema.parse(req.body);
    
    // Verify payment belongs to user
    const existingPayment = await prisma.payment.findFirst({
      where: {
        id: validatedData.paymentId,
        userId: user.id,
      },
      include: {
        session: {
          include: {
            client: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
            therapist: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!existingPayment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    if (existingPayment.status !== 'PENDING' && existingPayment.status !== 'PROCESSING') {
      return res.status(400).json({ error: 'Payment has already been processed' });
    }

    // Update payment status
    const updatedPayment = await prisma.payment.update({
      where: { id: validatedData.paymentId },
      data: {
        status: validatedData.status,
        stripePaymentId: validatedData.externalPaymentId,
        receiptUrl: validatedData.receiptUrl,
        processedAt: new Date(),
      },
      include: {
        session: {
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
        },
      },
    });

    // If payment successful and there's a session, update session status
    if (validatedData.status === 'COMPLETED' && updatedPayment.session) {
      await prisma.session.update({
        where: { id: updatedPayment.session.id },
        data: { status: 'SCHEDULED' },
      });
    }

    // If payment failed and there's a session, cancel it
    if (validatedData.status === 'FAILED' && updatedPayment.session) {
      await prisma.session.update({
        where: { id: updatedPayment.session.id },
        data: { 
          status: 'CANCELLED',
          cancelledAt: new Date(),
        },
      });
    }

    res.status(200).json({ 
      payment: updatedPayment,
      message: `Payment ${validatedData.status.toLowerCase()} successfully` 
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.issues });
    }
    
    console.error('Payment confirmation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}