import { FeatureCategory, FeatureComplexity, PrismaClient, ProjectStatus, RiskLevel, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database for ScopeAI...');

  // 1. Create default passwords
  const salt = await bcrypt.genSalt(10);
  const estimatorPassword = await bcrypt.hash('Estimator123!', salt);
  const adminPassword = await bcrypt.hash('Admin123!', salt);

  // 2. Upsert Demo Estimator
  const estimator = await prisma.user.upsert({
    where: { email: 'estimator@scopeai.dev' },
    update: {},
    create: {
      name: 'Mohosin (Lead Estimator)',
      email: 'estimator@scopeai.dev',
      passwordHash: estimatorPassword,
      role: Role.ESTIMATOR,
    },
  });
  console.log(`👤 Seeded Estimator: ${estimator.email} (Password: Estimator123!)`);

  // 3. Upsert Demo Admin Reviewer
  const admin = await prisma.user.upsert({
    where: { email: 'admin@scopeai.dev' },
    update: {},
    create: {
      name: 'Sarah Jenkins (Tech Lead / Admin)',
      email: 'admin@scopeai.dev',
      passwordHash: adminPassword,
      role: Role.ADMIN,
    },
  });
  console.log(`👑 Seeded Admin Reviewer: ${admin.email} (Password: Admin123!)`);

  // 4. Seed a Realistic Demo Project
  const existingProject = await prisma.project.findFirst({
    where: { title: 'Multi-vendor On-Demand Logistics & Delivery Hub' },
  });

  if (!existingProject) {
    const demoProject = await prisma.project.create({
      data: {
        createdById: estimator.id,
        title: 'Multi-vendor On-Demand Logistics & Delivery Hub',
        rawRequirement:
          'Build an end-to-end multi-vendor on-demand logistics system with real-time GPS courier tracking, customer dispatch ordering, driver assignment queue, Stripe checkout, automated receipt generation, and a high-performance administration portal.',
        hourlyRate: 35,
        status: ProjectStatus.UNDER_REVIEW,
        executiveSummary:
          'High-scale distributed logistics and delivery platform featuring real-time driver tracking, resilient payment settlement, automated order dispatch queues, and dedicated operational dashboards for merchants and fleet admins.',
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

        // Metrics (142 Hours, Base: $4,970, Buffer: 20% = $994, Total: $5,964, Weeks: 5)
        totalHours: 142,
        baseCost: 4970,
        riskBufferPercent: 20,
        riskBufferAmount: 994,
        finalTotalCost: 5964,
        estimatedWeeks: 5,
        milestone1Amount: 1789.2, // 30%
        milestone2Amount: 2385.6, // 40%
        milestone3Amount: 1789.2, // 30%

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
              title: 'Stripe Escrow & Payout Gateway Integration',
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

    console.log(`📦 Seeded Demo Project: ${demoProject.title} (ID: ${demoProject.id})`);
  }

  console.log('✅ Database seeding finished successfully.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
