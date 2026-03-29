import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { authenticateUser } from '../../../lib/auth-middleware';

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
      // Get user profile
      const userProfile = await prisma.user.findUnique({
        where: { id: user.id },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          role: true,
          emailVerified: true,
          image: true,
          createdAt: true,
          updatedAt: true,
          traineeApplication: {
            select: {
              id: true,
              status: true,
              currentStep: true,
              completedSteps: true,
            },
          },
          documents: {
            select: {
              id: true,
              title: true,
              type: true,
              status: true,
              createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      if (!userProfile) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.status(200).json({ user: userProfile });
    } else if (req.method === 'PUT') {
      // Update user profile
      const { firstName, lastName, phone, image } = req.body;
      
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          ...(firstName && { firstName }),
          ...(lastName && { lastName }),
          ...(phone && { phone }),
          ...(image && { image }),
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          role: true,
          image: true,
          updatedAt: true,
        },
      });

      res.status(200).json({ user: updatedUser, message: 'Profile updated successfully' });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Profile API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}