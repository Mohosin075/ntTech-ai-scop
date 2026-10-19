import { ProjectStatus, Role } from '@prisma/client';
import { describe, expect, it } from 'vitest';
import AppError from '../../errors/AppError';
import WorkflowService from '../workflow.service';

describe('WorkflowService — State Machine & Guard Validation', () => {
  describe('Rule 1: Empty Scope Guard', () => {
    it('should throw 400 Bad Request if total active hours is 0 or less', () => {
      expect(() => WorkflowService.validateSubmission(0)).toThrow(AppError);
      expect(() => WorkflowService.validateSubmission(-5)).toThrow(AppError);
    });

    it('should pass if total active hours is greater than 0', () => {
      expect(() => WorkflowService.validateSubmission(10)).not.toThrow();
    });
  });

  describe('Rule 2: Role Guard', () => {
    it('should throw 403 Forbidden when an ESTIMATOR attempts to approve or reject', () => {
      expect(() =>
        WorkflowService.validateStatusTransition(
          ProjectStatus.UNDER_REVIEW,
          ProjectStatus.APPROVED,
          Role.ESTIMATOR
        )
      ).toThrow(AppError);

      expect(() =>
        WorkflowService.validateStatusTransition(
          ProjectStatus.UNDER_REVIEW,
          ProjectStatus.REJECTED,
          Role.ESTIMATOR,
          'Valid reason with more than 10 characters'
        )
      ).toThrow(AppError);
    });

    it('should allow ADMIN to approve', () => {
      expect(() =>
        WorkflowService.validateStatusTransition(
          ProjectStatus.UNDER_REVIEW,
          ProjectStatus.APPROVED,
          Role.ADMIN
        )
      ).not.toThrow();
    });
  });

  describe('Rule 3: Rejection Reason Requirement', () => {
    it('should throw 400 Bad Request if rejecting without a reason or with less than 10 chars', () => {
      expect(() =>
        WorkflowService.validateStatusTransition(
          ProjectStatus.UNDER_REVIEW,
          ProjectStatus.REJECTED,
          Role.ADMIN,
          '' // Empty
        )
      ).toThrow(AppError);

      expect(() =>
        WorkflowService.validateStatusTransition(
          ProjectStatus.UNDER_REVIEW,
          ProjectStatus.REJECTED,
          Role.ADMIN,
          'Short' // Only 5 chars
        )
      ).toThrow(AppError);
    });

    it('should pass rejection when valid reason >= 10 chars is provided by ADMIN', () => {
      expect(() =>
        WorkflowService.validateStatusTransition(
          ProjectStatus.UNDER_REVIEW,
          ProjectStatus.REJECTED,
          Role.ADMIN,
          'Estimated hours for payment gateway seem over-scoped.'
        )
      ).not.toThrow();
    });
  });

  describe('Rule 4: Immutability Lock', () => {
    it('should throw 400 Bad Request when attempting to modify features on an APPROVED project', () => {
      expect(() =>
        WorkflowService.validateFeatureModification(ProjectStatus.APPROVED)
      ).toThrow(AppError);
    });

    it('should allow feature modification when project is AI_ESTIMATED or REJECTED', () => {
      expect(() =>
        WorkflowService.validateFeatureModification(ProjectStatus.AI_ESTIMATED)
      ).not.toThrow();
      expect(() =>
        WorkflowService.validateFeatureModification(ProjectStatus.UNDER_REVIEW)
      ).toThrow(AppError);
      expect(() =>
        WorkflowService.validateFeatureModification(ProjectStatus.REJECTED)
      ).not.toThrow();
    });
  });
});
