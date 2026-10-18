import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import validateRequest from '../../middlewares/validateRequest';
import { ProjectControllers } from './project.controller';
import { ProjectValidations } from './project.validation';

const router = Router();

router.use(authenticate);

router.post(
  '/generate',
  validateRequest(ProjectValidations.generateProjectValidationSchema),
  ProjectControllers.generateProject
);

router.get('/', ProjectControllers.getAllProjects);

router.get(
  '/:id',
  validateRequest(ProjectValidations.projectIdParamValidationSchema),
  ProjectControllers.getSingleProject
);

router.patch(
  '/:id/status',
  validateRequest(ProjectValidations.updateStatusValidationSchema),
  ProjectControllers.updateProjectStatus
);

router.patch(
  '/:id/rate',
  validateRequest(ProjectValidations.updateHourlyRateValidationSchema),
  ProjectControllers.updateHourlyRate
);

router.delete(
  '/:id',
  validateRequest(ProjectValidations.projectIdParamValidationSchema),
  ProjectControllers.deleteProject
);

export const ProjectRoutes = router;
