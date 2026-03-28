import { NextApiRequest, NextApiResponse } from 'next';
import { authenticateUser } from '../../../lib/auth-middleware';
import { prisma } from '../../../lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const user = await authenticateUser(req, res);

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const sessions = await prisma.session.findMany({
      where: {
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
      orderBy: {
        scheduledAt: 'asc',
      },
    });

    return res.status(200).json({ sessions });
  } catch (error) {
    console.error('Sessions list error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
