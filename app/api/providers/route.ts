import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionPrice } from '@/lib/pricing';

export async function GET() {
  try {
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
          select: { id: true },
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
      },
      orderBy: [
        { firstName: 'asc' },
        { lastName: 'asc' },
      ],
    });

    const sessionPrice = await getSessionPrice();

    const transformedProviders = providers
      .filter((provider) => provider.traineeApplication)
      .map((provider) => {
        const application = provider.traineeApplication!;
        const fullName = `${provider.firstName} ${provider.lastName}`.trim();

        return {
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
      });

    const filters = {
      issueTypes: Array.from(
        new Set(transformedProviders.flatMap((provider) => provider.specializations))
      ).sort(),
      languages: Array.from(
        new Set(transformedProviders.flatMap((provider) => provider.languages))
      ).sort(),
    };

    return NextResponse.json({ providers: transformedProviders, filters });
  } catch (error) {
    console.error('Provider directory error:', error);
    return NextResponse.json({ error: 'Failed to load providers' }, { status: 500 });
  }
}
