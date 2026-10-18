import { StatusCodes } from 'http-status-codes';
import prisma from '../../../config/prisma';
import AppError from '../../errors/AppError';
import CalculationService from '../../services/calculation.service';
import WorkflowService from '../../services/workflow.service';
import { ICreateFeatureInput, IUpdateFeatureInput } from './feature.interface';

/**
 * Add a custom feature to a project and recalculate metrics
 */
const addFeatureToProject = async (
  projectId: string,
  payload: ICreateFeatureInput
) => {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { features: true },
  });

  if (!project) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Project not found!');
  }

  // Guard 4: Immutability lock check
  WorkflowService.validateFeatureModification(project.status);

  const result = await prisma.$transaction(async (tx) => {
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

    // 2. Fetch all features after addition
    const allFeatures = await tx.feature.findMany({
      where: { projectId },
    });

    // 3. Recalculate project metrics
    const metrics = CalculationService.calculateMetrics(
      allFeatures.map((f) => ({
        estimatedHours: f.estimatedHours,
        isIncluded: f.isIncluded,
      })),
      project.hourlyRate,
      project.riskLevel
    );

    // 4. Update project with new metrics
    const updatedProject = await tx.project.update({
      where: { id: projectId },
      data: metrics,
      include: {
        features: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    return {
      feature: createdFeature,
      project: updatedProject,
    };
  });

  return result;
};

/**
 * Update an existing feature (hours, isIncluded checkbox, title, etc.) and recalculate metrics
 */
const updateFeatureInProject = async (
  projectId: string,
  featureId: string,
  payload: IUpdateFeatureInput
) => {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Project not found!');
  }

  // Guard 4: Immutability lock check
  WorkflowService.validateFeatureModification(project.status);

  const existingFeature = await prisma.feature.findUnique({
    where: { id: featureId },
  });

  if (!existingFeature || existingFeature.projectId !== projectId) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Feature not found in this project!');
  }

  const result = await prisma.$transaction(async (tx) => {
    // 1. Update feature
    const updatedFeature = await tx.feature.update({
      where: { id: featureId },
      data: payload,
    });

    // 2. Fetch all features
    const allFeatures = await tx.feature.findMany({
      where: { projectId },
    });

    // 3. Recalculate metrics
    const metrics = CalculationService.calculateMetrics(
      allFeatures.map((f) => ({
        estimatedHours: f.estimatedHours,
        isIncluded: f.isIncluded,
      })),
      project.hourlyRate,
      project.riskLevel
    );

    // 4. Update project
    const updatedProject = await tx.project.update({
      where: { id: projectId },
      data: metrics,
      include: {
        features: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    return {
      feature: updatedFeature,
      project: updatedProject,
    };
  });

  return result;
};

/**
 * Delete a feature from a project and recalculate metrics
 */
const deleteFeatureFromProject = async (
  projectId: string,
  featureId: string
) => {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Project not found!');
  }

  // Guard 4: Immutability lock check
  WorkflowService.validateFeatureModification(project.status);

  const existingFeature = await prisma.feature.findUnique({
    where: { id: featureId },
  });

  if (!existingFeature || existingFeature.projectId !== projectId) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Feature not found in this project!');
  }

  const result = await prisma.$transaction(async (tx) => {
    // 1. Delete feature
    await tx.feature.delete({
      where: { id: featureId },
    });

    // 2. Fetch remaining features
    const remainingFeatures = await tx.feature.findMany({
      where: { projectId },
    });

    // 3. Recalculate metrics
    const metrics = CalculationService.calculateMetrics(
      remainingFeatures.map((f) => ({
        estimatedHours: f.estimatedHours,
        isIncluded: f.isIncluded,
      })),
      project.hourlyRate,
      project.riskLevel
    );

    // 4. Update project metrics
    const updatedProject = await tx.project.update({
      where: { id: projectId },
      data: metrics,
      include: {
        features: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    return {
      message: 'Feature deleted successfully',
      project: updatedProject,
    };
  });

  return result;
};

export const FeatureServices = {
  addFeatureToProject,
  updateFeatureInProject,
  deleteFeatureFromProject,
};
