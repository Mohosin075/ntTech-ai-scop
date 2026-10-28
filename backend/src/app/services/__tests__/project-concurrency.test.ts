import { randomUUID } from 'crypto';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { ProjectStatus, Role } from '@prisma/client';
import prisma from '../../../config/prisma';
import { ProjectServices } from '../../modules/project/project.service';
import { FeatureServices } from '../../modules/feature/feature.service';
import { withProjectLock } from '../projectTransaction';
import CalculationService from '../calculation.service';

// Opt in: creates isolated fixtures and removes only those fixtures afterward.
describe.skipIf(process.env.RUN_DB_TESTS !== '1')('PostgreSQL scope concurrency', () => {
  const ownerId = randomUUID();
  const reviewerId = randomUUID();
  const feature = { title: 'Original feature', category: 'BACKEND' as const, complexity: 'MEDIUM' as const, estimatedHours: 10, isIncluded: true };
  beforeAll(async () => {
    await prisma.user.createMany({ data: [ownerId, reviewerId].map((id, i) => ({
      id, name: 'Regression fixture', email: `${id}@test.invalid`, passwordHash: 'not-a-login-hash', role: i ? Role.ADMIN : Role.ESTIMATOR,
    })) });
  });
  afterAll(async () => {
    await prisma.user.deleteMany({ where: { id: { in: [ownerId, reviewerId] } } });
    await prisma.$disconnect();
  });
  const createProject = (status: ProjectStatus = ProjectStatus.AI_ESTIMATED) => prisma.project.create({ data: {
    title: 'Concurrency regression fixture', rawRequirement: 'Isolated regression fixture', createdById: ownerId, status,
    executiveSummary: 'Isolated regression fixture', riskLevel: 'MEDIUM', recommendedStack: ['PostgreSQL'], aiConfidenceScore: 90,
    ...CalculationService.calculateMetrics([feature], 350, 'MEDIUM'), features: { create: feature },
  }, include: { features: true } });

  it('cannot move a feature into an approved project even via direct service input', async () => {
    const source = await createProject();
    const destination = await createProject(ProjectStatus.APPROVED);
    await FeatureServices.updateFeatureInProject(source.id, source.features[0].id, ownerId, {
      title: 'Updated safely', projectId: destination.id,
    } as Parameters<typeof FeatureServices.updateFeatureInProject>[3]);
    const stored = await prisma.feature.findUniqueOrThrow({ where: { id: source.features[0].id } });
    expect(stored.projectId).toBe(source.id);
    expect(await prisma.feature.count({ where: { projectId: destination.id } })).toBe(1);
  });

  it('lets only one concurrent reviewer commit a decision', async () => {
    const project = await createProject(ProjectStatus.UNDER_REVIEW);
    const results = await Promise.allSettled([
      ProjectServices.updateProjectStatus(project.id, reviewerId, Role.ADMIN, { status: ProjectStatus.APPROVED }),
      ProjectServices.updateProjectStatus(project.id, reviewerId, Role.ADMIN, { status: ProjectStatus.REJECTED, rejectionReason: 'Needs additional scope details' }),
    ]);
    expect(results.filter(r => r.status === 'fulfilled')).toHaveLength(1);
    expect(results.filter(r => r.status === 'rejected')).toHaveLength(1);
  });

  it('rechecks the status after waiting for an in-flight submission lock', async () => {
    const project = await createProject();
    let release!: () => void;
    let locked!: () => void;
    const gate = new Promise<void>(resolve => { release = resolve; });
    const ready = new Promise<void>(resolve => { locked = resolve; });
    const submission = withProjectLock(project.id, async tx => {
      locked();
      await gate;
      await tx.project.update({ where: { id: project.id }, data: { status: ProjectStatus.UNDER_REVIEW } });
    });
    await ready;
    const edit = FeatureServices.updateFeatureInProject(project.id, project.features[0].id, ownerId, { estimatedHours: 100 });
    const outcome = Promise.allSettled([submission, edit]);
    release();
    const results = await outcome;
    expect(results[0].status).toBe('fulfilled');
    expect(results[1].status).toBe('rejected');
    expect((await prisma.feature.findUniqueOrThrow({ where: { id: project.features[0].id } })).estimatedHours).toBe(10);
  });

  it('keeps totals consistent when two features change concurrently', async () => {
    const project = await createProject();
    const added = await FeatureServices.addFeatureToProject(project.id, ownerId, feature);
    await Promise.all([
      FeatureServices.updateFeatureInProject(project.id, project.features[0].id, ownerId, { estimatedHours: 30 }),
      FeatureServices.updateFeatureInProject(project.id, added.feature.id, ownerId, { estimatedHours: 40 }),
    ]);
    expect((await prisma.project.findUniqueOrThrow({ where: { id: project.id } })).totalHours).toBe(70);
  });
});
