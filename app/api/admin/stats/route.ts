import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      clientCount,
      traineeCount,
      supervisorCount,
      totalApplications,
      pendingApplications,
      underReviewApplications,
      approvedApplications,
      totalSessions,
      scheduledSessions,
      completedSessions,
      cancelledSessions,
      noShowSessions,
      totalPayments,
      completedPayments,
      refundedPayments,
      pendingDocuments,
      totalDocuments,
      recentAuditCount,
      supervisorAssignments,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'CLIENT' } }),
      prisma.user.count({ where: { role: 'TRAINEE' } }),
      prisma.user.count({ where: { role: 'SUPERVISOR' } }),
      prisma.traineeApplication.count(),
      prisma.traineeApplication.count({ where: { status: 'SUBMITTED' } }),
      prisma.traineeApplication.count({ where: { status: 'UNDER_REVIEW' } }),
      prisma.traineeApplication.count({ where: { status: 'APPROVED' } }),
      prisma.session.count(),
      prisma.session.count({ where: { status: 'SCHEDULED' } }),
      prisma.session.count({ where: { status: 'COMPLETED' } }),
      prisma.session.count({ where: { status: 'CANCELLED' } }),
      prisma.session.count({ where: { status: 'NO_SHOW' } }),
      prisma.payment.count(),
      prisma.payment.count({ where: { status: 'COMPLETED' } }),
      prisma.payment.count({ where: { status: 'REFUNDED' } }),
      prisma.document.count({ where: { status: 'PENDING' } }),
      prisma.document.count(),
      prisma.auditLog.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      prisma.supervisorAssignment.count({ where: { isActive: true } }),
    ]);

    // Calculate GMV from completed payments
    const gmvResult = await prisma.payment.aggregate({
      where: { status: 'COMPLETED' },
      _sum: { amount: true },
    });
    const gmv = Number(gmvResult._sum.amount || 0);

    const refundTotal = await prisma.payment.aggregate({
      where: { status: 'REFUNDED' },
      _sum: { amount: true },
    });
    const totalRefunded = Number(refundTotal._sum.amount || 0);

    return NextResponse.json({
      stats: {
        users: { total: totalUsers, clients: clientCount, trainees: traineeCount, supervisors: supervisorCount },
        applications: { total: totalApplications, pending: pendingApplications, underReview: underReviewApplications, approved: approvedApplications },
        sessions: { total: totalSessions, scheduled: scheduledSessions, completed: completedSessions, cancelled: cancelledSessions, noShow: noShowSessions },
        payments: { total: totalPayments, completed: completedPayments, refunded: refundedPayments, gmv, totalRefunded },
        documents: { total: totalDocuments, pending: pendingDocuments },
        supervision: { activeAssignments: supervisorAssignments },
        audit: { recentEvents: recentAuditCount },
      },
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json({ error: 'Failed to load stats' }, { status: 500 });
  }
}
