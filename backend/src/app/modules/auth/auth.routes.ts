import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import validateRequest from '../../middlewares/validateRequest';
import { AuthControllers } from './auth.controller';
import { AuthValidations } from './auth.validation';

const router = Router();

router.post(
  '/register',
  validateRequest(AuthValidations.registerValidationSchema),
  AuthControllers.register
);

router.post(
  '/login',
  validateRequest(AuthValidations.loginValidationSchema),
  AuthControllers.login
);

router.get('/me', authenticate, AuthControllers.getMe);

export const AuthRoutes = router;
