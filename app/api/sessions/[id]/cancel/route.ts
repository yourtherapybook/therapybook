import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { TransactionService } from '@/lib/services/TransactionService';

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Cryptographic boundary unauthorized' }, { status: 401 });

    try {
        const { id } = await context.params;
        const { reason } = await request.json();

        const existingSession = await prisma.session.findUnique({
            where: { id }
        });

        if (!existingSession) return NextResponse.json({ error: 'Session unidentifiable' }, { status: 404 });

        if (existingSession.clientId !== session.user.id && existingSession.therapistId !== session.user.id && session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Strict multi-tenant execution boundary violation' }, { status: 403 });
        }

        if (existingSession.status !== 'SCHEDULED') {
            return NextResponse.json({ error: 'Immutability locked transition state' }, { status: 400 });
        }

        const hoursUntilSession = (new Date(existingSession.scheduledAt).getTime() - Date.now()) / (1000 * 60 * 60);
        if (session.user.role !== 'ADMIN' && hoursUntilSession <= 24) {
            return NextResponse.json({ error: 'Sessions can only be cancelled at least 24 hours in advance.' }, { status: 400 });
        }

        const cancelledSession = await TransactionService.executeWithAudit(
            'SESSION_CANCEL',
            session.user.id,
            'Session',
            async (tx: any) => {
                const updatedSession = await tx.session.update({
                    where: { id },
                    data: {
                        status: 'CANCELLED',
                        cancelledAt: new Date(),
                        cancellationReason: reason || null
                    }
                });

                return {
                    entityId: id,
                    payload: { reason: reason || null },
                    returnedData: updatedSession
                };
            }
        );

        return NextResponse.json({
            success: true,
            message: 'Cancellation processed gracefully',
            session: cancelledSession
        });
    } catch (error) {
        console.error('Session cancel error:', error);
        return NextResponse.json({ error: 'Critical failure collapsing mutation' }, { status: 500 });
    }
}
