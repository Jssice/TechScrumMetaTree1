/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from 'express';

import { DEV, PROD } from '@/constants/env';
import AppError from '@/utils/appError';
import { logger } from '@/utils/logger';

const handleJWTError = () => new AppError('Invalid token', 401);

const handleJWTExpires = () => new AppError('Your token is expired.', 401);

const handleCastErrorDB = (err: any) => {
	const message = `Invalid ${err.path}: ${err.value}`;
	return new AppError(message, 400);
};

// send error during development
const sendErrorDev = (err: any, res: Response) => {
	res.status(err.statusCode).json({
		status: err.status,
		message: err.message,
		stack: err.stack
	});
};

// send error during production
const sendErrorProd = (err: any, res: Response) => {
	// Operational, trusted error: send message to client
	if (err.isOperational) {
		res.status(err.statusCode).json({
			status: err.status,
			message: err.message
		});
	} else {
		// Programing or other unknown error: don't leak error details

		//1) log the error
		// console.error('Error: ', err);
		logger.error('Error: ', err);

		//2) send the message to client
		res.status(500).json({
			status: 'error',
			message: 'Something went very wrong!'
		});
	}
};

/**
 * Middleware function to handle errors in the Express app.
 *
 * @param {ErrorTypes} err - The error that occurred.
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The Express next function.
 */
const errorHandler = (
	err: any,
	req: Request,
	res: Response,
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	next: NextFunction
) => {
	err.statusCode = err.statusCode || 500;
	err.status = err.status || 'error';

	if (process.env.NODE_ENV === DEV) {
		sendErrorDev(err, res);
	} else if (process.env.NODE_ENV === PROD) {
		let error = { ...err };
		error.message = err.message;

		if (error.name === 'JsonWebTokenError') error = handleJWTError();
		if (error.name === 'TokenExpiredError') error = handleJWTExpires();
		if (error.name === 'CastError') error = handleCastErrorDB(err);

		sendErrorProd(error, res);
	}
};

export default errorHandler;
