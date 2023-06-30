import * as dotenv from 'dotenv';
import * as joi from 'joi';

import { DEV, PROD, TEST, UAT } from '@/constants/env';
require('dotenv').config();
dotenv.config();

const envVarsSchema = joi
	.object()
	.keys({
		NODE_ENV: joi.string().valid(PROD, DEV, UAT, TEST).required(),
		PORT: joi.number().positive().required(),
		JWT_SECRET: joi.string()
	})
	.unknown();

const { value: envVars, error } = envVarsSchema
	.prefs({ errors: { label: 'key' } })
	.validate(process.env);

if (error) {
	throw new Error(`Config validation error: ${error.message}`);
}

const config = {
	port: Number(envVars.PORT) || 3003,
	app_env: String(envVars.NODE_ENV) || DEV,
	jwt_secret: String(envVars.JWT_SECRET) || 'METATREESECRET'
};

export default config;
