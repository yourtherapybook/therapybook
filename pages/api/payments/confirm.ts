import { NextApiRequest, NextApiResponse } from 'next';
import { authenticateUser } from '../../../lib/auth-middleware';
import { prisma } from '../../../lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const user = await authenticateUser(req, res);

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (req.method === 'GET') {
      const checkoutSessionId = typeof req.query.checkoutSessionId === 'string'
        ? req.query.checkoutSessionId
        : '';

      if (!checkoutSessionId) {
        return res.status(400).json({ error: 'checkoutSessionId is required' });
      }

      const payment = await prisma.payment.findFirst({
        where: {
          stripePaymentId: checkoutSessionId,
          userId: user.id,
        },
        include: {
          session: {
            include: {
              therapist: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
      });

      if (!payment) {
        return res.status(404).json({ error: 'Payment not found' });
      }

      return res.status(200).json({ payment });
    }

    if (req.method === 'POST') {
      return res.status(410).json({
        error: 'Payment confirmation is handled by the Stripe webhook and can no longer be completed from the client.',
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Payment confirmation error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
