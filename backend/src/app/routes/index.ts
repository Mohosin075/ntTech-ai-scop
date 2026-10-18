import { Router } from 'express';
import { TaskRoutes } from '../modules/task/task.routes';
import { UserRoutes } from '../modules/user/user.routes';

const router = Router();

const moduleRoutes = [
  {
    path: '/users',
    route: UserRoutes,
  },
  {
    path: '/tasks',
    route: TaskRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
