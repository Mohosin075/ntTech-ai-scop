import { ProjectStatus, Role } from '@prisma/client';
import { StatusCodes } from 'http-status-codes';
import prisma from '../../../config/prisma';
import AppError from '../../errors/AppError';
import AIService from '../../services/ai.service';
import CalculationService from '../../services/calculation.service';
import WorkflowService from '../../services/workflow.service';
import {
  IGenerateProjectInput,
  IUpdateHourlyRateInput,
  IUpdateProjectStatusInput,
} from './project.interface';

// Reusable database projection objects (DRY principle)
const userSummarySelect = {
  id: true,
  name: true,
  email: true,
  role: true,
} as const;

const projectFullDetailsInclude = {
  createdBy: { select: userSummarySelect },
  reviewedBy: { select: userSummarySelect },
  features: { orderBy: { createdAt: 'asc' as const } },
} as const;

/**
 * AI-powered project scope and cost generation
 */
const generateProjectWithAI = async (
  userId: string,
  payload: IGenerateProjectInput
) => {
  // 1. Run AI analysis & feature breakdown
  const aiResult = await AIService.generateScope(
    payload.title,
    payload.rawRequirement
  );

  // 2. Perform business mathematical calculations
  const featuresForCalc = aiResult.features.map((f) => ({
    estimatedHours: f.estimatedHours,
    isIncluded: true,
  }));

  const metrics = CalculationService.calculateMetrics(
    featuresForCalc,
    payload.hourlyRate,
    aiResult.riskLevel
  );

  // 3. Persist Project & Features into Database via Prisma Transaction
  const project = await prisma.$transaction(async (tx) => {
    const createdProject = await tx.project.create({
      data: {
        createdById: userId,
        title: payload.title,
        rawRequirement: payload.rawRequirement,
        hourlyRate: payload.hourlyRate,
        status: ProjectStatus.AI_ESTIMATED,
        executiveSummary: aiResult.executiveSummary,
        riskLevel: aiResult.riskLevel,
        recommendedStack: aiResult.recommendedStack,
        aiConfidenceScore: aiResult.aiConfidenceScore,
        isFallbackUsed: aiResult.isFallbackUsed,
        ...metrics,
      },
    });

    if (aiResult.features.length > 0) {
      await tx.feature.createMany({
        data: aiResult.features.map((feat) => ({
          projectId: createdProject.id,
          title: feat.title,
          category: feat.category,
          complexity: feat.complexity,
          estimatedHours: feat.estimatedHours,
          isIncluded: true,
        })),
      });
    }

    return tx.project.findUnique({
      where: { id: createdProject.id },
      include: projectFullDetailsInclude,
    });
  });

  return project;
};

/**
 * Get all projects with optional status filtering
 */
const getAllProjectsFromDB = async (statusFilter?: ProjectStatus) => {
  const whereClause = statusFilter ? { status: statusFilter } : {};

  const projects = await prisma.project.findMany({
    where: whereClause,
    orderBy: { createdAt: 'desc' },
    include: {
      createdBy: { select: userSummarySelect },
      _count: {
        select: { features: true },
      },
    },
  });

  return projects;
};

/**
 * Get a single project with its features and creator/reviewer
 */
const getSingleProjectFromDB = async (projectId: string) => {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: projectFullDetailsInclude,
  });

  if (!project) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Project not found!');
  }

  return project;
};

/**
 * Update project status with state machine guards
 */
const updateProjectStatus = async (
  projectId: string,
  userId: string,
  userRole: Role,
  payload: IUpdateProjectStatusInput
) => {
  const project = await getSingleProjectFromDB(projectId);

  // Guard 1: Empty Scope Check before submitting to UNDER_REVIEW
  if (payload.status === ProjectStatus.UNDER_REVIEW) {
    WorkflowService.validateSubmission(project.totalHours);
  }

  // Guard 2 & 3: Role and Rejection Reason Validation
  WorkflowService.validateStatusTransition(
    project.status,
    payload.status,
    userRole,
    payload.rejectionReason
  );

  const updatedProject = await prisma.project.update({
    where: { id: projectId },
    data: {
      status: payload.status,
      rejectionReason:
        payload.status === ProjectStatus.REJECTED
          ? payload.rejectionReason
          : payload.status === ProjectStatus.UNDER_REVIEW
          ? null // clear rejection reason on resubmission
          : project.rejectionReason,
      reviewedById:
        payload.status === ProjectStatus.APPROVED ||
        payload.status === ProjectStatus.REJECTED
          ? userId
          : project.reviewedById,
    },
    include: projectFullDetailsInclude,
  });

  return updatedProject;
};

/**
 * Update project hourly rate and recalculate metrics
 */
const updateHourlyRate = async (
  projectId: string,
  payload: IUpdateHourlyRateInput
) => {
  const project = await getSingleProjectFromDB(projectId);

  // Guard 4: Immutability lock check
  WorkflowService.validateFeatureModification(project.status);

  const metrics = CalculationService.calculateMetrics(
    project.features.map((f) => ({
      estimatedHours: f.estimatedHours,
      isIncluded: f.isIncluded,
    })),
    payload.hourlyRate,
    project.riskLevel
  );

  const updatedProject = await prisma.project.update({
    where: { id: projectId },
    data: {
      hourlyRate: payload.hourlyRate,
      ...metrics,
    },
    include: projectFullDetailsInclude,
  });

  return updatedProject;
};

/**
 * Delete a project
 */
const deleteProjectFromDB = async (projectId: string) => {
  await getSingleProjectFromDB(projectId);

  await prisma.project.delete({
    where: { id: projectId },
  });

  return { message: 'Project deleted successfully' };
};

export const ProjectServices = {
  generateProjectWithAI,
  getAllProjectsFromDB,
  getSingleProjectFromDB,
  updateProjectStatus,
  updateHourlyRate,
  deleteProjectFromDB,
};
