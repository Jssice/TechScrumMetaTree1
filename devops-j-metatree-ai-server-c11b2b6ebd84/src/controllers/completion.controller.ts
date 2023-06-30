import { AxiosResponse } from 'axios';
import { NextFunction, Request, Response } from 'express';

import EMapLangChainRoleToOpenAI, { DEFAULT_CHAT_SYSTEM_MESSAGE } from '@/constants/chat';
import AppError from '@/utils/appError';

import { openai } from '../loaders';

/**
 * @swagger
 * components:
 *   schema:
 *     ChatCompletionConfig:
 *       type: object
 *       required:
 *        - user
 *       properties:
 *         model:
 *           type: string
 *         temperature:
 *           type: string
 *         max_tokens:
 *           type: string
 */

/**
 * @swagger
 * /api/chat/completions':
 *  post:
 *    tags:
 *      - "ChatCompletions"
 *    summary: Use to request a completion of the given prompt and configuration
 *    description: Use to request a completion of the given prompt and configuration
 *    produces:
 *      - application/json
 *    requestBody:
 *      description: Completion object
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              config:
 *                $ref: '#/components/schema/ChatCompletionConfig'
 *              message:
 *                type: string
 *              chatHistory:
 *                $ref: '#/components/schema/ChatHistory'
 *                required: false
 *              systemMessage:
 *                type: string
 *                required: false
 *    responses:
 *      '200':
 *        description: OK
 */

export const createChatCompletionHandler = async (
	_req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const {
			config = {},
			message,
			chatHistory,
			systemMessage = DEFAULT_CHAT_SYSTEM_MESSAGE
		} = _req.body;
		const userId = res.locals.auth?.id;

		if (!userId) {
			return next(new AppError('User Not found', 404));
		}

		if (!message) {
			return next(new AppError('Data in request body is incomplete', 404));
		}

		const response: AxiosResponse<any, any> = await openai.createChatCompletion(
			{
				model: 'gpt-3.5-turbo',
				temperature: 0.9,
				user: userId,
				stream: true,
				...config,
				messages: [
					{
						role: 'system',
						content: systemMessage
					},
					...(chatHistory as IChatHistoryMessage[]).map(message => ({
						role: EMapLangChainRoleToOpenAI[message.role],
						content: message.content
					})),
					{
						role: 'user',
						content: message
					}
				]
			},
			{
				responseType: 'stream'
			}
		);

		response.data.pipe(res);

		response.data.on('end', () => {
			res.end();
		});
	} catch (err) {
		if (err instanceof Error) {
			return next(new AppError('Server error', 500, err));
		}
	}
};
