import express from 'express';

import { ROLES } from '../constants/roles.constant.js';
import { reportController } from '../controllers/index.js';
import authentication from '../middlewares/authentication.middleware.js';
import authorize from '../middlewares/authorization.middleware.js';

const router = express.Router();

router.get(
  '/',
  authentication,
  authorize(ROLES.ADMIN, ROLES.EMPLOYEE),
  reportController.exportTaskReport,
);

router.get(
  '/employee-wise',
  authentication,
  authorize(ROLES.ADMIN, ROLES.EMPLOYEE),
  reportController.getEmployeeTaskReport,
);

export default router;
