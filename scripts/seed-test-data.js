const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { PrismaClient, Prisma } = require('@prisma/client');

function loadDotEnv() {
  const envPath = path.join(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) {
    return;
  }

  const envText = fs.readFileSync(envPath, 'utf8');
  for (const rawLine of envText.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    const separatorIndex = line.indexOf('=');
    if (separatorIndex === -1) continue;

    const key = line.slice(0, separatorIndex).trim();
    let value = line.slice(separatorIndex + 1).trim();

    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

loadDotEnv();

const prisma = new PrismaClient();

const PASSWORD = 'TherapyBook123!';
const APP_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';
const OUTPUT_PATH = path.join(process.cwd(), 'output', 'qa-test-data.json');

function createDateAt(baseDate, hour, minute) {
  const next = new Date(baseDate);
  next.setHours(hour, minute, 0, 0);
  return next;
}

function nextWeekdayAt(daysAhead, hour, minute) {
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);

  while (date.getDay() === 0 || date.getDay() === 6) {
    date.setDate(date.getDate() + 1);
  }

  return createDateAt(date, hour, minute);
}

function previousWeekdayAt(daysBack, hour, minute) {
  const date = new Date();
  date.setDate(date.getDate() - daysBack);

  while (date.getDay() === 0 || date.getDay() === 6) {
    date.setDate(date.getDate() - 1);
  }

  return createDateAt(date, hour, minute);
}

const userFixtures = [
  {
    key: 'admin',
    email: 'qa.admin@therapybook.test',
    firstName: 'Avery',
    lastName: 'Admin',
    role: 'ADMIN',
    emailVerified: true,
  },
  {
    key: 'supervisor',
    email: 'qa.supervisor@therapybook.test',
    firstName: 'Sam',
    lastName: 'Supervisor',
    role: 'SUPERVISOR',
    emailVerified: true,
  },
  {
    key: 'clientVerified',
    email: 'qa.client.verified@therapybook.test',
    firstName: 'Casey',
    lastName: 'Client',
    role: 'CLIENT',
    emailVerified: true,
  },
  {
    key: 'clientReturning',
    email: 'qa.client.returning@therapybook.test',
    firstName: 'Robin',
    lastName: 'Returning',
    role: 'CLIENT',
    emailVerified: true,
  },
  {
    key: 'clientUnverified',
    email: 'qa.client.unverified@therapybook.test',
    firstName: 'Uma',
    lastName: 'Unverified',
    role: 'CLIENT',
    emailVerified: false,
  },
  {
    key: 'traineeAvailable',
    email: 'qa.trainee.available@therapybook.test',
    firstName: 'Taylor',
    lastName: 'Available',
    role: 'TRAINEE',
    emailVerified: true,
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
  },
  {
    key: 'traineeBooked',
    email: 'qa.trainee.booked@therapybook.test',
    firstName: 'Blake',
    lastName: 'Booked',
    role: 'TRAINEE',
    emailVerified: true,
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
  },
  {
    key: 'traineeOffline',
    email: 'qa.trainee.offline@therapybook.test',
    firstName: 'Olive',
    lastName: 'Offline',
    role: 'TRAINEE',
    emailVerified: true,
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
  },
  {
    key: 'applicantDraft',
    email: 'qa.applicant.draft@therapybook.test',
    firstName: 'Drew',
    lastName: 'Draft',
    role: 'CLIENT',
    emailVerified: true,
  },
  {
    key: 'applicantSubmitted',
    email: 'qa.applicant.submitted@therapybook.test',
    firstName: 'Sydney',
    lastName: 'Submitted',
    role: 'CLIENT',
    emailVerified: true,
  },
  {
    key: 'applicantUnderReview',
    email: 'qa.applicant.review@therapybook.test',
    firstName: 'Riley',
    lastName: 'Review',
    role: 'CLIENT',
    emailVerified: true,
  },
  {
    key: 'applicantRejected',
    email: 'qa.applicant.rejected@therapybook.test',
    firstName: 'Jordan',
    lastName: 'Rejected',
    role: 'CLIENT',
    emailVerified: true,
  },
];

const traineeApplications = {
  traineeAvailable: {
    status: 'APPROVED',
    application: {
      practiceName: 'North Harbor Counseling',
      practiceWebsite: 'https://northharbor.example',
      officePhone: '+49 30 5555 0101',
      street: 'Friedrichstrasse 10',
      city: 'Berlin',
      stateProvince: 'Berlin',
      zipPostalCode: '10117',
      country: 'DE',
      title: 'Ms.',
      therapistType: 'Student Intern / Trainee',
      institutionOfStudy: 'Humboldt University Berlin',
      skillsAcquired: ['CBT', 'Mindfulness', 'Solution-Focused Brief Therapy'],
      otherSkills: '',
      specialties: ['Anxiety', 'Work Stress', 'Life Transitions'],
      treatmentOrientation: ['CBT', 'Solution-Focused'],
      modality: ['Video Therapy'],
      ageGroups: ['Adults', 'Young Adults'],
      languages: ['English', 'German'],
      otherLanguages: '',
      ethnicitiesServed: ['Immigrant Communities', 'International Clients'],
      personalStatement: 'I support adults navigating anxiety, work stress, and life changes with practical, collaborative sessions under clinical supervision.',
      profilePhotoUrl: '',
      motivationStatement: 'I want to make supervised therapy more accessible for clients who need flexible online care.',
      paymentAgreement: true,
      responseTimeAgreement: true,
      minimumClientCommitment: true,
      termsOfService: true,
      currentStep: 4,
      completedSteps: [1, 2, 3, 4],
      submittedAt: previousWeekdayAt(30, 11, 0),
      reviewedAt: previousWeekdayAt(25, 12, 0),
      approvedAt: previousWeekdayAt(25, 12, 0),
      rejectionReason: null,
    },
    referrals: [],
  },
  traineeBooked: {
    status: 'APPROVED',
    application: {
      practiceName: 'River Path Therapy',
      practiceWebsite: 'https://riverpath.example',
      officePhone: '+49 30 5555 0202',
      street: 'Torstrasse 22',
      city: 'Berlin',
      stateProvince: 'Berlin',
      zipPostalCode: '10119',
      country: 'DE',
      title: 'Mr.',
      therapistType: 'Student Intern / Trainee',
      institutionOfStudy: 'Free University of Berlin',
      skillsAcquired: ['Systemic Therapy', 'Narrative Therapy', 'Motivational Interviewing'],
      otherSkills: '',
      specialties: ['Relationships', 'Grief', 'Identity'],
      treatmentOrientation: ['Systemic', 'Narrative'],
      modality: ['Video Therapy', 'Short-Term Therapy'],
      ageGroups: ['Adults', 'Couples'],
      languages: ['English', 'Spanish'],
      otherLanguages: '',
      ethnicitiesServed: ['LGBTQ+', 'Multicultural Clients'],
      personalStatement: 'I work with adults and couples facing grief, identity questions, and relational stress, using systemic and narrative approaches.',
      profilePhotoUrl: '',
      motivationStatement: 'I want to grow a supervised practice with strong communication and continuity for clients.',
      paymentAgreement: true,
      responseTimeAgreement: true,
      minimumClientCommitment: true,
      termsOfService: true,
      currentStep: 4,
      completedSteps: [1, 2, 3, 4],
      submittedAt: previousWeekdayAt(40, 11, 0),
      reviewedAt: previousWeekdayAt(35, 12, 0),
      approvedAt: previousWeekdayAt(35, 12, 0),
      rejectionReason: null,
    },
    referrals: [],
  },
  traineeOffline: {
    status: 'APPROVED',
    application: {
      practiceName: 'Stillwater Practice',
      practiceWebsite: 'https://stillwater.example',
      officePhone: '+49 30 5555 0303',
      street: 'Prenzlauer Allee 40',
      city: 'Berlin',
      stateProvince: 'Berlin',
      zipPostalCode: '10405',
      country: 'DE',
      title: 'Mx.',
      therapistType: 'Student Intern / Trainee',
      institutionOfStudy: 'Berlin School of Psychology',
      skillsAcquired: ['ACT', 'Psychoeducation'],
      otherSkills: 'Neurodiversity-informed planning',
      specialties: ['ADHD', 'Burnout'],
      treatmentOrientation: ['ACT'],
      modality: ['Video Therapy'],
      ageGroups: ['Adults'],
      languages: ['English'],
      otherLanguages: '',
      ethnicitiesServed: ['Remote Workers'],
      personalStatement: 'I support adults with burnout and executive-function challenges in structured, compassionate online sessions.',
      profilePhotoUrl: '',
      motivationStatement: 'I want to provide affordable care for clients who often delay therapy because of cost.',
      paymentAgreement: true,
      responseTimeAgreement: true,
      minimumClientCommitment: true,
      termsOfService: true,
      currentStep: 4,
      completedSteps: [1, 2, 3, 4],
      submittedAt: previousWeekdayAt(20, 11, 0),
      reviewedAt: previousWeekdayAt(18, 12, 0),
      approvedAt: previousWeekdayAt(18, 12, 0),
      rejectionReason: null,
    },
    referrals: [],
  },
  applicantDraft: {
    status: 'DRAFT',
    application: {
      practiceName: 'Draft Wellness',
      practiceWebsite: '',
      officePhone: '',
      street: '',
      city: '',
      stateProvince: '',
      zipPostalCode: '',
      country: 'DE',
      title: '',
      therapistType: 'Student Intern / Trainee',
      institutionOfStudy: '',
      skillsAcquired: [],
      otherSkills: '',
      specialties: [],
      treatmentOrientation: [],
      modality: [],
      ageGroups: [],
      languages: [],
      otherLanguages: '',
      ethnicitiesServed: [],
      personalStatement: '',
      profilePhotoUrl: '',
      motivationStatement: '',
      paymentAgreement: false,
      responseTimeAgreement: false,
      minimumClientCommitment: false,
      termsOfService: false,
      currentStep: 2,
      completedSteps: [1],
      submittedAt: null,
      reviewedAt: null,
      approvedAt: null,
      rejectionReason: null,
    },
    referrals: [],
  },
  applicantSubmitted: {
    status: 'SUBMITTED',
    application: {
      practiceName: 'Submitted Practice',
      practiceWebsite: 'https://submitted.example',
      officePhone: '+49 30 5555 0404',
      street: 'Leipziger Platz 12',
      city: 'Berlin',
      stateProvince: 'Berlin',
      zipPostalCode: '10117',
      country: 'DE',
      title: 'Ms.',
      therapistType: 'Student Intern / Trainee',
      institutionOfStudy: 'University of Potsdam',
      skillsAcquired: ['CBT', 'Trauma-Informed Care'],
      otherSkills: '',
      specialties: ['Trauma', 'Anxiety'],
      treatmentOrientation: ['CBT'],
      modality: ['Video Therapy'],
      ageGroups: ['Adults'],
      languages: ['English', 'German'],
      otherLanguages: '',
      ethnicitiesServed: ['Women', 'Students'],
      personalStatement: 'I help adults recover confidence and steadiness after high-stress or traumatic experiences.',
      profilePhotoUrl: '',
      motivationStatement: 'I want to contribute to a supervised marketplace that makes therapy accessible.',
      paymentAgreement: true,
      responseTimeAgreement: true,
      minimumClientCommitment: true,
      termsOfService: true,
      currentStep: 4,
      completedSteps: [1, 2, 3, 4],
      submittedAt: previousWeekdayAt(4, 15, 0),
      reviewedAt: null,
      approvedAt: null,
      rejectionReason: null,
    },
    referrals: [
      { firstName: 'Mina', lastName: 'Advisor', workEmail: 'mina.advisor@example.org' },
      { firstName: 'Theo', lastName: 'Mentor', workEmail: 'theo.mentor@example.org' },
    ],
  },
  applicantUnderReview: {
    status: 'UNDER_REVIEW',
    application: {
      practiceName: 'Review Practice',
      practiceWebsite: 'https://review.example',
      officePhone: '+49 30 5555 0505',
      street: 'Unter den Linden 18',
      city: 'Berlin',
      stateProvince: 'Berlin',
      zipPostalCode: '10117',
      country: 'DE',
      title: 'Mr.',
      therapistType: 'Student Intern / Trainee',
      institutionOfStudy: 'Sigmund Freud University Berlin',
      skillsAcquired: ['Gestalt', 'Mindfulness', 'Somatic Awareness'],
      otherSkills: '',
      specialties: ['Grief', 'Identity'],
      treatmentOrientation: ['Gestalt'],
      modality: ['Video Therapy'],
      ageGroups: ['Adults', 'Young Adults'],
      languages: ['English'],
      otherLanguages: '',
      ethnicitiesServed: ['International Clients'],
      personalStatement: 'I help clients process grief and identity transitions with present-focused, relational work.',
      profilePhotoUrl: '',
      motivationStatement: 'I want to contribute thoughtful, supervised care for clients who need accessible therapy.',
      paymentAgreement: true,
      responseTimeAgreement: true,
      minimumClientCommitment: true,
      termsOfService: true,
      currentStep: 4,
      completedSteps: [1, 2, 3, 4],
      submittedAt: previousWeekdayAt(6, 10, 0),
      reviewedAt: previousWeekdayAt(2, 9, 0),
      approvedAt: null,
      rejectionReason: null,
    },
    referrals: [
      { firstName: 'Lea', lastName: 'Supervisor', workEmail: 'lea.supervisor@example.org' },
    ],
  },
  applicantRejected: {
    status: 'REJECTED',
    application: {
      practiceName: 'Rejected Practice',
      practiceWebsite: 'https://rejected.example',
      officePhone: '+49 30 5555 0606',
      street: 'Alexanderplatz 1',
      city: 'Berlin',
      stateProvince: 'Berlin',
      zipPostalCode: '10178',
      country: 'DE',
      title: 'Ms.',
      therapistType: 'Student Intern / Trainee',
      institutionOfStudy: 'Example Institute',
      skillsAcquired: ['Coaching'],
      otherSkills: '',
      specialties: ['Career Stress'],
      treatmentOrientation: ['Coaching'],
      modality: ['Video Therapy'],
      ageGroups: ['Adults'],
      languages: ['English'],
      otherLanguages: '',
      ethnicitiesServed: ['Career Changers'],
      personalStatement: 'I focus on stressful work transitions and confidence-building.',
      profilePhotoUrl: '',
      motivationStatement: 'I want to support clients facing rapid career change.',
      paymentAgreement: true,
      responseTimeAgreement: true,
      minimumClientCommitment: true,
      termsOfService: true,
      currentStep: 4,
      completedSteps: [1, 2, 3, 4],
      submittedAt: previousWeekdayAt(12, 11, 0),
      reviewedAt: previousWeekdayAt(10, 14, 0),
      approvedAt: null,
      rejectionReason: 'Missing sufficient supervision documentation.',
    },
    referrals: [],
  },
};

async function upsertUser(fixture, hashedPassword) {
  const base = {
    email: fixture.email,
    firstName: fixture.firstName,
    lastName: fixture.lastName,
    name: `${fixture.firstName} ${fixture.lastName}`,
    phone: '+49 30 5555 0000',
    password: hashedPassword,
    role: fixture.role,
    image: fixture.image || null,
    emailVerified: fixture.emailVerified ? new Date() : null,
  };

  return prisma.user.upsert({
    where: { email: fixture.email },
    update: base,
    create: base,
  });
}

async function upsertApplication(userId, definition) {
  const application = await prisma.traineeApplication.upsert({
    where: { userId },
    update: {
      ...definition.application,
      status: definition.status,
    },
    create: {
      userId,
      status: definition.status,
      ...definition.application,
    },
  });

  await prisma.referral.deleteMany({
    where: { traineeApplicationId: application.id },
  });

  if (definition.referrals.length > 0) {
    await prisma.referral.createMany({
      data: definition.referrals.map((referral) => ({
        traineeApplicationId: application.id,
        firstName: referral.firstName,
        lastName: referral.lastName,
        workEmail: referral.workEmail,
      })),
    });
  }

  return prisma.traineeApplication.findUnique({
    where: { id: application.id },
    include: { referrals: true },
  });
}

async function main() {
  const hashedPassword = await bcrypt.hash(PASSWORD, 12);

  const users = {};
  for (const fixture of userFixtures) {
    users[fixture.key] = await upsertUser(fixture, hashedPassword);
  }

  for (const [key, definition] of Object.entries(traineeApplications)) {
    await upsertApplication(users[key].id, definition);
  }

  const seededUserIds = Object.values(users).map((user) => user.id);

  const existingSessions = await prisma.session.findMany({
    where: {
      OR: [
        { clientId: { in: seededUserIds } },
        { therapistId: { in: seededUserIds } },
      ],
    },
    select: { id: true },
  });

  const existingSessionIds = existingSessions.map((session) => session.id);

  await prisma.payment.deleteMany({
    where: {
      OR: [
        { userId: { in: seededUserIds } },
        ...(existingSessionIds.length > 0 ? [{ sessionId: { in: existingSessionIds } }] : []),
      ],
    },
  });

  await prisma.session.deleteMany({
    where: {
      OR: [
        { clientId: { in: seededUserIds } },
        { therapistId: { in: seededUserIds } },
      ],
    },
  });

  await prisma.unavailableSlot.deleteMany({
    where: { therapistId: { in: seededUserIds } },
  });

  await prisma.therapistAvailability.deleteMany({
    where: { therapistId: { in: seededUserIds } },
  });

  await prisma.therapistAvailability.createMany({
    data: [
      { therapistId: users.traineeAvailable.id, dayOfWeek: 1, startTime: '09:00', endTime: '12:00', isActive: true },
      { therapistId: users.traineeAvailable.id, dayOfWeek: 2, startTime: '09:00', endTime: '12:00', isActive: true },
      { therapistId: users.traineeAvailable.id, dayOfWeek: 3, startTime: '09:00', endTime: '12:00', isActive: true },
      { therapistId: users.traineeAvailable.id, dayOfWeek: 4, startTime: '09:00', endTime: '12:00', isActive: true },
      { therapistId: users.traineeAvailable.id, dayOfWeek: 5, startTime: '09:00', endTime: '12:00', isActive: true },
      { therapistId: users.traineeBooked.id, dayOfWeek: 1, startTime: '13:00', endTime: '18:00', isActive: true },
      { therapistId: users.traineeBooked.id, dayOfWeek: 2, startTime: '13:00', endTime: '18:00', isActive: true },
      { therapistId: users.traineeBooked.id, dayOfWeek: 3, startTime: '13:00', endTime: '18:00', isActive: true },
      { therapistId: users.traineeBooked.id, dayOfWeek: 4, startTime: '13:00', endTime: '18:00', isActive: true },
      { therapistId: users.traineeBooked.id, dayOfWeek: 5, startTime: '13:00', endTime: '18:00', isActive: true },
    ],
  });

  const blockedStart = nextWeekdayAt(2, 10, 0);
  const blockedEnd = new Date(blockedStart.getTime() + 60 * 60 * 1000);

  await prisma.unavailableSlot.create({
    data: {
      therapistId: users.traineeAvailable.id,
      startDateTime: blockedStart,
      endDateTime: blockedEnd,
      reason: 'QA blocked slot',
    },
  });

  const futureConfirmedAt = nextWeekdayAt(3, 9, 0);
  const futurePendingAt = nextWeekdayAt(4, 14, 0);
  const pastCompletedAt = previousWeekdayAt(7, 14, 0);
  const pastCancelledAt = previousWeekdayAt(5, 10, 0);
  const pastNoShowAt = previousWeekdayAt(3, 15, 0);

  const futureConfirmedSession = await prisma.session.create({
    data: {
      clientId: users.clientVerified.id,
      therapistId: users.traineeAvailable.id,
      scheduledAt: futureConfirmedAt,
      duration: 50,
      status: 'SCHEDULED',
      price: new Prisma.Decimal('40.00'),
      currency: 'EUR',
    },
  });

  const futurePendingSession = await prisma.session.create({
    data: {
      clientId: users.clientReturning.id,
      therapistId: users.traineeBooked.id,
      scheduledAt: futurePendingAt,
      duration: 50,
      status: 'SCHEDULED',
      price: new Prisma.Decimal('40.00'),
      currency: 'EUR',
    },
  });

  const pastCompletedSession = await prisma.session.create({
    data: {
      clientId: users.clientReturning.id,
      therapistId: users.traineeBooked.id,
      scheduledAt: pastCompletedAt,
      duration: 50,
      status: 'COMPLETED',
      completedAt: new Date(pastCompletedAt.getTime() + 50 * 60 * 1000),
      price: new Prisma.Decimal('40.00'),
      currency: 'EUR',
      rating: 5,
      feedback: 'Very helpful session.',
    },
  });

  const pastCancelledSession = await prisma.session.create({
    data: {
      clientId: users.clientVerified.id,
      therapistId: users.traineeAvailable.id,
      scheduledAt: pastCancelledAt,
      duration: 50,
      status: 'CANCELLED',
      cancelledAt: new Date(pastCancelledAt.getTime() - 24 * 60 * 60 * 1000),
      cancellationReason: 'Client cancelled before the 24-hour window elapsed.',
      price: new Prisma.Decimal('40.00'),
      currency: 'EUR',
    },
  });

  const pastNoShowSession = await prisma.session.create({
    data: {
      clientId: users.clientReturning.id,
      therapistId: users.traineeAvailable.id,
      scheduledAt: pastNoShowAt,
      duration: 50,
      status: 'NO_SHOW',
      price: new Prisma.Decimal('40.00'),
      currency: 'EUR',
    },
  });

  const seededSessions = [
    futureConfirmedSession,
    futurePendingSession,
    pastCompletedSession,
    pastCancelledSession,
    pastNoShowSession,
  ];

  for (const session of seededSessions) {
    await prisma.session.update({
      where: { id: session.id },
      data: {
        meetingUrl: `${APP_URL}/session/${session.id}`,
      },
    });
  }

  const payments = await prisma.$transaction([
    prisma.payment.create({
      data: {
        userId: users.clientVerified.id,
        sessionId: futureConfirmedSession.id,
        amount: new Prisma.Decimal('40.00'),
        currency: 'EUR',
        status: 'COMPLETED',
        paymentMethod: 'stripe',
        stripePaymentId: 'cs_test_future_confirmed_seed',
        description: 'Seeded confirmed future session payment',
        processedAt: new Date(),
      },
    }),
    prisma.payment.create({
      data: {
        userId: users.clientReturning.id,
        sessionId: futurePendingSession.id,
        amount: new Prisma.Decimal('40.00'),
        currency: 'EUR',
        status: 'PENDING',
        paymentMethod: 'stripe',
        description: 'Seeded pending payment for checkout edge-case testing',
      },
    }),
    prisma.payment.create({
      data: {
        userId: users.clientReturning.id,
        sessionId: pastCompletedSession.id,
        amount: new Prisma.Decimal('40.00'),
        currency: 'EUR',
        status: 'COMPLETED',
        paymentMethod: 'stripe',
        stripePaymentId: 'cs_test_past_completed_seed',
        description: 'Seeded completed past session payment',
        processedAt: new Date(),
      },
    }),
    prisma.payment.create({
      data: {
        userId: users.clientVerified.id,
        sessionId: pastCancelledSession.id,
        amount: new Prisma.Decimal('40.00'),
        currency: 'EUR',
        status: 'REFUNDED',
        paymentMethod: 'stripe',
        stripePaymentId: 'cs_test_past_cancelled_seed',
        description: 'Seeded refunded cancelled session payment',
        processedAt: new Date(),
      },
    }),
    prisma.payment.create({
      data: {
        userId: users.clientReturning.id,
        sessionId: pastNoShowSession.id,
        amount: new Prisma.Decimal('40.00'),
        currency: 'EUR',
        status: 'COMPLETED',
        paymentMethod: 'stripe',
        stripePaymentId: 'cs_test_past_noshow_seed',
        description: 'Seeded no-show session payment',
        processedAt: new Date(),
      },
    }),
  ]);

  const summary = {
    seededAt: new Date().toISOString(),
    password: PASSWORD,
    users: Object.fromEntries(
      userFixtures.map((fixture) => [
        fixture.key,
        {
          email: fixture.email,
          role: fixture.role,
          emailVerified: fixture.emailVerified,
        },
      ])
    ),
    providers: [
      {
        name: `${users.traineeAvailable.firstName} ${users.traineeAvailable.lastName}`,
        therapistId: users.traineeAvailable.id,
        availability: 'available',
      },
      {
        name: `${users.traineeBooked.firstName} ${users.traineeBooked.lastName}`,
        therapistId: users.traineeBooked.id,
        availability: 'available',
      },
      {
        name: `${users.traineeOffline.firstName} ${users.traineeOffline.lastName}`,
        therapistId: users.traineeOffline.id,
        availability: 'offline',
      },
    ],
    sessions: {
      futureConfirmed: {
        id: futureConfirmedSession.id,
        status: futureConfirmedSession.status,
        scheduledAt: futureConfirmedSession.scheduledAt.toISOString(),
      },
      futurePending: {
        id: futurePendingSession.id,
        status: futurePendingSession.status,
        scheduledAt: futurePendingSession.scheduledAt.toISOString(),
      },
      pastCompleted: {
        id: pastCompletedSession.id,
        status: pastCompletedSession.status,
        scheduledAt: pastCompletedSession.scheduledAt.toISOString(),
      },
      pastCancelled: {
        id: pastCancelledSession.id,
        status: pastCancelledSession.status,
        scheduledAt: pastCancelledSession.scheduledAt.toISOString(),
      },
      pastNoShow: {
        id: pastNoShowSession.id,
        status: pastNoShowSession.status,
        scheduledAt: pastNoShowSession.scheduledAt.toISOString(),
      },
    },
    payments: payments.map((payment) => ({
      id: payment.id,
      status: payment.status,
      sessionId: payment.sessionId,
    })),
    bookingEdgeCases: {
      blockedSlot: {
        therapistId: users.traineeAvailable.id,
        startDateTime: blockedStart.toISOString(),
        endDateTime: blockedEnd.toISOString(),
      },
      unverifiedClientEmail: userFixtures.find((fixture) => fixture.key === 'clientUnverified').email,
      offlineTherapistId: users.traineeOffline.id,
    },
  };

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, `${JSON.stringify(summary, null, 2)}\n`, 'utf8');

  console.log(`Seeded TherapyBook QA data with password: ${PASSWORD}`);
  console.log(`Summary written to ${OUTPUT_PATH}`);
  console.log(JSON.stringify(summary, null, 2));
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
