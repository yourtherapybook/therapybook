import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../lib/prisma';
import { getTherapistSlots } from '../../../../lib/scheduling';
import { z } from 'zod';

const slotsQuerySchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  duration: z.number().min(30).max(120).default(50),
});
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id: therapistId } = req.query;
    
    if (typeof therapistId !== 'string') {
      return res.status(400).json({ error: 'Invalid therapist ID' });
    }

    const { startDate, endDate, duration } = slotsQuerySchema.parse({
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      duration: req.query.duration ? parseInt(req.query.duration as string) : 50,
    });

    // Verify therapist exists and is approved
    const therapist = await prisma.user.findFirst({
      where: {
        id: therapistId,
        role: 'TRAINEE',
        traineeApplication: {
          status: 'APPROVED',
        },
      },
    });

    if (!therapist) {
      return res.status(404).json({ error: 'Therapist not found or not approved' });
    }

    const slots = await getTherapistSlots({
      therapistId,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      duration,
    });
    
    res.status(200).json({ slots });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.issues });
    }
    
    console.error('Slots API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
