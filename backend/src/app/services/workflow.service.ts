import { ProjectStatus, Role } from '@prisma/client';
import { StatusCodes } from 'http-status-codes';
import AppError from '../errors/AppError';

export class WorkflowService {
  /**
   * Rule 1 (Empty Scope Guard):
   * Cannot submit for review if total active hours is 0.
   */
  static validateSubmission(totalHours: number): void {
    if (totalHours <= 0) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        'Cannot submit an empty scope for review. At least one feature must be included.'
      );
    }
  }

  /**
   * Rule 2 (Role Guard) & Rule 3 (Rejection Reason Guard):
   * Validate status transitions according to state machine rules.
   */
  static validateStatusTransition(
    currentStatus: ProjectStatus,
    targetStatus: ProjectStatus,
    userRole: Role,
    rejectionReason?: string
  ): void {
    // Cannot change from an immutable finalized state without admin override
    if (currentStatus === ProjectStatus.APPROVED && targetStatus !== ProjectStatus.APPROVED) {
      if (userRole !== Role.ADMIN) {
        throw new AppError(
          StatusCodes.BAD_REQUEST,
          'Approved projects are finalized and locked.'
        );
      }
    }

    // Submitting for review (from AI_ESTIMATED or REJECTED -> UNDER_REVIEW)
    if (targetStatus === ProjectStatus.UNDER_REVIEW) {
      // Anyone (Estimator or Admin) can submit/resubmit
      return;
    }

    // Approving or Rejecting (UNDER_REVIEW -> APPROVED or REJECTED)
    if (
      targetStatus === ProjectStatus.APPROVED ||
      targetStatus === ProjectStatus.REJECTED
    ) {
      // Rule 2: Only Admin can approve or reject
      if (userRole !== Role.ADMIN) {
        throw new AppError(
          StatusCodes.FORBIDDEN,
          'Forbidden: Only administrators can approve or reject project scopes.'
        );
      }

      // Rule 3: Rejection Reason Requirement
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

  /**
   * Rule 4 (Immutability Lock):
   * Once a project is approved, features cannot be created, modified, or deleted.
   */
  static validateFeatureModification(projectStatus: ProjectStatus): void {
    if (projectStatus === ProjectStatus.APPROVED) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        'Approved projects are locked. Features cannot be added, edited, or removed.'
      );
    }
  }
}

export default WorkflowService;
