import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionPrice } from '@/lib/pricing';

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const provider = await prisma.user.findFirst({
      where: {
        id,
        role: 'TRAINEE',
        traineeApplication: { status: 'APPROVED' },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        image: true,
        createdAt: true,
        availability: {
          where: { isActive: true },
          select: {
            id: true,
            dayOfWeek: true,
            startTime: true,
            endTime: true,
          },
          orderBy: { dayOfWeek: 'asc' },
        },
        traineeApplication: {
          select: {
            title: true,
            therapistType: true,
            institutionOfStudy: true,
            skillsAcquired: true,
            specialties: true,
            treatmentOrientation: true,
            modality: true,
            ageGroups: true,
            languages: true,
            ethnicitiesServed: true,
            personalStatement: true,
            profilePhotoUrl: true,
            approvedAt: true,
          },
        },
        // Supervisor assignment (if any)
        traineeAssignments: {
          where: { isActive: true },
          select: {
            supervisor: {
              select: { firstName: true, lastName: true },
            },
          },
          take: 1,
        },
        // Session stats
        _count: {
          select: {
            therapistSessions: {
              where: { status: 'COMPLETED' },
            },
          },
        },
      },
    });

    if (!provider || !provider.traineeApplication) {
      return NextResponse.json({ error: 'Provider not found' }, { status: 404 });
    }

    // Aggregate rating
    const ratingAgg = await prisma.session.aggregate({
      where: { therapistId: id, rating: { not: null } },
      _avg: { rating: true },
      _count: { rating: true },
    });

    const app = provider.traineeApplication;
    const supervisor = provider.traineeAssignments?.[0]?.supervisor;

    const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    return NextResponse.json({
      provider: {
        id: provider.id,
        name: `${provider.firstName} ${provider.lastName}`,
        credentials: [app.title, app.therapistType].filter(Boolean).join(' ') || 'Trainee Therapist',
        image: provider.image || app.profilePhotoUrl || '',
        institutionOfStudy: app.institutionOfStudy || '',
        skillsAcquired: app.skillsAcquired || [],
        specialties: app.specialties || [],
        treatmentOrientation: app.treatmentOrientation || [],
        modality: app.modality || [],
        ageGroups: app.ageGroups || [],
        languages: app.languages || [],
        ethnicitiesServed: app.ethnicitiesServed || [],
        bio: app.personalStatement || '',
        hourlyRate: await getSessionPrice(),
        availability: provider.availability.length > 0 ? 'available' : 'offline',
        completedSessions: provider._count.therapistSessions,
        averageRating: ratingAgg._avg.rating ? Number(ratingAgg._avg.rating.toFixed(1)) : null,
        ratingCount: ratingAgg._count.rating,
        memberSince: provider.createdAt,
        approvedAt: app.approvedAt,
        supervisor: supervisor
          ? `${supervisor.firstName} ${supervisor.lastName}`
          : null,
        schedule: provider.availability.map((slot) => ({
          day: DAY_NAMES[slot.dayOfWeek] || `Day ${slot.dayOfWeek}`,
          start: slot.startTime,
          end: slot.endTime,
        })),
      },
    });
  } catch (error) {
    console.error('Provider detail error:', error);
    return NextResponse.json({ error: 'Failed to load provider' }, { status: 500 });
  }
}
