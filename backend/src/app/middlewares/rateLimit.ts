import { rateLimit } from 'express-rate-limit';

const message = { success: false, message: 'Too many requests. Please try again later.' };

// IP-based limits also cover requests that fail validation or authentication.
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message,
});

// Authenticated accounts get independent AI budgets, including behind shared IPs.
export const generationRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  keyGenerator: (req) => req.user!.id,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message,
});
