import { NextFunction, Request, Response } from 'express';

import { getModelByName, getModelList } from '@/services/model.service';
import AppError from '@/utils/appError';

/**
 * @swagger
 * /api/models:
 *  get:
 *    tags:
 *      - "Models"
 *    summary: Returns a list of models
 *    description: Use to request a list of models
 *    produces:
 *      - application/json
 *    responses:
 *      '200':
 *        description: OK
 */

export const getModelsHandler = async (_req: Request, res: Response, next: NextFunction) => {
	try {
		const result = await getModelList();

		res.status(200).json(result);
	} catch (err) {
		if (err instanceof Error) {
			return next(new AppError('Server error', 500, err));
		}
	}
};

/**
 * @swagger
 * /api/models/{:model}:
 *  get:
 *    tags:
 *      - "Models"
 *    summary: Returns a list of models
 *    description: Use to request a list of models
 *    produces:
 *      - application/json
 *    parameters:
 *      - name: model
 *        in: path
 *        description: Model name
 *        required: true
 *        type: string
 *    responses:
 *      '200':
 *        description: OK
 */

export const getModelHandler = async (_req: Request, res: Response, next: NextFunction) => {
	try {
		const { model } = _req.params;

		const result = await getModelByName(model);

		res.status(200).json(result);
	} catch (err) {
		if (err instanceof Error) {
			return next(new AppError('Server error', 500, err));
		}
	}
};
