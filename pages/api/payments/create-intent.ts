import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { authenticateUser } from '../../../lib/auth-middleware';
import { createStripeCheckoutSession } from '../../../lib/payments/stripe';
import { prisma } from '../../../lib/prisma';

const checkoutSchema = z.object({
  paymentId: z.string().cuid('Invalid payment ID'),
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

    const { paymentId } = checkoutSchema.parse(req.body);

    const payment = await prisma.payment.findFirst({
      where: {
        id: paymentId,
        userId: user.id,
      },
      include: {
        session: {
          include: {
            therapist: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    if (!payment || !payment.session) {
      return res.status(404).json({ error: 'Pending booking payment not found' });
    }

    if (payment.status !== 'PENDING') {
      return res.status(400).json({ error: 'This payment is no longer awaiting checkout' });
    }

    const appUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const therapistName = `${payment.session.therapist.firstName} ${payment.session.therapist.lastName}`.trim();
    const checkoutSession = await createStripeCheckoutSession({
      amountCents: Math.round(Number(payment.amount) * 100),
      currency: payment.currency,
      customerEmail: user.email,
      successUrl: `${appUrl}/booking?status=success&checkoutSessionId={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${appUrl}/booking?status=cancelled&therapistId=${encodeURIComponent(payment.session.therapistId)}`,
      description: payment.description || `Therapy session with ${therapistName}`,
      metadata: {
        paymentId: payment.id,
        sessionId: payment.session.id,
        userId: user.id,
      },
    });

    const updatedPayment = await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'PROCESSING',
        stripePaymentId: checkoutSession.id,
      },
    });

    return res.status(201).json({
      payment: updatedPayment,
      checkoutUrl: checkoutSession.url,
      checkoutSessionId: checkoutSession.id,
      message: 'Checkout session created successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.issues });
    }

    console.error('Checkout session creation error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return res.status(message === 'Stripe is not configured.' ? 503 : 500).json({ error: message });
  }
}
