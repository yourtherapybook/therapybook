import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../lib/prisma';
import { z } from 'zod';

const slotsQuerySchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  duration: z.number().min(30).max(120).default(50),
});

interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
  therapistId: string;
  datetime: string;
}

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

    // Get therapist availability
    const availability = await prisma.therapistAvailability.findMany({
      where: {
        therapistId,
        isActive: true,
      },
    });

    // Get unavailable slots
    const unavailableSlots = await prisma.unavailableSlot.findMany({
      where: {
        therapistId,
        startDateTime: { lte: new Date(endDate) },
        endDateTime: { gte: new Date(startDate) },
      },
    });

    // Get existing sessions
    const existingSessions = await prisma.session.findMany({
      where: {
        therapistId,
        scheduledAt: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
        status: {
          in: ['SCHEDULED', 'IN_PROGRESS'],
        },
      },
    });

    // Generate available slots
    const slots: TimeSlot[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      const dayOfWeek = date.getDay();
      
      // Find availability for this day of week
      const dayAvailability = availability.filter(a => a.dayOfWeek === dayOfWeek);
      
      for (const avail of dayAvailability) {
        // Check if this availability applies to the current date
        if (avail.startDate && new Date(avail.startDate) > date) continue;
        if (avail.endDate && new Date(avail.endDate) < date) continue;
        
        const [startHour, startMinute] = avail.startTime.split(':').map(Number);
        const [endHour, endMinute] = avail.endTime.split(':').map(Number);
        
        // Generate time slots for this availability window
        const slotStart = new Date(date);
        slotStart.setHours(startHour, startMinute, 0, 0);
        
        const slotEnd = new Date(date);
        slotEnd.setHours(endHour, endMinute, 0, 0);
        
        // Generate 30-minute slots
        for (let slotTime = new Date(slotStart); slotTime < slotEnd; slotTime.setMinutes(slotTime.getMinutes() + 30)) {
          const slotEndTime = new Date(slotTime.getTime() + duration * 60000);
          
          // Skip if slot would extend beyond availability window
          if (slotEndTime > slotEnd) continue;
          
          // Skip past slots (must be at least 2 hours in the future)
          const now = new Date();
          const minBookingTime = new Date(now.getTime() + 2 * 60 * 60 * 1000);
          if (slotTime < minBookingTime) continue;
          
          const slotId = `${therapistId}-${slotTime.toISOString()}`;
          const timeString = slotTime.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
          });
          
          // Check if slot is available
          let available = true;
          
          // Check against unavailable slots
          for (const unavailable of unavailableSlots) {
            if (slotTime >= unavailable.startDateTime && slotTime < unavailable.endDateTime) {
              available = false;
              break;
            }
          }
          
          // Check against existing sessions
          if (available) {
            for (const session of existingSessions) {
              const sessionEnd = new Date(session.scheduledAt.getTime() + session.duration * 60000);
              if (slotTime < sessionEnd && slotEndTime > session.scheduledAt) {
                available = false;
                break;
              }
            }
          }
          
          slots.push({
            id: slotId,
            time: timeString,
            available,
            therapistId,
            datetime: slotTime.toISOString(),
          });
        }
      }
    }
    
    // Sort slots by datetime
    slots.sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime());
    
    res.status(200).json({ slots });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.issues });
    }
    
    console.error('Slots API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}