import { Router } from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { UserControllers } from './user.controller';
import { UserValidations } from './user.validation';

const router = Router();

router.post(
  '/',
  validateRequest(UserValidations.createUserValidationSchema),
  UserControllers.createUser
);

router.get('/', UserControllers.getAllUsers);

router.get('/:id', UserControllers.getSingleUser);

router.patch(
  '/:id',
  validateRequest(UserValidations.updateUserValidationSchema),
  UserControllers.updateUser
);

router.delete('/:id', UserControllers.deleteUser);

export const UserRoutes = router;
