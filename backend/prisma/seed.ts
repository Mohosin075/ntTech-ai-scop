import { FeatureCategory, FeatureComplexity, PrismaClient, ProjectStatus, RiskLevel, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('The demo seed is for local development only and must not run in production.');
  }

  console.log('Seeding initial system users and reference projects...');

  const salt = await bcrypt.genSalt(10);
  const estimatorPassword = await bcrypt.hash('Estimator123!', salt);
  const adminPassword = await bcrypt.hash('Admin123!', salt);

  const estimator = await prisma.user.upsert({
    where: { email: 'estimator@scopeai.dev' },
    update: {
      name: 'Tanvir Hasan',
      email: 'estimator@scopeai.dev',
    },
    create: {
      name: 'Tanvir Hasan',
      email: 'estimator@scopeai.dev',
      passwordHash: estimatorPassword,
      role: Role.ESTIMATOR,
    },
  });
  console.log(`Seeded Estimator: ${estimator.email}`);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@scopeai.dev' },
    update: {
      name: 'Farhan Ahmed',
      email: 'admin@scopeai.dev',
    },
    create: {
      name: 'Farhan Ahmed',
      email: 'admin@scopeai.dev',
      passwordHash: adminPassword,
      role: Role.ADMIN,
    },
  });
  console.log(`Seeded Admin: ${admin.email}`);

  const existingProject = await prisma.project.findFirst({
    where: { title: 'Pathao Courier COD Settlement Engine' },
  });

  if (!existingProject) {
    const demoProject = await prisma.project.create({
      data: {
        createdById: estimator.id,
        title: 'Pathao Courier COD Settlement Engine',
        rawRequirement:
          'Build an enterprise delivery logistics module for cash-on-delivery (COD) collection, automated rider payout balancing, merchant settlement reconciliation, and delivery confirmation OTP verification.',
        scopePointValue: 350,
        status: ProjectStatus.UNDER_REVIEW,
        executiveSummary:
          'Distributed courier logistics module with cash-on-delivery reconciliation ledgers, automated merchant disbursement queues, real-time rider payout balancing, and OTP-based parcel delivery verification.',
        riskLevel: RiskLevel.HIGH,
        recommendedStack: [
          'Next.js 15 (React 19)',
          'TypeScript',
          'Tailwind CSS',
          'Node.js & Express',
          'PostgreSQL',
          'Prisma ORM',
          'Redis Queue',
          'Socket.io',
        ],
        aiConfidenceScore: 91,
        isFallbackUsed: false,
        totalHours: 142,
        totalScopePoints: 31.575,
        baseCost: 11051.25,
        riskBufferPercent: 20,
        riskBufferAmount: 2210.25,
        finalTotalCost: 13261.5,
        estimatedWeeks: 5,
        milestone1Amount: 3978.45,
        milestone2Amount: 5304.6,
        milestone3Amount: 3978.45,
        features: {
          create: [
            {
              title: 'Multi-Role Authentication & Session Security (RBAC)',
              category: FeatureCategory.BACKEND,
              complexity: FeatureComplexity.MEDIUM,
              estimatedHours: 18,
              isIncluded: true,
            },
            {
              title: 'Relational Fleet & Merchant Database Architecture',
              category: FeatureCategory.DATABASE,
              complexity: FeatureComplexity.MEDIUM,
              estimatedHours: 16,
              isIncluded: true,
            },
            {
              title: 'Interactive Courier Dispatch & Real-Time Leaflet Map',
              category: FeatureCategory.FRONTEND,
              complexity: FeatureComplexity.HIGH,
              estimatedHours: 32,
              isIncluded: true,
            },
            {
              title: 'Asynchronous Driver Assignment & Matching Queue (Redis)',
              category: FeatureCategory.BACKEND,
              complexity: FeatureComplexity.HIGH,
              estimatedHours: 26,
              isIncluded: true,
            },
            {
              title: 'bKash & Stripe Escrow Settlement Gateway Integration',
              category: FeatureCategory.INTEGRATION,
              complexity: FeatureComplexity.HIGH,
              estimatedHours: 22,
              isIncluded: true,
            },
            {
              title: 'Operational Fleet Analytics & KPI Summary Dashboard',
              category: FeatureCategory.FRONTEND,
              complexity: FeatureComplexity.LOW,
              estimatedHours: 14,
              isIncluded: true,
            },
            {
              title: 'Predictive ETA & Delivery Route Optimization Engine',
              category: FeatureCategory.AI,
              complexity: FeatureComplexity.HIGH,
              estimatedHours: 14,
              isIncluded: true,
            },
          ],
        },
      },
    });

    console.log(`Seeded reference project: ${demoProject.title}`);
  }

  console.log('Database seeding complete.');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
