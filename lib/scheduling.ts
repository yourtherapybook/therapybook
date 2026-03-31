import { prisma } from './prisma';
import { ConfigService } from './services/ConfigService';

export interface GeneratedSlot {
  id: string;
  time: string;
  available: boolean;
  therapistId: string;
  datetime: string;
}

interface TherapistSlotOptions {
  therapistId: string;
  startDate: Date;
  endDate: Date;
  duration: number;
}

// Buffer time between sessions (minutes)
const BUFFER_MINUTES = 10;
// Slot stepping (minutes) — align to 30-min grid
const STEP_MINUTES = 30;
// Minimum lead time before booking (hours)
const MIN_LEAD_HOURS = 2;

export async function getTherapistSlots({
  therapistId,
  startDate,
  endDate,
  duration,
}: TherapistSlotOptions): Promise<GeneratedSlot[]> {
  const availability = await prisma.therapistAvailability.findMany({
    where: {
      therapistId,
      isActive: true,
    },
  });

  const unavailableSlots = await prisma.unavailableSlot.findMany({
    where: {
      therapistId,
      startDateTime: { lte: endDate },
      endDateTime: { gte: startDate },
    },
  });

  // Include sessions that aren't cancelled (SCHEDULED, IN_PROGRESS, and completed within window)
  const existingSessions = await prisma.session.findMany({
    where: {
      therapistId,
      scheduledAt: {
        gte: startDate,
        lte: endDate,
      },
      status: {
        in: ['SCHEDULED', 'IN_PROGRESS'],
      },
    },
  });

  const now = new Date();
  const minBookingTime = new Date(now.getTime() + MIN_LEAD_HOURS * 60 * 60 * 1000);
  const slots: GeneratedSlot[] = [];
  const seenSlots = new Set<string>(); // Dedupe

  // Iterate day by day
  const current = new Date(startDate);
  current.setHours(0, 0, 0, 0);

  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  while (current <= end) {
    const dayOfWeek = current.getDay();
    const dayAvailability = availability.filter((entry) => entry.dayOfWeek === dayOfWeek);

    for (const entry of dayAvailability) {
      // Check date range validity
      if (entry.startDate && new Date(entry.startDate) > current) continue;
      if (entry.endDate && new Date(entry.endDate) < current) continue;

      const [startHour, startMinute] = entry.startTime.split(':').map(Number);
      const [endHour, endMinute] = entry.endTime.split(':').map(Number);

      // Validate end > start
      if (endHour < startHour || (endHour === startHour && endMinute <= startMinute)) continue;

      const slotStart = new Date(current);
      slotStart.setHours(startHour, startMinute, 0, 0);

      const slotBoundary = new Date(current);
      slotBoundary.setHours(endHour, endMinute, 0, 0);

      // Generate slots at STEP_MINUTES intervals
      const slotTime = new Date(slotStart);
      while (slotTime < slotBoundary) {
        const slotEndTime = new Date(slotTime.getTime() + duration * 60000);
        const slotEndWithBuffer = new Date(slotTime.getTime() + (duration + BUFFER_MINUTES) * 60000);

        // Slot + session must fit within availability window
        if (slotEndTime > slotBoundary) {
          slotTime.setMinutes(slotTime.getMinutes() + STEP_MINUTES);
          continue;
        }

        // Must be in the future with lead time
        if (slotTime < minBookingTime) {
          slotTime.setMinutes(slotTime.getMinutes() + STEP_MINUTES);
          continue;
        }

        // Dedupe
        const slotKey = `${therapistId}-${slotTime.toISOString()}`;
        if (seenSlots.has(slotKey)) {
          slotTime.setMinutes(slotTime.getMinutes() + STEP_MINUTES);
          continue;
        }
        seenSlots.add(slotKey);

        let available = true;

        // Check unavailable periods
        for (const unavailable of unavailableSlots) {
          if (slotTime < unavailable.endDateTime && slotEndTime > unavailable.startDateTime) {
            available = false;
            break;
          }
        }

        // Check existing sessions (with buffer)
        if (available) {
          for (const session of existingSessions) {
            const sessionEnd = new Date(session.scheduledAt.getTime() + (session.duration + BUFFER_MINUTES) * 60000);
            if (slotTime < sessionEnd && slotEndWithBuffer > session.scheduledAt) {
              available = false;
              break;
            }
          }
        }

        slots.push({
          id: slotKey,
          time: `${String(slotTime.getHours()).padStart(2, '0')}:${String(slotTime.getMinutes()).padStart(2, '0')}`,
          available,
          therapistId,
          datetime: slotTime.toISOString(),
        });

        slotTime.setMinutes(slotTime.getMinutes() + STEP_MINUTES);
      }
    }

    // Next day
    current.setDate(current.getDate() + 1);
    current.setHours(0, 0, 0, 0);
  }

  return slots.sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime());
}

export async function validateTherapistSlot({
  therapistId,
  scheduledAt,
  duration,
}: {
  therapistId: string;
  scheduledAt: Date;
  duration: number;
}) {
  const dayStart = new Date(scheduledAt);
  dayStart.setHours(0, 0, 0, 0);

  const dayEnd = new Date(scheduledAt);
  dayEnd.setHours(23, 59, 59, 999);

  const slots = await getTherapistSlots({
    therapistId,
    startDate: dayStart,
    endDate: dayEnd,
    duration,
  });

  return slots.find((slot) => slot.datetime === scheduledAt.toISOString() && slot.available) || null;
}

/**
 * Check if a therapist has any bookable slots within the next N days.
 * Used for directory "available" badge — replaces presence-based check.
 */
export async function hasBookableSlots(
  therapistId: string,
  horizonDays: number = 14
): Promise<{ bookable: boolean; nextAvailableAt: string | null }> {
  const now = new Date();
  const horizon = new Date(now.getTime() + horizonDays * 24 * 60 * 60 * 1000);

  const slots = await getTherapistSlots({
    therapistId,
    startDate: now,
    endDate: horizon,
    duration: 50,
  });

  const firstAvailable = slots.find((s) => s.available);
  return {
    bookable: !!firstAvailable,
    nextAvailableAt: firstAvailable?.datetime || null,
  };
}
