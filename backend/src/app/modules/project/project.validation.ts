import { ProjectStatus } from '@prisma/client';
import { z } from 'zod';

const generateProjectValidationSchema = z.object({
  body: z.object({
    title: z.string().min(3, 'Title must have at least 3 characters'),
    rawRequirement: z.string().min(20, 'Raw requirement description must be at least 20 characters long'),
  }),
});

const updateStatusValidationSchema = z.object({
  body: z.object({
    status: z.nativeEnum(ProjectStatus, {
      errorMap: () => ({ message: 'Status must be AI_ESTIMATED, UNDER_REVIEW, APPROVED, or REJECTED' }),
    }),
    rejectionReason: z.string().optional(),
  }),
  params: z.object({
    id: z.string().uuid('Valid project UUID is required'),
  }),
});

const updateProjectFeeValidationSchema = z.object({
  body: z.object({
    finalTotalCost: z.number().min(100, 'Project fee must be at least $100').max(5000000, 'Project fee is above the supported limit'),
  }),
  params: z.object({
    id: z.string().uuid('Valid project UUID is required'),
  }),
});

const projectIdParamValidationSchema = z.object({
  params: z.object({
    id: z.string().uuid('Valid project UUID is required'),
  }),
});

const listProjectsValidationSchema = z.object({
  query: z.object({
    status: z.nativeEnum(ProjectStatus).optional(),
  }),
});

export const ProjectValidations = {
  generateProjectValidationSchema,
  updateStatusValidationSchema,
  updateProjectFeeValidationSchema,
  projectIdParamValidationSchema,
  listProjectsValidationSchema,
};
