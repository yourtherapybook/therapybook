import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { TransactionService } from '@/lib/services/TransactionService';
import { z } from 'zod';

const assignSchema = z.object({
  supervisorId: z.string().min(1),
  traineeId: z.string().min(1),
});

// GET: List all supervisor assignments (for admin) or list available supervisors
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const listType = searchParams.get('list');

    // ?list=supervisors → return all users with SUPERVISOR role
    if (listType === 'supervisors') {
      const supervisors = await prisma.user.findMany({
        where: { role: 'SUPERVISOR' },
        select: { id: true, firstName: true, lastName: true, email: true },
        orderBy: { firstName: 'asc' },
      });
      return NextResponse.json({ supervisors });
    }

    // Default: return all assignments
    const assignments = await prisma.supervisorAssignment.findMany({
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
    console.error('Supervisor list error:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

// POST: Create a supervisor assignment
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const parsed = assignSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'supervisorId and traineeId are required' }, { status: 400 });
    }

    const { supervisorId, traineeId } = parsed.data;

    // Validate roles
    const [supervisor, trainee] = await Promise.all([
      prisma.user.findUnique({ where: { id: supervisorId }, select: { id: true, role: true } }),
      prisma.user.findUnique({ where: { id: traineeId }, select: { id: true, role: true } }),
    ]);

    if (!supervisor || supervisor.role !== 'SUPERVISOR') {
      return NextResponse.json({ error: 'User is not a supervisor' }, { status: 400 });
    }
    if (!trainee || trainee.role !== 'TRAINEE') {
      return NextResponse.json({ error: 'User is not an approved trainee' }, { status: 400 });
    }

    const assignment = await TransactionService.executeWithAudit(
      'SUPERVISOR_ASSIGNED',
      session.user.id,
      'SupervisorAssignment',
      async (tx: any) => {
        const created = await tx.supervisorAssignment.upsert({
          where: { supervisorId_traineeId: { supervisorId, traineeId } },
          create: { supervisorId, traineeId, isActive: true },
          update: { isActive: true },
          include: {
            supervisor: { select: { firstName: true, lastName: true } },
            trainee: { select: { firstName: true, lastName: true } },
          },
        });

        return {
          entityId: created.id,
          payload: { supervisorId, traineeId },
          returnedData: created,
        };
      }
    );

    return NextResponse.json({ success: true, assignment });
  } catch (error) {
    console.error('Supervisor assign error:', error);
    return NextResponse.json({ error: 'Failed to assign supervisor' }, { status: 500 });
  }
}
