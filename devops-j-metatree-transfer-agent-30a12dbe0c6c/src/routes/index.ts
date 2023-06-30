import { Router } from 'express';

import apiRouter from './api';
import healthRouter from './health/health.route';
import swaggerRouter from './swagger/swagger.route';

const router = Router();

router.use('/health', healthRouter);
router.use('/api-docs', swaggerRouter);
router.use('/api/v1', apiRouter);

export default router;
