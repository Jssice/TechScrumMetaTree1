import { NextFunction, Request, Response } from 'express';

import { sendChatMessage } from '@/services/chat.service';
import AppError from '@/utils/appError';

/**
 * @swagger
 * components:
 *   schema:
 *     ChatHistory:
 *       type: array
 *       items:
 *         type: object
 *         properties:
 *           role:
 *             type: string
 *             enum: [human, ai]
 *           content:
 *             type: string
 */

/**
 * @swagger
 * /api/chat/messages':
 *  post:
 *    tags:
 *      - "Chat"
 *    summary: Use to send a message to the ai and receive a response
 *    description: Use to send a message to the ai and receive a response
 *    produces:
 *      - application/json
 *    requestBody:
 *      description: Chat object
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              config:
 *                $ref: '#/components/schema/CompletionConfig'
 *                required: false
 *              langChain:
 *                type: boolean
 *              chatSessionId:
 *                type: string
 *              message:
 *                type: string
 *              chatHistory:
 *                $ref: '#/components/schema/ChatHistory'
 *                required: false
 *              systemMessage:
 *                type: string
 *                required: false
 *              hasChatHistory:
 *                type: boolean
 *                required: true
 *    responses:
 *      '200':
 *        description: OK
 */

export const sendChatMessageHandler = async (_req: Request, res: Response, next: NextFunction) => {
	try {
		const { chatSessionId, message } = _req.body;

		const userId = res.locals.auth?.id;

		if (!userId) {
			return next(new AppError('User Not found', 404));
		}

		if (!message || !chatSessionId) {
			return next(new AppError('Data in request body is incomplete', 404));
		}

		const result = await sendChatMessage(_req, res, next);

		res.status(200).json(result);
	} catch (err) {
		if (err instanceof Error) {
			return next(new AppError('Server error', 500, err));
		}
	}
};
