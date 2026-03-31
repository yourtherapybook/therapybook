import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { authenticateUser } from '../../../lib/auth-middleware';
import { prisma } from '../../../lib/prisma';

const checkoutSchema = z.object({
  paymentId: z.string().cuid('Invalid payment ID'),
});

/**
 * Test/demo mode: if Stripe is not configured or DEMO_MODE=true,
 * auto-confirm the payment and skip Stripe checkout entirely.
 * This lets the full booking flow work end-to-end during testing.
 */
function isDemoMode(): boolean {
  if (process.env.DEMO_MODE === 'true') return true;
  if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === 'sk_test_placeholder') return true;
  return false;
}

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

    // --- Demo/Test mode: auto-confirm without Stripe ---
    if (isDemoMode()) {
      // Simulate successful payment
      const demoCheckoutId = `demo_${payment.id}_${Date.now()}`;

      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'COMPLETED',
          stripePaymentId: demoCheckoutId,
          processedAt: new Date(),
        },
      });

      // Return a redirect URL that mimics Stripe success callback
      const successUrl = `${appUrl}/booking?status=success&checkoutSessionId=${encodeURIComponent(demoCheckoutId)}`;

      return res.status(201).json({
        payment: { ...payment, status: 'COMPLETED' },
        checkoutUrl: successUrl,
        checkoutSessionId: demoCheckoutId,
        demoMode: true,
        message: 'Demo mode: payment auto-confirmed. Redirecting to booking success.',
      });
    }

    // --- Production mode: create Stripe checkout ---
    const { createStripeCheckoutSession } = await import('../../../lib/payments/stripe');

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

    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'PROCESSING',
        stripePaymentId: checkoutSession.id,
      },
    });

    return res.status(201).json({
      payment: { ...payment, status: 'PROCESSING' },
      checkoutUrl: checkoutSession.url,
      checkoutSessionId: checkoutSession.id,
      message: 'Checkout session created successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.issues });
    }

    console.error('Checkout session creation error:', error);

    // If Stripe fails, fall back to demo mode
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message.includes('Stripe') || message.includes('stripe')) {
      return res.status(503).json({
        error: 'Payment processor unavailable. Set DEMO_MODE=true in .env to test without Stripe.',
      });
    }
    return res.status(500).json({ error: message });
  }
}
