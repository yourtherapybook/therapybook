import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { sendEmail, APP_URL } from '../../../lib/email';

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
    const now = new Date();
    const appUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const results: { sessionId: string; type: string; recipient: string; status: string }[] = [];

    // 24-hour reminders: sessions 23–25h from now, not already sent
    const sessions24h = await prisma.session.findMany({
      where: {
        status: 'SCHEDULED',
        reminder24hSentAt: null,
        scheduledAt: {
          gte: new Date(now.getTime() + 23 * 60 * 60 * 1000),
          lte: new Date(now.getTime() + 25 * 60 * 60 * 1000),
        },
      },
      include: {
        client: { select: { firstName: true, lastName: true, email: true } },
        therapist: { select: { firstName: true, lastName: true, email: true } },
      },
    });

    // 1-hour reminders: sessions 30–90min from now, not already sent
    const sessions1h = await prisma.session.findMany({
      where: {
        status: 'SCHEDULED',
        reminder1hSentAt: null,
        scheduledAt: {
          gte: new Date(now.getTime() + 30 * 60 * 1000),
          lte: new Date(now.getTime() + 90 * 60 * 1000),
        },
      },
      include: {
        client: { select: { firstName: true, lastName: true, email: true } },
        therapist: { select: { firstName: true, lastName: true, email: true } },
      },
    });

    // Send 24h reminders to BOTH parties
    for (const session of sessions24h) {
      const sessionTime = session.scheduledAt.toLocaleTimeString('en-US', {
        hour: '2-digit', minute: '2-digit', hour12: true,
      });
      const meetingUrl = session.meetingUrl || `${appUrl}/session/${session.id}`;
      const clientName = `${session.client.firstName} ${session.client.lastName}`;
      const therapistName = `${session.therapist.firstName} ${session.therapist.lastName}`;

      // Notify client
      try {
        await sendEmail(session.client.email, 'SESSION_REMINDER', { recipientName: clientName, otherPartyName: therapistName, sessionTime, hoursUntil: 24, sessionType: (session as any).type || 'ONLINE', sessionUrl: meetingUrl });
        results.push({ sessionId: session.id, type: '24h', recipient: 'client', status: 'sent' });
      } catch {
        results.push({ sessionId: session.id, type: '24h', recipient: 'client', status: 'failed' });
      }

      // Notify therapist
      try {
        await sendEmail(session.therapist.email, 'SESSION_REMINDER', { recipientName: therapistName, otherPartyName: clientName, sessionTime, hoursUntil: 24, sessionType: (session as any).type || 'ONLINE', sessionUrl: meetingUrl });
        results.push({ sessionId: session.id, type: '24h', recipient: 'therapist', status: 'sent' });
      } catch {
        results.push({ sessionId: session.id, type: '24h', recipient: 'therapist', status: 'failed' });
      }

      // Mark as sent (idempotent flag)
      await prisma.session.update({
        where: { id: session.id },
        data: { reminder24hSentAt: now },
      });
    }

    // Send 1h reminders to BOTH parties
    for (const session of sessions1h) {
      const sessionTime = session.scheduledAt.toLocaleTimeString('en-US', {
        hour: '2-digit', minute: '2-digit', hour12: true,
      });
      const meetingUrl = session.meetingUrl || `${appUrl}/session/${session.id}`;
      const clientName = `${session.client.firstName} ${session.client.lastName}`;
      const therapistName = `${session.therapist.firstName} ${session.therapist.lastName}`;

      try {
        await sendEmail(session.client.email, 'SESSION_REMINDER', { recipientName: clientName, otherPartyName: therapistName, sessionTime, hoursUntil: 1, sessionType: (session as any).type || 'ONLINE', sessionUrl: meetingUrl });
        results.push({ sessionId: session.id, type: '1h', recipient: 'client', status: 'sent' });
      } catch {
        results.push({ sessionId: session.id, type: '1h', recipient: 'client', status: 'failed' });
      }

      try {
        await sendEmail(session.therapist.email, 'SESSION_REMINDER', { recipientName: therapistName, otherPartyName: clientName, sessionTime, hoursUntil: 1, sessionType: (session as any).type || 'ONLINE', sessionUrl: meetingUrl });
        results.push({ sessionId: session.id, type: '1h', recipient: 'therapist', status: 'sent' });
      } catch {
        results.push({ sessionId: session.id, type: '1h', recipient: 'therapist', status: 'failed' });
      }

      await prisma.session.update({
        where: { id: session.id },
        data: { reminder1hSentAt: now },
      });
    }

    res.status(200).json({
      message: 'Reminder processing completed',
      stats: {
        sessions24h: sessions24h.length,
        sessions1h: sessions1h.length,
        sent: results.filter((r) => r.status === 'sent').length,
        failed: results.filter((r) => r.status === 'failed').length,
      },
      results,
    });
  } catch (error) {
    console.error('Reminder system error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
