import { Router } from 'express';
import { authRateLimit } from '../../middlewares/rateLimit';
import { authenticate } from '../../middlewares/auth.middleware';
import validateRequest from '../../middlewares/validateRequest';
import { AuthControllers } from './auth.controller';
import { AuthValidations } from './auth.validation';

const router = Router();

router.post(
  '/register',
  authRateLimit,
  validateRequest(AuthValidations.registerValidationSchema),
  AuthControllers.register
);

router.post(
  '/login',
  authRateLimit,
  validateRequest(AuthValidations.loginValidationSchema),
  AuthControllers.login
);

router.get('/me', authenticate, AuthControllers.getMe);

export const AuthRoutes = router;
