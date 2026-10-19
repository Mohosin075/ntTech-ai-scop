import { describe, expect, it } from 'vitest';
import { AuthValidations } from '../auth.validation';

describe('Auth validation — public registration', () => {
  const validRegistration = {
    name: 'Test Estimator',
    email: 'estimator@example.com',
    password: 'Estimator123!',
  };

  it('accepts a standard registration without a role field', () => {
    expect(() => AuthValidations.registerValidationSchema.parse({ body: validRegistration })).not.toThrow();
  });

  it('rejects attempts to choose an administrator role during public registration', () => {
    expect(() => AuthValidations.registerValidationSchema.parse({
      body: { ...validRegistration, role: 'ADMIN' },
    })).toThrow();
  });

  it('requires a password of at least eight characters', () => {
    expect(() => AuthValidations.registerValidationSchema.parse({
      body: { ...validRegistration, password: 'short7' },
    })).toThrow();
  });
});
