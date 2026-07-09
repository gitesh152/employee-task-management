import express from 'express';

import { ROLES } from '../constants/roles.constant.js';
import { taskController } from '../controllers/index.js';
import authentication from '../middlewares/authentication.middleware.js';
import authorize from '../middlewares/authorization.middleware.js';
import requestValidation from '../middlewares/request.validation.middleware.js';
import taskUpload from '../middlewares/task.upload.middleware.js';
import { taskValidation } from '../validations/index.js';

const router = express.Router();

router.post(
  '/',
  authentication,
  authorize(ROLES.ADMIN),
  taskUpload,
  requestValidation(taskValidation.createTaskSchema),
  taskController.createTask,
);
router.get(
  '/',
  authentication,
  authorize(ROLES.ADMIN, ROLES.EMPLOYEE),
  requestValidation(taskValidation.listTasksQuerySchema),
  taskController.listTasks,
);
router.get(
  '/:id',
  authentication,
  authorize(ROLES.ADMIN, ROLES.EMPLOYEE),
  requestValidation(taskValidation.taskIdSchema),
  taskController.getTask,
);
router.put(
  '/:id',
  authentication,
  authorize(ROLES.ADMIN, ROLES.EMPLOYEE),
  requestValidation(taskValidation.updateTaskSchema),
  taskController.updateTask,
);
router.delete(
  '/:id',
  authentication,
  authorize(ROLES.ADMIN),
  requestValidation(taskValidation.taskIdSchema),
  taskController.deleteTask,
);

export default router;
