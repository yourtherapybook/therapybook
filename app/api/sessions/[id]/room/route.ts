import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * Create or retrieve a Daily.co room for a session.
 * Room is created on-demand and the URL is stored on the session record.
 *
 * Requires DAILY_API_KEY env variable.
 * Configure DAILY_DOMAIN for custom domain or leave empty for default.
 *
 * Daily.co free tier: 10,000 participant minutes/month.
 * EU region available with ?properties[geo]=eu setting.
 */
export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await context.params;

    // Verify user is a participant or admin
    const isAdmin = session.user.role === 'ADMIN';
    const therapySession = await prisma.session.findFirst({
      where: isAdmin
        ? { id }
        : {
            id,
            OR: [
              { clientId: session.user.id },
              { therapistId: session.user.id },
            ],
          },
      select: {
        id: true,
        meetingUrl: true,
        scheduledAt: true,
        duration: true,
        status: true,
      },
    });

    if (!therapySession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // If room URL already exists and is a Daily URL, return it
    if (therapySession.meetingUrl?.includes('daily.co')) {
      return NextResponse.json({
        roomUrl: therapySession.meetingUrl,
        provider: 'daily',
      });
    }

    // Create a new Daily room
    const apiKey = process.env.DAILY_API_KEY;
    if (!apiKey) {
      // Fallback to Jitsi if no Daily API key configured
      const jitsiDomain = process.env.NEXT_PUBLIC_JITSI_DOMAIN || 'meet.jit.si';
      const roomName = `TherapyBook-${therapySession.id}`;
      return NextResponse.json({
        roomUrl: `https://${jitsiDomain}/${roomName}`,
        provider: 'jitsi',
      });
    }

    const roomName = `tb-${therapySession.id}`.slice(0, 40);
    const expiresAt = new Date(
      new Date(therapySession.scheduledAt).getTime() +
        (therapySession.duration + 30) * 60 * 1000
    );

    const dailyRes = await fetch('https://api.daily.co/v1/rooms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        name: roomName,
        privacy: 'private',
        properties: {
          exp: Math.floor(expiresAt.getTime() / 1000),
          max_participants: 4, // client + therapist + optional supervisor + admin
          enable_chat: true,
          enable_screenshare: true,
          geo: 'eu', // EU data residency
          lang: 'en',
        },
      }),
    });

    if (!dailyRes.ok) {
      const errData = await dailyRes.json().catch(() => null);
      console.error('Daily room creation failed:', errData);
      // Fallback to Jitsi
      const jitsiDomain = process.env.NEXT_PUBLIC_JITSI_DOMAIN || 'meet.jit.si';
      return NextResponse.json({
        roomUrl: `https://${jitsiDomain}/TherapyBook-${therapySession.id}`,
        provider: 'jitsi',
      });
    }

    const roomData = await dailyRes.json();
    const roomUrl = roomData.url;

    // Store the room URL on the session
    await prisma.session.update({
      where: { id: therapySession.id },
      data: { meetingUrl: roomUrl },
    });

    return NextResponse.json({
      roomUrl,
      provider: 'daily',
    });
  } catch (error) {
    console.error('Room provisioning error:', error);
    return NextResponse.json({ error: 'Failed to create room' }, { status: 500 });
  }
}
