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
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '30')));
    const skip = (page - 1) * limit;

    try {
        const [sessions, total] = await Promise.all([
            prisma.session.findMany({
                include: {
                    client: { select: { id: true, firstName: true, lastName: true, email: true } },
                    therapist: { select: { id: true, firstName: true, lastName: true, email: true } },
                    payment: { select: { id: true, status: true, amount: true, currency: true } },
                },
                orderBy: { scheduledAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.session.count(),
        ]);

        return NextResponse.json({
            sessions,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        });
    } catch (error) {
        console.error('Admin sessions error:', error);
        return NextResponse.json({ error: 'Failed to load sessions' }, { status: 500 });
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
