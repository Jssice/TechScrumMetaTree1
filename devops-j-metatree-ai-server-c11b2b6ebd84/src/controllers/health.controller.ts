import { Request, Response } from 'express';

/**
 * @swagger
 * /:
 *  get:
 *     tags:
 *     - HealthCheck
 *     description: Responds if the app is up and running
 *     responses:
 *       200:
 *         description: App is up and running
 */

const healthCheck = (_req: Request, res: Response) => {
	res.status(200).send('APIs is working');
};

export default healthCheck;
