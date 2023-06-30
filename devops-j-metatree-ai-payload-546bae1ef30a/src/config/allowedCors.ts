import getEnv from '../utils/getEnv';

const env = getEnv();

const allowedCors: { [env: string]: string[] } = {
	development: ['http://localhost:8000'],
	uat: ['https://uat.metatree.tech'],
	production: ['https://uat.metatree.tech']
};

export default allowedCors[env];
