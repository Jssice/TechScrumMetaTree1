import { Router } from 'express';

import { metatreeTransferHandler } from '@/controllers/metatreeai.controller';
import authGuard from '@/middlewares/authGuard';
import asyncWrapper from '@/utils/asyncWrapper';

const router = Router();

// Metatree AI
router.all('/metatreeai/*', asyncWrapper(authGuard), asyncWrapper(metatreeTransferHandler));

export default router;
