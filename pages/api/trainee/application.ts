import { ApplicationStatus, Prisma } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { authenticateUser } from '../../../lib/auth-middleware';
import { prisma } from '../../../lib/prisma';
import { sendEmail } from '../../../lib/email';

const referralSchema = z.object({
  id: z.string(),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  workEmail: z.string().email('Invalid email format'),
});

const applicationUpdateSchema = z.object({
  id: z.string().optional(),
  status: z.enum(['draft', 'submitted', 'under_review', 'approved', 'rejected']).optional(),
  currentStep: z.number().min(1).max(4).optional(),
  completedSteps: z.array(z.number().min(1).max(4)).optional(),
  accountInfo: z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    password: z.string().optional(),
    confirmPassword: z.string().optional(),
    requiresPassword: z.boolean().optional(),
  }).optional(),
  officeLocation: z.object({
    practiceName: z.string().optional(),
    practiceWebsite: z.string().optional(),
    officePhone: z.string().optional(),
    address: z.object({
      street: z.string().optional(),
      addressLine2: z.string().optional(),
      city: z.string().optional(),
      stateProvince: z.string().optional(),
      zipPostalCode: z.string().optional(),
      country: z.string().optional(),
    }).optional(),
  }).optional(),
  publicProfile: z.object({
    title: z.string().optional(),
    therapistType: z.string().optional(),
    institutionOfStudy: z.string().optional(),
    skillsAcquired: z.array(z.string()).optional(),
    otherSkills: z.string().optional(),
    specialties: z.array(z.string()).optional(),
    treatmentOrientation: z.array(z.string()).optional(),
    modality: z.array(z.string()).optional(),
    ageGroups: z.array(z.string()).optional(),
    languages: z.array(z.string()).optional(),
    otherLanguages: z.string().optional(),
    ethnicitiesServed: z.array(z.string()).optional(),
    personalStatement: z.string().optional(),
    profilePhotoUrl: z.string().optional(),
  }).optional(),
  agreements: z.object({
    motivationStatement: z.string().optional(),
    paymentAgreement: z.boolean().optional(),
    responseTimeAgreement: z.boolean().optional(),
    minimumClientCommitment: z.boolean().optional(),
    termsOfService: z.boolean().optional(),
    referrals: z.array(referralSchema).optional(),
  }).optional(),
});

const applicationInclude = {
  referrals: {
    orderBy: { createdAt: 'asc' as const },
  },
  user: {
    select: {
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
    },
  },
} satisfies Prisma.TraineeApplicationInclude;

const mapStatus = (status?: string): ApplicationStatus | undefined => {
  if (!status) return undefined;

  const normalized = status.toUpperCase();
  if (
    normalized === 'DRAFT' ||
    normalized === 'SUBMITTED' ||
    normalized === 'UNDER_REVIEW' ||
    normalized === 'APPROVED' ||
    normalized === 'REJECTED'
  ) {
    return normalized as ApplicationStatus;
  }

  return undefined;
};

class SubmissionValidationError extends Error {
  missingFields: string[];

  constructor(missingFields: string[]) {
    super('Application incomplete');
    this.missingFields = missingFields;
  }
}

const getSubmissionMissingFields = (
  application: Prisma.TraineeApplicationGetPayload<{ include: typeof applicationInclude }>
) => {
  const missingFields: string[] = [];

  const requiredFields: Array<[keyof typeof application, string]> = [
    ['practiceName', 'practiceName'],
    ['street', 'street'],
    ['city', 'city'],
    ['stateProvince', 'stateProvince'],
    ['zipPostalCode', 'zipPostalCode'],
    ['country', 'country'],
    ['title', 'title'],
    ['institutionOfStudy', 'institutionOfStudy'],
    ['personalStatement', 'personalStatement'],
    ['motivationStatement', 'motivationStatement'],
  ];

  requiredFields.forEach(([key, fieldName]) => {
    if (!application[key]) {
      missingFields.push(fieldName);
    }
  });

  if (application.paymentAgreement !== true) missingFields.push('paymentAgreement');
  if (application.responseTimeAgreement !== true) missingFields.push('responseTimeAgreement');
  if (application.minimumClientCommitment !== true) missingFields.push('minimumClientCommitment');
  if (application.termsOfService !== true) missingFields.push('termsOfService');

  if (!application.user.firstName) missingFields.push('firstName');
  if (!application.user.lastName) missingFields.push('lastName');
  if (!application.user.email) missingFields.push('email');

  return missingFields;
};

