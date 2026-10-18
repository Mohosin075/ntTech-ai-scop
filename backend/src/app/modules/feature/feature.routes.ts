import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import validateRequest from '../../middlewares/validateRequest';
import { FeatureControllers } from './feature.controller';
import { FeatureValidations } from './feature.validation';

const router = Router({ mergeParams: true });

router.use(authenticate);

router.post(
  '/',
  validateRequest(FeatureValidations.createFeatureValidationSchema),
  FeatureControllers.addFeature
);

router.patch(
  '/:featureId',
  validateRequest(FeatureValidations.updateFeatureValidationSchema),
  FeatureControllers.updateFeature
);

router.delete(
  '/:featureId',
  validateRequest(FeatureValidations.featureParamsValidationSchema),
  FeatureControllers.deleteFeature
);

export const FeatureRoutes = router;
