import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../lib/prisma';
import { authenticateUser } from '../../../../lib/auth-middleware';
import { z } from 'zod';

const availabilitySchema = z.object({
  dayOfWeek: z.number().min(0).max(6),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
  isActive: z.boolean().default(true),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

const unavailableSlotSchema = z.object({
  startDateTime: z.string().datetime(),
  endDateTime: z.string().datetime(),
  reason: z.string().optional(),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { id: therapistId } = req.query;
    
    if (typeof therapistId !== 'string') {
      return res.status(400).json({ error: 'Invalid therapist ID' });
    }

    if (req.method === 'GET') {
      // Get therapist availability
      const availability = await prisma.therapistAvailability.findMany({
        where: {
          therapistId,
          isActive: true,
        },
        orderBy: [
          { dayOfWeek: 'asc' },
          { startTime: 'asc' },
        ],
      });

      const unavailableSlots = await prisma.unavailableSlot.findMany({
        where: {
          therapistId,
          endDateTime: {
            gte: new Date(), // Only future unavailable slots
          },
        },
        orderBy: {
          startDateTime: 'asc',
        },
      });

      res.status(200).json({ availability, unavailableSlots });
    } else if (req.method === 'POST') {
      // Add availability or unavailable slot
      const user = await authenticateUser(req, res);
      
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Check if user is the therapist or admin
      if (user.id !== therapistId && user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Forbidden' });
      }

      const { type, ...data } = req.body;

      if (type === 'availability') {
        const validatedData = availabilitySchema.parse(data);
        
        const newAvailability = await prisma.therapistAvailability.create({
          data: {
            therapistId,
            ...validatedData,
            ...(validatedData.startDate && { startDate: new Date(validatedData.startDate) }),
            ...(validatedData.endDate && { endDate: new Date(validatedData.endDate) }),
          },
        });

        res.status(201).json({ availability: newAvailability });
      } else if (type === 'unavailable') {
        const validatedData = unavailableSlotSchema.parse(data);
        
        const unavailableSlot = await prisma.unavailableSlot.create({
          data: {
            therapistId,
            startDateTime: new Date(validatedData.startDateTime),
            endDateTime: new Date(validatedData.endDateTime),
            reason: validatedData.reason,
          },
        });

        res.status(201).json({ unavailableSlot });
      } else {
        res.status(400).json({ error: 'Invalid type. Must be "availability" or "unavailable"' });
      }
    } else if (req.method === 'PUT') {
      // Update availability
      const user = await authenticateUser(req, res);
      
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (user.id !== therapistId && user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Forbidden' });
      }

      const { availabilityId, ...updateData } = req.body;
      
      if (!availabilityId) {
        return res.status(400).json({ error: 'Availability ID is required' });
      }

      const validatedData = availabilitySchema.partial().parse(updateData);
      
      const updatedAvailability = await prisma.therapistAvailability.update({
        where: {
          id: availabilityId,
          therapistId, // Ensure therapist owns this availability
        },
        data: {
          ...validatedData,
          ...(validatedData.startDate && { startDate: new Date(validatedData.startDate) }),
          ...(validatedData.endDate && { endDate: new Date(validatedData.endDate) }),
        },
      });

      res.status(200).json({ availability: updatedAvailability });
    } else if (req.method === 'DELETE') {
      // Delete availability or unavailable slot
      const user = await authenticateUser(req, res);
      
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (user.id !== therapistId && user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Forbidden' });
      }

      const { availabilityId, unavailableSlotId } = req.body;

      if (availabilityId) {
        await prisma.therapistAvailability.delete({
          where: {
            id: availabilityId,
            therapistId,
          },
        });
        res.status(200).json({ message: 'Availability deleted successfully' });
      } else if (unavailableSlotId) {
        await prisma.unavailableSlot.delete({
          where: {
            id: unavailableSlotId,
            therapistId,
          },
        });
        res.status(200).json({ message: 'Unavailable slot deleted successfully' });
      } else {
        res.status(400).json({ error: 'Either availabilityId or unavailableSlotId is required' });
      }
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.issues });
    }
    
    console.error('Availability API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}