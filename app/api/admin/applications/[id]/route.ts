import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendApplicationStatusUpdate, sendApplicationUnderReview } from '@/lib/resend';
import { TransactionService } from '@/lib/services/TransactionService';

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Cryptographic boundary violation' }, { status: 403 });
    }

    try {
        const { id } = await context.params;

        const app = await prisma.traineeApplication.findUnique({
            where: { id },
            include: {
                referrals: {
                    orderBy: { createdAt: 'asc' }
                },
                user: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true,
                        documents: {
                            orderBy: { createdAt: 'desc' }
                        }
                    }
                }
            }
        });

        if (!app) return NextResponse.json({ error: 'Entity missing' }, { status: 404 });

        return NextResponse.json({ application: app });
    } catch (e) {
        return NextResponse.json({ error: 'Engine fault' }, { status: 500 });
    }
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Cryptographic boundary violation' }, { status: 403 });
    }

    try {
        const { id } = await context.params;
        const { decision, reason } = await request.json() as {
            decision?: 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';
            reason?: string;
        };

        if (!decision || !['UNDER_REVIEW', 'APPROVED', 'REJECTED'].includes(decision)) {
            return NextResponse.json({ error: 'Invalid application decision' }, { status: 400 });
        }

        if (decision === 'REJECTED' && !reason?.trim()) {
            return NextResponse.json({ error: 'Rejection reason is required' }, { status: 400 });
        }

        if (decision === 'APPROVED' && !reason?.trim()) {
            return NextResponse.json({ error: 'Approval reasoning is required for audit' }, { status: 400 });
        }

        const existingApp = await prisma.traineeApplication.findUnique({
            where: { id },
            include: {
                user: {
                    include: {
                        documents: true,
                    },
                },
            },
        });

        if (!existingApp) return NextResponse.json({ error: 'Application not found' }, { status: 404 });
        if (existingApp.status !== 'SUBMITTED' && existingApp.status !== 'UNDER_REVIEW') {
            return NextResponse.json({ error: 'Application is in a terminal state and cannot be changed' }, { status: 400 });
        }

        // Enforce approval prerequisites
        if (decision === 'APPROVED') {
            const agreements = [
                existingApp.paymentAgreement,
                existingApp.responseTimeAgreement,
                existingApp.minimumClientCommitment,
                existingApp.termsOfService,
            ];
            if (!agreements.every(Boolean)) {
                return NextResponse.json(
                    { error: 'Cannot approve: applicant has not accepted all required agreements' },
                    { status: 400 }
                );
            }

            const verifiedDocs = existingApp.user.documents.filter(
                (d) => d.status === 'VERIFIED' && d.type !== 'PROFILE_PHOTO'
            );
            if (verifiedDocs.length === 0) {
                return NextResponse.json(
                    { error: 'Cannot approve: at least one credential document must be verified' },
                    { status: 400 }
                );
            }

            const pendingDocs = existingApp.user.documents.filter(
                (d) => d.status === 'PENDING' && d.type !== 'PROFILE_PHOTO'
            );
            if (pendingDocs.length > 0) {
                return NextResponse.json(
                    { error: 'Cannot approve: all uploaded documents must be reviewed before approval' },
                    { status: 400 }
                );
            }
        }

        const resolvedAt = new Date();
        const updatedApplication = await TransactionService.executeWithAudit(
            'ADMIN_APPLICATION_DECISION',
            session.user.id,
            'TraineeApplication',
            async (tx: any) => {
                const nextApplication = await tx.traineeApplication.update({
                    where: { id },
                    data: {
                        status: decision as any,
                        rejectionReason: decision === 'REJECTED' ? reason?.trim() || null : null,
                        approvalReason: decision === 'APPROVED' ? reason?.trim() || null : null,
                        reviewedAt: resolvedAt,
                        approvedAt: decision === 'APPROVED' ? resolvedAt : null,
                    },
                });

                if (decision === 'APPROVED') {
                    await tx.user.update({
                        where: { id: existingApp.userId },
                        data: { role: 'TRAINEE' },
                    });
                }

                return {
                    entityId: id,
                    payload: { decision, reason: reason || null, userId: existingApp.userId },
                    returnedData: nextApplication,
                };
            }
        );

        // Broadcast resolution downstream to the user
        try {
            if (decision === 'UNDER_REVIEW') {
                await sendApplicationUnderReview(existingApp.user.email, existingApp.user.firstName);
            } else {
                await sendApplicationStatusUpdate(existingApp.user.email, existingApp.user.firstName, decision);
            }
        } catch {
            console.warn('Silent email drop during administrative approval phase.');
        }

        return NextResponse.json({ success: true, application: updatedApplication });
    } catch (error) {
        console.error('Decision mutation fault:', error);
        return NextResponse.json({ error: 'Data transition abort' }, { status: 500 });
    }
}
