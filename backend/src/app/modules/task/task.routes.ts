import { Router } from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { TaskControllers } from './task.controller';
import { TaskValidations } from './task.validation';

const router = Router();

router.post(
  '/',
  validateRequest(TaskValidations.createTaskValidationSchema),
  TaskControllers.createTask
);

router.get('/', TaskControllers.getAllTasks);

router.get('/:id', TaskControllers.getSingleTask);

router.patch(
  '/:id',
  validateRequest(TaskValidations.updateTaskValidationSchema),
  TaskControllers.updateTask
);

router.delete('/:id', TaskControllers.deleteTask);

export const TaskRoutes = router;
