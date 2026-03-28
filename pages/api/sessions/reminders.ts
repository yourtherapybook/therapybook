import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { sendSessionReminder } from '../../../lib/resend';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authHeader = req.headers.authorization;
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized cron invocation' });
  }

  try {
    // This endpoint would typically be called by a cron job or scheduled task
    const now = new Date();
    const appUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

    // Find sessions that need 24-hour reminders
    const sessions24h = await prisma.session.findMany({
      where: {
        status: 'SCHEDULED',
        scheduledAt: {
          gte: new Date(now.getTime() + 23 * 60 * 60 * 1000), // 23 hours from now
          lte: new Date(now.getTime() + 25 * 60 * 60 * 1000), // 25 hours from now
        },
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
      },
    });

    // Find sessions that need 1-hour reminders
    const sessions1h = await prisma.session.findMany({
      where: {
        status: 'SCHEDULED',
        scheduledAt: {
          gte: new Date(now.getTime() + 30 * 60 * 1000), // 30 minutes from now
          lte: new Date(now.getTime() + 90 * 60 * 1000), // 90 minutes from now
        },
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
      },
    });

    const reminderResults = [];

    // Send 24-hour reminders
    for (const session of sessions24h) {
      try {
        const sessionTime = session.scheduledAt.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });

        await sendSessionReminder(
          session.client.email,
          `${session.client.firstName} ${session.client.lastName}`,
          `${session.therapist.firstName} ${session.therapist.lastName}`,
          sessionTime,
          session.meetingUrl || `${appUrl}/session/${session.id}`,
          24
        );

        reminderResults.push({
          sessionId: session.id,
          type: '24h',
          status: 'sent',
          email: session.client.email
        });
      } catch (error) {
        console.error(`Failed to send 24h reminder for session ${session.id}:`, error);
        reminderResults.push({
          sessionId: session.id,
          type: '24h',
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // Send 1-hour reminders
    for (const session of sessions1h) {
      try {
        const sessionTime = session.scheduledAt.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });

        await sendSessionReminder(
          session.client.email,
          `${session.client.firstName} ${session.client.lastName}`,
          `${session.therapist.firstName} ${session.therapist.lastName}`,
          sessionTime,
          session.meetingUrl || `${appUrl}/session/${session.id}`,
          1
        );

        reminderResults.push({
          sessionId: session.id,
          type: '1h',
          status: 'sent',
          email: session.client.email
        });
      } catch (error) {
        console.error(`Failed to send 1h reminder for session ${session.id}:`, error);
        reminderResults.push({
          sessionId: session.id,
          type: '1h',
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    res.status(200).json({
      message: 'Reminder processing completed',
      results: reminderResults,
      stats: {
        sessions24h: sessions24h.length,
        sessions1h: sessions1h.length,
        totalSent: reminderResults.filter(r => r.status === 'sent').length,
        totalFailed: reminderResults.filter(r => r.status === 'failed').length,
      }
    });
  } catch (error) {
    console.error('Reminder system error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
