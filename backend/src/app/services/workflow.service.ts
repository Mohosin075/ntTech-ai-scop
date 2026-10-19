import { ProjectStatus, Role } from '@prisma/client';
import { StatusCodes } from 'http-status-codes';
import AppError from '../errors/AppError';

export class WorkflowService {
  static validateSubmission(totalHours: number): void {
    if (totalHours <= 0) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        'Cannot submit an empty scope for review. At least one feature must be included.'
      );
    }
  }

  static validateStatusTransition(
    currentStatus: ProjectStatus,
    targetStatus: ProjectStatus,
    userRole: Role,
    rejectionReason?: string
  ): void {
    const allowedTransitions: Record<ProjectStatus, ProjectStatus[]> = {
      [ProjectStatus.AI_ESTIMATED]: [ProjectStatus.UNDER_REVIEW],
      [ProjectStatus.UNDER_REVIEW]: [ProjectStatus.APPROVED, ProjectStatus.REJECTED],
      [ProjectStatus.REJECTED]: [ProjectStatus.UNDER_REVIEW],
      [ProjectStatus.APPROVED]: [],
    };

    if (!allowedTransitions[currentStatus].includes(targetStatus)) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        currentStatus === ProjectStatus.APPROVED
          ? 'Approved projects are finalized and locked.'
          : `Cannot transition a project from ${currentStatus} to ${targetStatus}.`
      );
    }

    if (targetStatus === ProjectStatus.UNDER_REVIEW) {
      return;
    }

    if (
      targetStatus === ProjectStatus.APPROVED ||
      targetStatus === ProjectStatus.REJECTED
    ) {
      if (userRole !== Role.ADMIN) {
        throw new AppError(
          StatusCodes.FORBIDDEN,
          'Forbidden: Only administrators can approve or reject project scopes.'
        );
      }

      if (targetStatus === ProjectStatus.REJECTED) {
        if (!rejectionReason || rejectionReason.trim().length < 10) {
          throw new AppError(
            StatusCodes.BAD_REQUEST,
            'A valid rejection reason of at least 10 characters is required when rejecting.'
          );
        }
      }
    }
  }

  static validateFeatureModification(projectStatus: ProjectStatus): void {
    if (
      projectStatus === ProjectStatus.APPROVED ||
      projectStatus === ProjectStatus.UNDER_REVIEW
    ) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        projectStatus === ProjectStatus.APPROVED
          ? 'Approved projects are locked. Features cannot be added, edited, or removed.'
          : 'Projects under review are locked. Wait for the review decision before changing the scope.'
      );
    }
  }
}

export default WorkflowService;
