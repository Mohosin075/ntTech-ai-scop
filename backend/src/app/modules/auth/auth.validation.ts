import { z } from 'zod';

const registerValidationSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must have at least 2 characters'),
    email: z.string().email('Valid email address is required'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
    role: z.enum(['ESTIMATOR', 'ADMIN']).optional(),
  }),
});

const loginValidationSchema = z.object({
  body: z.object({
    email: z.string().email('Valid email address is required'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const AuthValidations = {
  registerValidationSchema,
  loginValidationSchema,
};