const toApplicationResponse = (
  application: Prisma.TraineeApplicationGetPayload<{ include: typeof applicationInclude }>
) => {
  return {
    id: application.id,
    status: application.status.toLowerCase(),
    currentStep: application.currentStep || 1,
    completedSteps: application.completedSteps || [],
    createdAt: application.createdAt,
    updatedAt: application.updatedAt,
    submittedAt: application.submittedAt,
    reviewedAt: application.reviewedAt,
    approvedAt: application.approvedAt,
    rejectionReason: application.rejectionReason,
    accountInfo: {
      firstName: application.user.firstName,
      lastName: application.user.lastName,
      email: application.user.email,
      phone: application.user.phone || '',
      password: '',
      confirmPassword: '',
      requiresPassword: false,
    },
    officeLocation: {
      practiceName: application.practiceName || '',
      practiceWebsite: application.practiceWebsite || '',
      officePhone: application.officePhone || '',
      address: {
        street: application.street || '',
        addressLine2: application.addressLine2 || '',
        city: application.city || '',
        stateProvince: application.stateProvince || '',
        zipPostalCode: application.zipPostalCode || '',
        country: application.country || 'US',
      },
    },
    publicProfile: {
      title: application.title || '',
      therapistType: 'Student Intern / Trainee',
      institutionOfStudy: application.institutionOfStudy || '',
      skillsAcquired: application.skillsAcquired || [],
      otherSkills: application.otherSkills || '',
      specialties: application.specialties || [],
      treatmentOrientation: application.treatmentOrientation || [],
      modality: application.modality || [],
      ageGroups: application.ageGroups || [],
      languages: application.languages || [],
      otherLanguages: application.otherLanguages || '',
      ethnicitiesServed: application.ethnicitiesServed || [],
      personalStatement: application.personalStatement || '',
      profilePhotoUrl: application.profilePhotoUrl || '',
    },
    agreements: {
      motivationStatement: application.motivationStatement || '',
      paymentAgreement: application.paymentAgreement || false,
      responseTimeAgreement: application.responseTimeAgreement || false,
      minimumClientCommitment: application.minimumClientCommitment || false,
      termsOfService: application.termsOfService || false,
      referrals: application.referrals.map((referral) => ({
        id: referral.id,
        firstName: referral.firstName,
        lastName: referral.lastName,
        workEmail: referral.workEmail,
      })),
    },
  };
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const user = await authenticateUser(req, res);

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (req.method === 'GET') {
      const { id } = req.query;
      const where =
        id && typeof id === 'string'
          ? { id }
          : { userId: user.id };

      const application = await prisma.traineeApplication.findFirst({
        where: {
          ...where,
          ...(id && typeof id === 'string' && user.role !== 'ADMIN' ? { userId: user.id } : {}),
        },
        include: applicationInclude,
      });

      if (!application) {
        return res.status(404).json({ error: 'Application not found' });
      }

      return res.status(200).json(toApplicationResponse(application));
    }

    if (req.method === 'POST') {
      const validatedData = applicationUpdateSchema.parse(req.body);
      const normalizedEmail = validatedData.accountInfo?.email?.trim().toLowerCase();

      if (validatedData.id) {
        const existingById = await prisma.traineeApplication.findUnique({
          where: { id: validatedData.id },
          select: { userId: true },
        });

        if (!existingById || (existingById.userId !== user.id && user.role !== 'ADMIN')) {
          return res.status(403).json({ error: 'Forbidden' });
        }
      }

      if (normalizedEmail) {
        const existingEmailUser = await prisma.user.findUnique({
          where: { email: normalizedEmail },
          select: { id: true },
        });

        if (existingEmailUser && existingEmailUser.id !== user.id) {
          return res.status(400).json({ error: 'Another account already uses that email address' });
        }
      }

      const updateData: Prisma.TraineeApplicationUncheckedUpdateInput = {};
      const createData: Prisma.TraineeApplicationUncheckedCreateInput = {
        userId: user.id,
      };
      const applicationStatus = mapStatus(validatedData.status);
      const isSubmitting = applicationStatus === 'SUBMITTED';

      if (validatedData.currentStep !== undefined) {
        updateData.currentStep = validatedData.currentStep;
        createData.currentStep = validatedData.currentStep;
      }

      if (validatedData.completedSteps !== undefined) {
        updateData.completedSteps = validatedData.completedSteps;
        createData.completedSteps = validatedData.completedSteps;
      }

      if (applicationStatus && applicationStatus !== 'SUBMITTED') {
        updateData.status = applicationStatus;
        createData.status = applicationStatus;
      }

      if (validatedData.officeLocation) {
        const { officeLocation } = validatedData;
        updateData.practiceName = officeLocation.practiceName;
        updateData.practiceWebsite = officeLocation.practiceWebsite;
        updateData.officePhone = officeLocation.officePhone;
        updateData.street = officeLocation.address?.street;
        updateData.addressLine2 = officeLocation.address?.addressLine2;
        updateData.city = officeLocation.address?.city;
        updateData.stateProvince = officeLocation.address?.stateProvince;
        updateData.zipPostalCode = officeLocation.address?.zipPostalCode;
        updateData.country = officeLocation.address?.country;
        createData.practiceName = officeLocation.practiceName;
        createData.practiceWebsite = officeLocation.practiceWebsite;
        createData.officePhone = officeLocation.officePhone;
        createData.street = officeLocation.address?.street;
        createData.addressLine2 = officeLocation.address?.addressLine2;
        createData.city = officeLocation.address?.city;
        createData.stateProvince = officeLocation.address?.stateProvince;
        createData.zipPostalCode = officeLocation.address?.zipPostalCode;
        createData.country = officeLocation.address?.country;
      }

      if (validatedData.publicProfile) {
        const { publicProfile } = validatedData;
        updateData.title = publicProfile.title;
        updateData.therapistType = publicProfile.therapistType;
        updateData.institutionOfStudy = publicProfile.institutionOfStudy;
        updateData.skillsAcquired = publicProfile.skillsAcquired;
        updateData.otherSkills = publicProfile.otherSkills;
        updateData.specialties = publicProfile.specialties;
        updateData.treatmentOrientation = publicProfile.treatmentOrientation;
        updateData.modality = publicProfile.modality;
        updateData.ageGroups = publicProfile.ageGroups;
        updateData.languages = publicProfile.languages;
        updateData.otherLanguages = publicProfile.otherLanguages;
        updateData.ethnicitiesServed = publicProfile.ethnicitiesServed;
        updateData.personalStatement = publicProfile.personalStatement;
        updateData.profilePhotoUrl = publicProfile.profilePhotoUrl;
        createData.title = publicProfile.title;
        createData.therapistType = publicProfile.therapistType;
        createData.institutionOfStudy = publicProfile.institutionOfStudy;
        createData.skillsAcquired = publicProfile.skillsAcquired;
        createData.otherSkills = publicProfile.otherSkills;
        createData.specialties = publicProfile.specialties;
        createData.treatmentOrientation = publicProfile.treatmentOrientation;
        createData.modality = publicProfile.modality;
        createData.ageGroups = publicProfile.ageGroups;
        createData.languages = publicProfile.languages;
        createData.otherLanguages = publicProfile.otherLanguages;
        createData.ethnicitiesServed = publicProfile.ethnicitiesServed;
        createData.personalStatement = publicProfile.personalStatement;
        createData.profilePhotoUrl = publicProfile.profilePhotoUrl;
      }

      if (validatedData.agreements) {
        const { agreements } = validatedData;
        updateData.motivationStatement = agreements.motivationStatement;
        updateData.paymentAgreement = agreements.paymentAgreement;
        updateData.responseTimeAgreement = agreements.responseTimeAgreement;
        updateData.minimumClientCommitment = agreements.minimumClientCommitment;
        updateData.termsOfService = agreements.termsOfService;
        createData.motivationStatement = agreements.motivationStatement;
        createData.paymentAgreement = agreements.paymentAgreement;
        createData.responseTimeAgreement = agreements.responseTimeAgreement;
        createData.minimumClientCommitment = agreements.minimumClientCommitment;
        createData.termsOfService = agreements.termsOfService;
      }

      const savedApplication = await prisma.$transaction(async (tx) => {
        if (validatedData.accountInfo) {
          await tx.user.update({
            where: { id: user.id },
            data: {
              firstName: validatedData.accountInfo.firstName,
              lastName: validatedData.accountInfo.lastName,
              email: normalizedEmail,
              phone: validatedData.accountInfo.phone,
            },
          });
        }

        // Profile moderation: if the application was APPROVED and profile-sensitive
        // fields are being changed, reset to UNDER_REVIEW so admin must re-approve.
        const hasProfileChanges = Boolean(validatedData.publicProfile || validatedData.officeLocation);
        if (hasProfileChanges && !isSubmitting) {
          const existingApp = await tx.traineeApplication.findUnique({
            where: { userId: user.id },
            select: { status: true },
          });

          if (existingApp?.status === 'APPROVED') {
            updateData.status = 'UNDER_REVIEW';
            updateData.reviewedAt = null;
            updateData.approvedAt = null;

            // Audit the re-review trigger
            await tx.auditLog.create({
              data: {
                action: 'PROFILE_EDIT_TRIGGERED_REREVIEW',
                userId: user.id,
                entityId: user.id,
                entityType: 'TraineeApplication',
                details: {
                  reason: 'Approved trainee edited profile-sensitive fields',
                  changedSections: [
                    ...(validatedData.publicProfile ? ['publicProfile'] : []),
                    ...(validatedData.officeLocation ? ['officeLocation'] : []),
                  ],
                },
              },
            });
          }
        }

        const application = await tx.traineeApplication.upsert({
          where: { userId: user.id },
          update: {
            ...updateData,
          },
          create: {
            ...createData,
          },
        });

        if (validatedData.agreements?.referrals) {
          await tx.referral.deleteMany({
            where: { traineeApplicationId: application.id },
          });

          if (validatedData.agreements.referrals.length > 0) {
            await tx.referral.createMany({
              data: validatedData.agreements.referrals.map((referral) => ({
                traineeApplicationId: application.id,
                firstName: referral.firstName,
                lastName: referral.lastName,
                workEmail: referral.workEmail.trim().toLowerCase(),
              })),
            });
          }
        }

        const applicationWithRelations = await tx.traineeApplication.findUniqueOrThrow({
          where: { id: application.id },
          include: applicationInclude,
        });

        if (!isSubmitting) {
          return applicationWithRelations;
        }

        if (applicationWithRelations.status !== 'DRAFT') {
          throw new Error('Application has already been submitted');
        }

        const missingFields = getSubmissionMissingFields(applicationWithRelations);

        if (missingFields.length > 0) {
          throw new SubmissionValidationError(missingFields);
        }

        const forwardedFor = req.headers['x-forwarded-for'];
        const submissionIp = typeof forwardedFor === 'string'
          ? forwardedFor.split(',')[0]
          : req.socket.remoteAddress || null;

        await tx.traineeApplication.update({
          where: { id: application.id },
          data: {
            status: 'SUBMITTED',
            submittedAt: applicationWithRelations.submittedAt || new Date(),
            currentStep: 4,
            completedSteps: [1, 2, 3, 4],
            agreementVersion: '2026-03-29-v1',
            agreementAcceptedAt: new Date(),
            agreementIpAddress: submissionIp,
          },
        });

        return tx.traineeApplication.findUniqueOrThrow({
          where: { id: application.id },
          include: applicationInclude,
        });
      });

      if (isSubmitting) {
        const applicantName = `${savedApplication.user.firstName} ${savedApplication.user.lastName}`.trim();

        try {
          await sendEmail(savedApplication.user.email, 'APPLICATION_RECEIVED', { name: applicantName });
          const adminEmail = process.env.ADMIN_ALERT_EMAIL || 'admin@therapybook.com';
          await sendEmail(adminEmail, 'ADMIN_NEW_APPLICATION', {
            applicantName,
            applicationId: savedApplication.id,
          });
        } catch (emailError) {
          console.error('Application submission email error:', emailError);
        }
      }

      return res.status(200).json({
        ...toApplicationResponse(savedApplication),
        message: isSubmitting
          ? 'Application submitted successfully'
          : 'Application saved successfully',
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.issues });
    }

    if (error instanceof SubmissionValidationError) {
      return res.status(400).json({
        error: 'Application incomplete',
        missingFields: error.missingFields,
        message: 'Please complete all required fields before submitting',
      });
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      return res.status(400).json({ error: 'This information is already in use' });
    }

    if (error instanceof Error && error.message === 'Application has already been submitted') {
      return res.status(400).json({ error: error.message });
    }

    console.error('Trainee application API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
