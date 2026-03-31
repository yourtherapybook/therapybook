import { NextApiRequest, NextApiResponse } from 'next';
import { sendEmail, APP_URL } from '../../../lib/email';
import { verifyStripeWebhookSignature } from '../../../lib/payments/stripe';
import { prisma } from '../../../lib/prisma';

export const config = {
  api: {
    bodyParser: false,
  },
};

const readRawBody = async (req: NextApiRequest) => {
  const chunks: Buffer[] = [];

  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }

  return Buffer.concat(chunks);
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const rawBody = await readRawBody(req);
    const signatureHeader = Array.isArray(req.headers['stripe-signature'])
      ? req.headers['stripe-signature'][0]
      : req.headers['stripe-signature'];
    const event = verifyStripeWebhookSignature(rawBody, signatureHeader);

    if (event.type === 'checkout.session.completed') {
      const checkoutSessionId = event.data.object.id;

      const payment = await prisma.payment.findFirst({
        where: { stripePaymentId: checkoutSessionId },
        include: {
          session: {
            include: {
              client: true,
              therapist: true,
            },
          },
        },
      });

      if (payment) {
        await prisma.$transaction(async (tx) => {
          await tx.payment.update({
            where: { id: payment.id },
            data: {
              status: 'COMPLETED',
              processedAt: new Date(),
              receiptUrl: event.data.object.receipt_url || null,
            },
          });

          if (payment.sessionId) {
            await tx.session.update({
              where: { id: payment.sessionId },
              data: { status: 'SCHEDULED' },
            });
          }
        });

        if (payment.session) {
          try {
            const appUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
            const sessionDate = payment.session.scheduledAt.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            });
            const sessionTime = payment.session.scheduledAt.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true,
            });
            const meetingUrl = payment.session.meetingUrl || `${appUrl}/session/${payment.session.id}`;

            const sessionUrl = `${APP_URL}/session/${payment.session.id}`;
            const clientName = `${payment.session.client.firstName} ${payment.session.client.lastName}`;
            const therapistName = `${payment.session.therapist.firstName} ${payment.session.therapist.lastName}`;

            await sendEmail(payment.session.client.email, 'BOOKING_CONFIRMED', {
              clientName, therapistName, date: sessionDate, time: sessionTime,
              duration: payment.session.duration, sessionType: payment.session.type || 'ONLINE',
              location: payment.session.location || undefined, sessionUrl,
            });

            await sendEmail(payment.session.therapist.email, 'SESSION_BOOKED_THERAPIST', {
              therapistName, clientName, date: sessionDate, time: sessionTime,
              duration: payment.session.duration, sessionType: payment.session.type || 'ONLINE',
              sessionUrl: `${APP_URL}/trainee-dashboard`,
            });
          } catch (emailError) {
            console.error('Post-payment booking email error:', emailError);
          }
        }
      }
    }

    if (event.type === 'checkout.session.expired') {
      const checkoutSessionId = event.data.object.id;

      const payment = await prisma.payment.findFirst({
        where: { stripePaymentId: checkoutSessionId },
      });

      if (payment) {
        await prisma.$transaction(async (tx) => {
          await tx.payment.update({
            where: { id: payment.id },
            data: {
              status: 'FAILED',
              processedAt: new Date(),
            },
          });

          if (payment.sessionId) {
            await tx.session.update({
              where: { id: payment.sessionId },
              data: {
                status: 'CANCELLED',
                cancelledAt: new Date(),
                cancellationReason: 'Payment checkout expired',
              },
            });
          }
        });
      }
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('Stripe webhook error:', error);
    return res.status(400).json({ error: 'Webhook handling failed' });
  }
}
