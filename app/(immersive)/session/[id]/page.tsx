import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import SessionWorkspace from '@/components/Booking/SessionWorkspace';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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

  const jitsiDomain = process.env.NEXT_PUBLIC_JITSI_DOMAIN || 'meet.jit.si';
  const roomUrl = `https://${jitsiDomain}/TherapyBook-${therapySession.id}`;
  const userRole = sessionUser.user.id === therapySession.therapist.id ? 'therapist' : 'client';

  return (
    <div className="min-h-screen bg-neutral-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SessionWorkspace
          initialSession={{
            ...therapySession,
            scheduledAt: therapySession.scheduledAt.toISOString(),
          }}
          userRole={userRole}
          roomUrl={roomUrl}
          paymentStatus={therapySession.payment?.status || null}
        />
      </div>
    </div>
  );
}
