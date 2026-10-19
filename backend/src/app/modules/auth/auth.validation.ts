import { z } from 'zod';

const registerValidationSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2, 'Name must have at least 2 characters'),
    email: z.string().email('Valid email address is required'),
    password: z.string().min(8, 'Password must be at least 8 characters long'),
  }).strict(),
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
