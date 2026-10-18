import { z } from 'zod';

const createTaskValidationSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']).optional(),
    userId: z.string().uuid('Valid user UUID is required'),
  }),
});

const updateTaskValidationSchema = z.object({
  body: z.object({
    title: z.string().min(1).optional(),
    description: z.string().optional(),
    status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']).optional(),
  }),
  params: z.object({
    id: z.string().uuid('Valid task UUID is required'),
  }),
});

export const TaskValidations = {
  createTaskValidationSchema,
  updateTaskValidationSchema,
};
