import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { createHash } from 'crypto';
import SessionWorkspace from '@/components/Booking/SessionWorkspace';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * Generate a deterministic room password from the session ID and a server secret.
 * This ensures the password is stable (same for all participants) but not guessable
 * from the session ID alone.
 */
function generateRoomPassword(sessionId: string): string {
  const secret = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET || 'therapybook-session-salt';
  return createHash('sha256')
    .update(`${sessionId}:${secret}`)
    .digest('hex')
    .slice(0, 12);
}

export default async function SessionRoomPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const sessionUser = await getServerSession(authOptions);

  if (!sessionUser) {
    redirect(`/auth/signin?callbackUrl=${encodeURIComponent(`/session/${id}`)}`);
  }
  const isAdmin = sessionUser.user.role === 'ADMIN';

  const therapySession = await prisma.session.findFirst({
    where: isAdmin
      ? { id }
      : {
          id,
          OR: [
            { clientId: sessionUser.user.id },
            { therapistId: sessionUser.user.id },
          ],
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
      payment: {
        select: {
          status: true,
        },
      },
    },
  });

  if (!therapySession) {
    redirect('/unauthorized');
  }

  // Log session room access for audit trail
  try {
    await prisma.auditLog.create({
      data: {
        action: 'SESSION_ROOM_ACCESSED',
        userId: sessionUser.user.id,
        entityId: therapySession.id,
        entityType: 'Session',
        details: {
          accessedBy: sessionUser.user.id,
          accessedByRole: sessionUser.user.role,
          sessionStatus: therapySession.status,
          paymentStatus: therapySession.payment?.status || null,
        },
      },
    });
  } catch {
    // Non-blocking — audit failure should not prevent room access
    console.error('Failed to log session room access');
  }

  const displayName = `${sessionUser.user.firstName} ${sessionUser.user.lastName}`;
  const userRole = sessionUser.user.id === therapySession.therapist.id ? 'therapist' : 'client';

  // Room credentials are NEVER passed from server props.
  // The client must request them via POST /api/sessions/[id]/room
  // which enforces payment + time-window gates server-side.

  return (
    <div className="min-h-screen bg-neutral-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SessionWorkspace
          initialSession={{
            id: therapySession.id,
            clientId: therapySession.clientId,
            therapistId: therapySession.therapistId,
            status: therapySession.status,
            scheduledAt: therapySession.scheduledAt.toISOString(),
            duration: therapySession.duration,
            price: Number(therapySession.price),
            currency: therapySession.currency,
            notes: therapySession.notes,
            rating: therapySession.rating,
            feedback: therapySession.feedback,
            client: therapySession.client,
            therapist: therapySession.therapist,
          }}
          userRole={userRole}
          roomUrl=""
          displayName={displayName}
          userEmail={sessionUser.user.email || undefined}
          paymentStatus={therapySession.payment?.status || null}
        />
      </div>
    </div>
  );
}
