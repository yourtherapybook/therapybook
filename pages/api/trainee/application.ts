import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { authenticateUser } from '../../../lib/auth-middleware';
import { z } from 'zod';

// Schema for the nested application data structure
const applicationUpdateSchema = z.object({
  id: z.string().optional(),
  status: z.enum(['draft', 'submitted', 'under_review', 'approved', 'rejected']).optional(),
  currentStep: z.number().min(1).max(4).optional(),
  completedSteps: z.array(z.number()).optional(),
  
  // Step 1: Account Information (handled separately in user table)
  accountInfo: z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    password: z.string().optional(),
    confirmPassword: z.string().optional(),
  }).optional(),
  
  // Step 2: Office Location
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
  
  // Step 3: Public Profile
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
  
  // Step 4: Agreements
  agreements: z.object({
    motivationStatement: z.string().optional(),
    paymentAgreement: z.boolean().optional(),
    responseTimeAgreement: z.boolean().optional(),
    minimumClientCommitment: z.boolean().optional(),
    termsOfService: z.boolean().optional(),
    referrals: z.array(z.object({
      id: z.string(),
      firstName: z.string(),
      lastName: z.string(),
      workEmail: z.string().email(),
    })).optional(),
  }).optional(),
});

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
      // Get trainee application by ID or user ID
      const { id } = req.query;
      
      let application;
      if (id && typeof id === 'string') {
        application = await prisma.traineeApplication.findUnique({
          where: { id },
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
              },
            },
          },
        });
      } else {
        application = await prisma.traineeApplication.findUnique({
          where: { userId: user.id },
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
              },
            },
          },
        });
      }

      if (!application) {
        return res.status(404).json({ error: 'Application not found' });
      }

      // Transform the data to match our new structure
      const transformedApplication = {
        id: application.id,
        status: application.status.toLowerCase(),
        currentStep: application.currentStep || 1,
        completedSteps: application.completedSteps || [],
        createdAt: application.createdAt,
        updatedAt: application.updatedAt,
        submittedAt: application.submittedAt,
        
        accountInfo: {
          firstName: application.user.firstName,
          lastName: application.user.lastName,
          email: application.user.email,
          phone: application.user.phone || '',
          password: '', // Never send password
          confirmPassword: '',
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
          referrals: [],
        },
      };

      res.status(200).json(transformedApplication);
    } else if (req.method === 'POST') {
      // Create or update trainee application (auto-save functionality)
      const validatedData = applicationUpdateSchema.parse(req.body);
      
      // Flatten the nested structure for database storage
      const flatData: any = {
        currentStep: validatedData.currentStep,
        completedSteps: validatedData.completedSteps,
        status: validatedData.status?.toUpperCase() || 'DRAFT',
      };

      // Handle office location data
      if (validatedData.officeLocation) {
        const { officeLocation } = validatedData;
        flatData.practiceName = officeLocation.practiceName;
        flatData.practiceWebsite = officeLocation.practiceWebsite;
        flatData.officePhone = officeLocation.officePhone;
        
        if (officeLocation.address) {
          flatData.street = officeLocation.address.street;
          flatData.addressLine2 = officeLocation.address.addressLine2;
          flatData.city = officeLocation.address.city;
          flatData.stateProvince = officeLocation.address.stateProvince;
          flatData.zipPostalCode = officeLocation.address.zipPostalCode;
          flatData.country = officeLocation.address.country;
        }
      }

      // Handle public profile data
      if (validatedData.publicProfile) {
        const { publicProfile } = validatedData;
        flatData.title = publicProfile.title;
        flatData.institutionOfStudy = publicProfile.institutionOfStudy;
        flatData.skillsAcquired = publicProfile.skillsAcquired;
        flatData.otherSkills = publicProfile.otherSkills;
        flatData.specialties = publicProfile.specialties;
        flatData.treatmentOrientation = publicProfile.treatmentOrientation;
        flatData.modality = publicProfile.modality;
        flatData.ageGroups = publicProfile.ageGroups;
        flatData.languages = publicProfile.languages;
        flatData.otherLanguages = publicProfile.otherLanguages;
        flatData.ethnicitiesServed = publicProfile.ethnicitiesServed;
        flatData.personalStatement = publicProfile.personalStatement;
        flatData.profilePhotoUrl = publicProfile.profilePhotoUrl;
      }

      // Handle agreements data
      if (validatedData.agreements) {
        const { agreements } = validatedData;
        flatData.motivationStatement = agreements.motivationStatement;
        flatData.paymentAgreement = agreements.paymentAgreement;
        flatData.responseTimeAgreement = agreements.responseTimeAgreement;
        flatData.minimumClientCommitment = agreements.minimumClientCommitment;
        flatData.termsOfService = agreements.termsOfService;
      }

      // Update user info if provided
      if (validatedData.accountInfo) {
        const { accountInfo } = validatedData;
        await prisma.user.update({
          where: { id: user.id },
          data: {
            firstName: accountInfo.firstName,
            lastName: accountInfo.lastName,
            email: accountInfo.email,
            phone: accountInfo.phone,
          },
        });
      }

      const application = await prisma.traineeApplication.upsert({
        where: { userId: user.id },
        update: flatData,
        create: {
          userId: user.id,
          ...flatData,
        },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            },
          },
        },
      });

      // Handle referrals if provided (TODO: implement referrals table)
      // For now, referrals are not persisted to database

      res.status(200).json({ 
        id: application.id,
        message: 'Application saved successfully',
        updatedAt: application.updatedAt 
      });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.issues });
    }
    
    console.error('Trainee application API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}