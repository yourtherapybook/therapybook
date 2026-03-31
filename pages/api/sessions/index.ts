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

    // Build query based on role
    let whereClause: any = {
      OR: [
        { clientId: user.id },
        { therapistId: user.id },
      ],
    };

    // Supervisors also see sessions for their assigned trainees
    if (user.role === 'SUPERVISOR') {
      const assignments = await prisma.supervisorAssignment.findMany({
        where: { supervisorId: user.id, isActive: true },
        select: { traineeId: true },
      });
      const traineeIds = assignments.map((a: { traineeId: string }) => a.traineeId);

      if (traineeIds.length > 0) {
        whereClause = {
          OR: [
            { clientId: user.id },
            { therapistId: user.id },
            { therapistId: { in: traineeIds } },
          ],
        };
      }
    }

    // Admins see all sessions
    if (user.role === 'ADMIN') {
      whereClause = {};
    }

    const sessions = await prisma.session.findMany({
      where: whereClause,
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
