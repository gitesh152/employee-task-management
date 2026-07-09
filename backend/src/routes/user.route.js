import express from 'express';

import { ROLES } from '../constants/roles.constant.js';
import { userController } from '../controllers/index.js';
import authentication from '../middlewares/authentication.middleware.js';
import authorize from '../middlewares/authorization.middleware.js';
import requestValidation from '../middlewares/request.validation.middleware.js';
import { authValidation, userValidation } from '../validations/index.js';

const router = express.Router();

router.post(
  '/',
  authentication,
  authorize(ROLES.ADMIN),
  requestValidation(authValidation.registerSchema),
  userController.createUser,
);
router.get(
  '/',
  authentication,
  authorize(ROLES.ADMIN),
  requestValidation(userValidation.listUsersQuerySchema),
  userController.listUsers,
);
router.get('/me', authentication, userController.profile);
router.get(
  '/:id',
  authentication,
  authorize(ROLES.ADMIN),
  requestValidation(userValidation.getUserSchema),
  userController.getUser,
);
router.put(
  '/:id',
  authentication,
  authorize(ROLES.ADMIN),
  requestValidation(userValidation.updateUserSchema),
  userController.updateUser,
);
router.delete(
  '/:id',
  authentication,
  authorize(ROLES.ADMIN),
  requestValidation(userValidation.deleteUserSchema),
  userController.deleteUser,
);

export default router;
