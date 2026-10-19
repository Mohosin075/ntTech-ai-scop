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

router.get(
  '/',
  validateRequest(ProjectValidations.listProjectsValidationSchema),
  ProjectControllers.getAllProjects
);

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
  '/:id/fee',
  validateRequest(ProjectValidations.updateProjectFeeValidationSchema),
  ProjectControllers.updateProjectFee
);

router.delete(
  '/:id',
  validateRequest(ProjectValidations.projectIdParamValidationSchema),
  ProjectControllers.deleteProject
);

export const ProjectRoutes = router;
