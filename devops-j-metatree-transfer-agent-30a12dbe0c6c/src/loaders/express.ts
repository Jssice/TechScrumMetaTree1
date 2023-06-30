import cors from 'cors';
import express, { Application } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import morgan from 'morgan';

import { config } from '@/configs';
import errorHandler from '@/middlewares/errorHandler';
import indexRouter from '@/routes';

// Boot express
const app: Application = express();
const env = config.app_env;

app.use(helmet());

const morganLog = env === 'development' ? morgan('dev') : morgan('common');

app.use(morganLog);

app.use(express.json());

app.use(
	cors({
		exposedHeaders: 'Authorization',
		credentials: true
	})
);

const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // Limit each IP to 100 requests per `window` per 15 minutes
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false
});

// Apply the rate limiting middleware to all requests
app.use(limiter);

// Application routing
app.use('/', indexRouter);

app.use(errorHandler);

export default app;
