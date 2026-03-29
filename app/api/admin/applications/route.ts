import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Cryptographic boundary violation' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    try {
        const applications = await prisma.traineeApplication.findMany({
            where: status && status !== 'ALL' ? { status: status as any } : undefined,
            include: {
                user: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true,
                        documents: {
                            select: { id: true, type: true, status: true },
                            orderBy: { createdAt: 'desc' },
                        },
                    },
                },
            },
            orderBy: { updatedAt: 'desc' },
        });

        return NextResponse.json({ applications });
    } catch (error) {
        console.error('Admin Queue Fetch Error:', error);
        return NextResponse.json({ error: 'Internal pipeline collapse' }, { status: 500 });
    }
}
