import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { TransactionService } from '@/lib/services/TransactionService';

const updateUserSchema = z.object({
    userId: z.string().cuid(),
    role: z.enum(['CLIENT', 'TRAINEE', 'SUPERVISOR', 'ADMIN']).optional(),
    emailVerified: z.boolean().optional(),
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
        const [users, total] = await Promise.all([
            prisma.user.findMany({
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    role: true,
                    emailVerified: true,
                    createdAt: true,
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.user.count(),
        ]);

        return NextResponse.json({
            users,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        });
    } catch (error) {
        console.error('Admin users error:', error);
        return NextResponse.json({ error: 'Failed to load users' }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Cryptographic boundary violation' }, { status: 403 });
    }

    try {
        const body = await request.json();
        const validatedData = updateUserSchema.parse(body);

        const updatedUser = await TransactionService.executeWithAudit(
            'ADMIN_USER_UPDATE',
            session.user.id,
            'User',
            async (tx: any) => {
                const user = await tx.user.update({
                    where: { id: validatedData.userId },
                    data: {
                        ...(validatedData.role ? { role: validatedData.role } : {}),
                        ...(validatedData.emailVerified !== undefined
                            ? { emailVerified: validatedData.emailVerified ? new Date() : null }
                            : {}),
                    },
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        role: true,
                        emailVerified: true,
                        createdAt: true,
                    },
                });

                return {
                    entityId: validatedData.userId,
                    payload: validatedData,
                    returnedData: user,
                };
            }
        );

        return NextResponse.json({ user: updatedUser, message: 'User updated successfully' });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Validation error', details: error.issues }, { status: 400 });
        }

        console.error('Admin user update error:', error);
        return NextResponse.json({ error: 'Internal pipeline collapse' }, { status: 500 });
    }
}
