import { NextFunction, Request, Response } from 'express';

type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<any>;

const asyncWrapper = (fn: AsyncHandler) => (req: Request, res: Response, next: NextFunction) => {
	fn(req, res, next).catch(next);
};

export default asyncWrapper;
