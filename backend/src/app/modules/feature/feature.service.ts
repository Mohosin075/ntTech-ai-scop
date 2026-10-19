import { Prisma, RiskLevel } from '@prisma/client';
import { StatusCodes } from 'http-status-codes';
import prisma from '../../../config/prisma';
import AppError from '../../errors/AppError';
import CalculationService from '../../services/calculation.service';
import WorkflowService from '../../services/workflow.service';
import { ICreateFeatureInput, IUpdateFeatureInput } from './feature.interface';

const assertProjectOwner = (createdById: string, userId: string): void => {
  if (createdById !== userId) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      'You can only change features in projects that you created.'
    );
  }
};

/**
 * Reusable helper to recalculate project metrics and persist state inside transaction
 */
const recalculateAndSyncProject = async (
  tx: Prisma.TransactionClient,
  projectId: string,
  scopePointValue: number,
  riskLevel: RiskLevel
) => {
  const allFeatures = await tx.feature.findMany({
    where: { projectId },
    orderBy: { createdAt: 'asc' },
  });

  const metrics = CalculationService.calculateMetrics(
    allFeatures.map((f) => ({
      estimatedHours: f.estimatedHours,
      isIncluded: f.isIncluded,
      category: f.category,
      complexity: f.complexity,
    })),
    scopePointValue,
    riskLevel
  );

  const updatedProject = await tx.project.update({
    where: { id: projectId },
    data: metrics,
    include: {
      features: {
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  return updatedProject;
};

/**
 * Add a custom feature to a project and recalculate metrics
 */
const addFeatureToProject = async (
  projectId: string,
  userId: string,
  payload: ICreateFeatureInput
) => {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Project not found!');
  }
  assertProjectOwner(project.createdById, userId);

  // Guard 4: Immutability lock check
  WorkflowService.validateFeatureModification(project.status);

  return prisma.$transaction(async (tx) => {
    // 1. Create feature
    const createdFeature = await tx.feature.create({
      data: {
        projectId,
        title: payload.title,
        category: payload.category,
        complexity: payload.complexity,
        estimatedHours: payload.estimatedHours,
        isIncluded: payload.isIncluded ?? true,
      },
    });

    // 2. Recalculate & sync project metrics
    const updatedProject = await recalculateAndSyncProject(
      tx,
      projectId,
      project.scopePointValue,
      project.riskLevel
    );

    return {
      feature: createdFeature,
      project: updatedProject,
    };
  });
};

/**
 * Update an existing feature (hours, isIncluded checkbox, title, etc.) and recalculate metrics
 */
const updateFeatureInProject = async (
  projectId: string,
  featureId: string,
  userId: string,
  payload: IUpdateFeatureInput
) => {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Project not found!');
  }
  assertProjectOwner(project.createdById, userId);

  // Guard 4: Immutability lock check
  WorkflowService.validateFeatureModification(project.status);

  const existingFeature = await prisma.feature.findUnique({
    where: { id: featureId },
  });

  if (!existingFeature || existingFeature.projectId !== projectId) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Feature not found in this project!');
  }

  return prisma.$transaction(async (tx) => {
    // 1. Update feature
    const updatedFeature = await tx.feature.update({
      where: { id: featureId },
      data: payload,
    });

    // 2. Recalculate & sync project metrics
    const updatedProject = await recalculateAndSyncProject(
      tx,
      projectId,
      project.scopePointValue,
      project.riskLevel
    );

    return {
      feature: updatedFeature,
      project: updatedProject,
    };
  });
};

/**
 * Delete a feature from a project and recalculate metrics
 */
const deleteFeatureFromProject = async (
  projectId: string,
  featureId: string,
  userId: string
) => {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Project not found!');
  }
  assertProjectOwner(project.createdById, userId);

  // Guard 4: Immutability lock check
  WorkflowService.validateFeatureModification(project.status);

  const existingFeature = await prisma.feature.findUnique({
    where: { id: featureId },
  });

  if (!existingFeature || existingFeature.projectId !== projectId) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Feature not found in this project!');
  }

  return prisma.$transaction(async (tx) => {
    // 1. Delete feature
    await tx.feature.delete({
      where: { id: featureId },
    });

    // 2. Recalculate & sync project metrics
    const updatedProject = await recalculateAndSyncProject(
      tx,
      projectId,
      project.scopePointValue,
      project.riskLevel
    );

    return {
      message: 'Feature deleted successfully',
      project: updatedProject,
    };
  });
};

export const FeatureServices = {
  addFeatureToProject,
  updateFeatureInProject,
  deleteFeatureFromProject,
};
