import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';

import swaggerOption from '@/utils/swagger';

const router = Router();

router.use('/', swaggerUi.serve);
router.get('/', swaggerUi.setup(swaggerOption));

export default router;
