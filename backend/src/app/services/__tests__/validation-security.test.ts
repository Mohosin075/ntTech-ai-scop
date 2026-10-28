import { describe, expect, it, vi } from 'vitest';
import type { Request, Response } from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { FeatureValidations } from '../../modules/feature/feature.validation';

describe('Feature update input sanitization', () => {
  it('removes IDs and nested relations before the controller receives the request', async () => {
    const req = {
      body: { title: 'Safe title', projectId: 'other-project', id: 'other-feature', project: { connect: { id: 'other-project' } } },
      params: { id: '11111111-1111-4111-8111-111111111111', featureId: '22222222-2222-4222-8222-222222222222' },
      query: {},
    } as unknown as Request;
    const next = vi.fn();
    await validateRequest(FeatureValidations.updateFeatureValidationSchema)(req, {} as Response, next);
    expect(next).toHaveBeenCalledWith();
    expect(req.body).toEqual({ title: 'Safe title' });
  });
});
