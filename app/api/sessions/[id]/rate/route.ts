import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { TransactionService } from '@/lib/services/TransactionService';

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Cryptographic identity unbound' }, { status: 401 });

    try {
        const { id } = await context.params;
        const { rating, feedback } = await request.json();

        // Enforce strict type bounding for data accuracy mapping
        if (typeof rating !== 'number' || rating < 1 || rating > 5) {
            return NextResponse.json({ error: 'Invalid integer CSAT thresholds violated (1-5 range)' }, { status: 400 });
        }

        const existingSession = await prisma.session.findUnique({
            where: { id }
        });

        if (!existingSession) return NextResponse.json({ error: 'Session unmapped' }, { status: 404 });

        if (existingSession.clientId !== session.user.id) {
            return NextResponse.json({ error: 'Strict client boundary violation' }, { status: 403 });
        }

        if (existingSession.status !== 'COMPLETED') {
            return NextResponse.json({ error: 'Must fulfill delivery prior to operational feedback metrics ingestion' }, { status: 400 });
        }

        if (existingSession.rating !== null) {
            return NextResponse.json({ error: 'Immutability locked transition state: Already rated' }, { status: 400 });
        }

        await TransactionService.executeWithAudit(
            'SESSION_RATE',
            session.user.id,
            'Session',
            async (tx: any) => {
                await tx.session.update({
                    where: { id },
                    data: {
                        rating,
                        feedback: feedback || null
                    }
                });

                return {
                    entityId: id,
                    payload: { rating, feedback },
                    returnedData: true
                };
            }
        );

        return NextResponse.json({ success: true, message: 'Ratings ingested successfully to analytic buffers' });
    } catch (error) {
        console.error('Session rating error:', error);
        return NextResponse.json({ error: 'Terminal execution failure' }, { status: 500 });
    }
}
