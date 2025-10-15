import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { authenticateUser } from '../../../lib/auth-middleware';
import { sendApplicationConfirmation, sendApplicationUnderReview } from '../../../lib/resend';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const user = await authenticateUser(req, res);
    
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get the application with user data
    const application = await prisma.traineeApplication.findUnique({
      where: { userId: user.id },
      include: {
        user: true,
        referrals: true,
      },
    });

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    if (application.status !== 'DRAFT') {
      return res.status(400).json({ error: 'Application has already been submitted' });
    }

    // Validate that all required steps are completed
    const requiredFields = {
      step2: ['practiceName', 'street', 'city', 'stateProvince', 'zipPostalCode', 'country'],
      step3: ['title', 'institutionOfStudy', 'personalStatement'],
      step4: ['motivationStatement', 'paymentAgreement', 'responseTimeAgreement', 'minimumClientCommitment', 'termsOfService'],
    };

    const missingFields: string[] = [];
    
    // Check Step 2 fields
    requiredFields.step2.forEach(field => {
      if (!application[field as keyof typeof application]) {
        missingFields.push(field);
      }
    });

    // Check Step 3 fields
    requiredFields.step3.forEach(field => {
      if (!application[field as keyof typeof application]) {
        missingFields.push(field);
      }
    });

    // Check Step 4 fields
    requiredFields.step4.forEach(field => {
      const value = application[field as keyof typeof application];
      if (field.includes('Agreement') || field === 'termsOfService') {
        if (value !== true) {
          missingFields.push(field);
        }
      } else if (!value) {
        missingFields.push(field);
      }
    });

    if (missingFields.length > 0) {
      return res.status(400).json({ 
        error: 'Application incomplete', 
        missingFields,
        message: 'Please complete all required fields before submitting' 
      });
    }

    // Update application status to submitted
    const submittedApplication = await prisma.traineeApplication.update({
      where: { userId: user.id },
      data: {
        status: 'SUBMITTED',
        submittedAt: new Date(),
        completedSteps: [1, 2, 3, 4],
      },
      include: {
        user: true,
        referrals: true,
      },
    });

    // Send confirmation email
    try {
      await sendApplicationConfirmation(
        application.user.email,
        `${application.user.firstName} ${application.user.lastName}`
      );
      
      // Send under review notification
      await sendApplicationUnderReview(
        application.user.email,
        `${application.user.firstName} ${application.user.lastName}`
      );
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      // Don't fail the submission if email fails
    }

    res.status(200).json({ 
      application: submittedApplication, 
      message: 'Application submitted successfully' 
    });
  } catch (error) {
    console.error('Application submission error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}