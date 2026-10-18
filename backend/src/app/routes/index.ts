import { Router } from 'express';
import { AuthRoutes } from '../modules/auth/auth.routes';
import { FeatureRoutes } from '../modules/feature/feature.routes';
import { ProjectRoutes } from '../modules/project/project.routes';

const router = Router();

// Module routes registry
router.use('/auth', AuthRoutes);
router.use('/projects', ProjectRoutes);
router.use('/projects/:id/features', FeatureRoutes);

export default router;
