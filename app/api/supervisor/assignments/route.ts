import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Only supervisors and admins can view assignments
  if (session.user.role !== 'SUPERVISOR' && session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const where = session.user.role === 'ADMIN'
      ? {} // Admins see all
      : { supervisorId: session.user.id }; // Supervisors see their own

    const assignments = await prisma.supervisorAssignment.findMany({
      where,
      include: {
        supervisor: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        trainee: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ assignments });
  } catch (error) {
    console.error('Supervisor assignments error:', error);
    return NextResponse.json({ error: 'Failed to fetch assignments' }, { status: 500 });
  }
}
