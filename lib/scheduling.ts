import { prisma } from './prisma';

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

  const slots: GeneratedSlot[] = [];

  for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
    const dateForDay = new Date(date);
    const dayOfWeek = dateForDay.getDay();
    const dayAvailability = availability.filter((entry) => entry.dayOfWeek === dayOfWeek);

    for (const entry of dayAvailability) {
      if (entry.startDate && new Date(entry.startDate) > dateForDay) continue;
      if (entry.endDate && new Date(entry.endDate) < dateForDay) continue;

      const [startHour, startMinute] = entry.startTime.split(':').map(Number);
      const [endHour, endMinute] = entry.endTime.split(':').map(Number);

      const slotStart = new Date(dateForDay);
      slotStart.setHours(startHour, startMinute, 0, 0);

      const slotBoundary = new Date(dateForDay);
      slotBoundary.setHours(endHour, endMinute, 0, 0);

      for (let slotTime = new Date(slotStart); slotTime < slotBoundary; slotTime.setMinutes(slotTime.getMinutes() + 30)) {
        const slotEndTime = new Date(slotTime.getTime() + duration * 60000);

        if (slotEndTime > slotBoundary) continue;

        const now = new Date();
        const minBookingTime = new Date(now.getTime() + 2 * 60 * 60 * 1000);
        if (slotTime < minBookingTime) continue;

        let available = true;

        for (const unavailable of unavailableSlots) {
          if (slotTime < unavailable.endDateTime && slotEndTime > unavailable.startDateTime) {
            available = false;
            break;
          }
        }

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
          id: `${therapistId}-${slotTime.toISOString()}`,
          time: slotTime.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          }),
          available,
          therapistId,
          datetime: slotTime.toISOString(),
        });
      }
    }
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
