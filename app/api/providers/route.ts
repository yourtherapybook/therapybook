import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionPrice } from '@/lib/pricing';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeMatchData = searchParams.get('includeMatchData') === 'true';

    const providers = await prisma.user.findMany({
      where: {
        role: 'TRAINEE',
        traineeApplication: {
          status: 'APPROVED',
        },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        image: true,
        availability: {
          where: { isActive: true },
          select: {
            id: true,
            ...(includeMatchData ? {
              dayOfWeek: true,
              startTime: true,
              endTime: true,
            } : {}),
          },
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
            personalStatement: true,
            profilePhotoUrl: true,
          },
        },
        // Include supervisor assignment for matching
        ...(includeMatchData ? {
          traineeAssignments: {
            where: { isActive: true },
            select: { id: true },
            take: 1,
          },
          _count: {
            select: {
              therapistSessions: { where: { status: 'COMPLETED' } },
            },
          },
        } : {}),
      },
      orderBy: [
        { firstName: 'asc' },
        { lastName: 'asc' },
      ],
    });

    const sessionPrice = await getSessionPrice();

    // If matching data requested, batch-fetch ratings
    let ratingMap = new Map<string, { avg: number; count: number }>();
    if (includeMatchData) {
      const providerIds = providers.map((p) => p.id);
      if (providerIds.length > 0) {
        const ratings = await prisma.session.groupBy({
          by: ['therapistId'],
          where: {
            therapistId: { in: providerIds },
            rating: { not: null },
          },
          _avg: { rating: true },
          _count: { rating: true },
        });
        for (const r of ratings) {
          ratingMap.set(r.therapistId, {
            avg: Number(r._avg.rating?.toFixed(1) || 0),
            count: r._count.rating,
          });
        }
      }
    }

    const transformedProviders = providers
      .filter((provider) => provider.traineeApplication)
      .map((provider) => {
        const application = provider.traineeApplication!;
        const fullName = `${provider.firstName} ${provider.lastName}`.trim();

        const base: Record<string, any> = {
          id: provider.id,
          name: fullName,
          credentials: [application.title, application.therapistType].filter(Boolean).join(' ') || 'Trainee Therapist',
          image: provider.image || application.profilePhotoUrl || '',
          institutionOfStudy: application.institutionOfStudy || '',
          skillsAcquired: application.skillsAcquired || [],
          specializations: application.specialties || [],
          treatmentOrientation: application.treatmentOrientation || [],
          modality: application.modality || [],
          ageGroups: application.ageGroups || [],
          languages: application.languages || [],
          hourlyRate: sessionPrice,
          availability: provider.availability.length > 0 ? 'available' : 'offline',
          bio: application.personalStatement || 'Profile details will be available once this trainee completes onboarding.',
        };

        // Add matching metadata if requested
        if (includeMatchData) {
          const rating = ratingMap.get(provider.id);
          base.averageRating = rating?.avg || null;
          base.ratingCount = rating?.count || 0;
          base.hasSupervisor = ((provider as any).traineeAssignments?.length || 0) > 0;
          base.availabilitySlots = provider.availability.map((s: any) => ({
            dayOfWeek: s.dayOfWeek,
            startTime: s.startTime,
            endTime: s.endTime,
          }));
        }

        return base;
      });

    const filters = {
      issueTypes: Array.from(
        new Set(transformedProviders.flatMap((provider) => provider.specializations as string[]))
      ).sort(),
      languages: Array.from(
        new Set(transformedProviders.flatMap((provider) => provider.languages as string[]))
      ).sort(),
    };

    return NextResponse.json({ providers: transformedProviders, filters });
  } catch (error) {
    console.error('Provider directory error:', error);
    return NextResponse.json({ error: 'Failed to load providers' }, { status: 500 });
  }
}
