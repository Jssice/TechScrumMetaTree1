import { NextFunction, Request, Response } from 'express';

import AppError from '@/utils/appError';
import verifyToken from '@/utils/verifyToken';

/**
 * @description Middleware to verify JWT in request header
 */

const authGuard = async (req: Request, res: Response, next: NextFunction) => {
	const accessToken = (req?.headers?.authorization || '').replace(/^Bearer\s/, '');

	if (!accessToken) {
		return next(new AppError('Please provide authorization token', 401));
	}

	const { valid, decoded } = verifyToken(accessToken);

	if (!valid) {
		return next(new AppError('Invalid authorization token', 401));
	}

	res.locals.auth = decoded;
	return next();
};

export default authGuard;
