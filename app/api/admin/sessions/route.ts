import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { TransactionService } from '@/lib/services/TransactionService';

const updateSessionSchema = z.object({
    sessionId: z.string().cuid(),
    status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW']),
});

export async function GET(request: Request) {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Cryptographic boundary violation' }, { status: 403 });
    }

    try {
        const sessions = await prisma.session.findMany({
            include: {
                client: { select: { firstName: true, lastName: true, email: true } },
                therapist: { select: { firstName: true, lastName: true, email: true } },
                payment: { select: { status: true, amount: true, currency: true } }
            },
            orderBy: { scheduledAt: 'desc' },
            take: 100
        });

        return NextResponse.json({ sessions });
    } catch (error) {
        console.error('Admin Queue Fetch Error:', error);
        return NextResponse.json({ error: 'Internal pipeline collapse' }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Cryptographic boundary violation' }, { status: 403 });
    }

    try {
        const body = await request.json();
        const validatedData = updateSessionSchema.parse(body);

        const updatedSession = await TransactionService.executeWithAudit(
            'ADMIN_SESSION_UPDATE',
            session.user.id,
            'Session',
            async (tx: any) => {
                const updated = await tx.session.update({
                    where: { id: validatedData.sessionId },
                    data: {
                        status: validatedData.status,
                        ...(validatedData.status === 'COMPLETED' ? { completedAt: new Date() } : {}),
                        ...(validatedData.status === 'CANCELLED'
                            ? { cancelledAt: new Date(), cancellationReason: 'Cancelled by admin' }
                            : {}),
                    },
                    include: {
                        client: { select: { firstName: true, lastName: true, email: true } },
                        therapist: { select: { firstName: true, lastName: true, email: true } },
                        payment: { select: { status: true, amount: true, currency: true } }
                    }
                });

                return {
                    entityId: validatedData.sessionId,
                    payload: validatedData,
                    returnedData: updated,
                };
            }
        );

        return NextResponse.json({ session: updatedSession, message: 'Session updated successfully' });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Validation error', details: error.issues }, { status: 400 });
        }

        console.error('Admin session update error:', error);
        return NextResponse.json({ error: 'Internal pipeline collapse' }, { status: 500 });
    }
}
