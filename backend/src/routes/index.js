import express from 'express';

import authRoute from './auth.route.js';
import reportRoute from './report.route.js';
import taskRoute from './task.route.js';
import userRoute from './user.route.js';

const router = express.Router();

router.use('/auth', authRoute);
router.use('/users', userRoute);
router.use('/tasks', taskRoute);
router.use('/reports', reportRoute);

export default router;
