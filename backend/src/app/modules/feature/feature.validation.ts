import { FeatureCategory, FeatureComplexity } from '@prisma/client';
import { z } from 'zod';

const createFeatureValidationSchema = z.object({
  body: z.object({
    title: z.string().min(2, 'Feature title must have at least 2 characters'),
    category: z.nativeEnum(FeatureCategory, {
      errorMap: () => ({ message: 'Category must be FRONTEND, BACKEND, DATABASE, INTEGRATION, or AI' }),
    }),
    complexity: z.nativeEnum(FeatureComplexity, {
      errorMap: () => ({ message: 'Complexity must be LOW, MEDIUM, or HIGH' }),
    }),
    estimatedHours: z.number().min(1, 'Minimum estimated hours is 1').max(200, 'Maximum hours for a single feature is 200'),
    isIncluded: z.boolean().optional(),
  }),
  params: z.object({
    id: z.string().uuid('Valid project UUID is required'),
  }),
});

const updateFeatureValidationSchema = z.object({
  body: z.object({
    title: z.string().min(2).optional(),
    category: z.nativeEnum(FeatureCategory).optional(),
    complexity: z.nativeEnum(FeatureComplexity).optional(),
    estimatedHours: z.number().min(1).max(200).optional(),
    isIncluded: z.boolean().optional(),
  }),
  params: z.object({
    id: z.string().uuid('Valid project UUID is required'),
    featureId: z.string().uuid('Valid feature UUID is required'),
  }),
});

const featureParamsValidationSchema = z.object({
  params: z.object({
    id: z.string().uuid('Valid project UUID is required'),
    featureId: z.string().uuid('Valid feature UUID is required'),
  }),
});

export const FeatureValidations = {
  createFeatureValidationSchema,
  updateFeatureValidationSchema,
  featureParamsValidationSchema,
};
