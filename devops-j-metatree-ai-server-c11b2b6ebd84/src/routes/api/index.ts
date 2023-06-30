import { Router } from 'express';

import { sendChatMessageHandler } from '@/controllers/chat.controller';
import { createChatCompletionHandler } from '@/controllers/completion.controller';
import { getModelHandler, getModelsHandler } from '@/controllers/models.controller';
import authGuard from '@/middlewares/authGuard';
import asyncWrapper from '@/utils/asyncWrapper';

const router = Router();

// Completion
router.post(
	'/chat/completions',
	asyncWrapper(authGuard),
	asyncWrapper(createChatCompletionHandler)
);

// Models
router.get('/models', asyncWrapper(authGuard), asyncWrapper(getModelsHandler));
router.get('/models/:model', asyncWrapper(authGuard), asyncWrapper(getModelHandler));

// Langchain Chat
router.post('/chat/messages', asyncWrapper(authGuard), asyncWrapper(sendChatMessageHandler));

export default router;
