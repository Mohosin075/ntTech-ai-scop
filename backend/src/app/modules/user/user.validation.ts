import { z } from 'zod';

const createUserValidationSchema = z.object({
  body: z.object({
    email: z.string().email('Valid email is required'),
    name: z.string().min(2, 'Name must have at least 2 characters').optional(),
    role: z.enum(['USER', 'ADMIN']).optional(),
  }),
});

const updateUserValidationSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    role: z.enum(['USER', 'ADMIN']).optional(),
  }),
  params: z.object({
    id: z.string().uuid('Valid user UUID is required'),
  }),
});

export const UserValidations = {
  createUserValidationSchema,
  updateUserValidationSchema,
};
