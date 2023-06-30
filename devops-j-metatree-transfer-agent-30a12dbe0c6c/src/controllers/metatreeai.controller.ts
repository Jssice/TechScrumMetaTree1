import axios from 'axios';
import { NextFunction, Request, Response } from 'express';

import BOOLEAN_VALUES from '@/constants/common';
import { DEV } from '@/constants/env';
import { metatreeAIUrl } from '@/constants/url';
import AppError from '@/utils/appError';

/**
 * @swagger
 * /api/metatreeai':
 *  all:
 *    tags:
 *      - "Metatree AI"
 *    summary: Transfer request to Metatree AI
 *    description: Transfer request to Metatree AI
 *    produces:
 *      - application/json
 *    responses:
 *      '200':
 *        description: OK
 */

export const metatreeTransferHandler = async (_req: Request, res: Response, next: NextFunction) => {
	const url = process.env.NODE_ENV
		? `${metatreeAIUrl[process.env.NODE_ENV || DEV]}${_req.originalUrl.replace(
				'/metatreeai',
				''
		  )}`
		: '';
	const method = _req.method.toLowerCase();
	const authorization = _req.headers.authorization;
	const data = _req.body;
	const stream = _req.query.stream;

	try {
		const response = await axios({
			method,
			url,
			headers: {
				authorization
			},
			...(stream ? { responseType: 'stream' } : {}),
			data
		});
		if (stream === BOOLEAN_VALUES.TRUE) {
			response.data.pipe(res);
			response.data.on('end', () => {
				res.end();
			});
		} else {
			res.status(response.status).send(response.data);
		}
	} catch (err) {
		if ((err as any)?.response?.status && (err as any)?.response?.data) {
			return res.status((err as any).response.status).send((err as any).response.data);
		} else if (err instanceof Error) {
			return next(new AppError('Server error', 500, err));
		}
	}
};
