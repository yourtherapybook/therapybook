import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { authenticateUser } from '../../../lib/auth-middleware';
import { z } from 'zod';

const referralSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  workEmail: z.string().email('Invalid email format'),
});

const referralsArraySchema = z.array(referralSchema);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const user = await authenticateUser(req, res);
    
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Ensure user has a trainee application
    const application = await prisma.traineeApplication.findUnique({
      where: { userId: user.id },
    });

    if (!application) {
      return res.status(404).json({ error: 'Trainee application not found' });
    }

    if (req.method === 'GET') {
      // Get all referrals for the application
      const referrals = await prisma.referral.findMany({
        where: { traineeApplicationId: application.id },
        orderBy: { createdAt: 'asc' },
      });

      res.status(200).json({ referrals });
    } else if (req.method === 'POST') {
      // Add new referrals (replace existing ones)
      const validatedReferrals = referralsArraySchema.parse(req.body.referrals || []);
      
      // Delete existing referrals and create new ones in a transaction
      const result = await prisma.$transaction(async (tx) => {
        // Delete existing referrals
        await tx.referral.deleteMany({
          where: { traineeApplicationId: application.id },
        });

        // Create new referrals
        if (validatedReferrals.length > 0) {
          const referrals = await tx.referral.createMany({
            data: validatedReferrals.map(referral => ({
              ...referral,
              traineeApplicationId: application.id,
            })),
          });

          // Get the created referrals
          const createdReferrals = await tx.referral.findMany({
            where: { traineeApplicationId: application.id },
            orderBy: { createdAt: 'asc' },
          });

          return createdReferrals;
        }

        return [];
      });

      res.status(200).json({ 
        referrals: result, 
        message: 'Referrals updated successfully' 
      });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.issues });
    }
    
    console.error('Referrals API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}