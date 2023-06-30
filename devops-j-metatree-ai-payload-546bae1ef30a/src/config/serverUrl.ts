import getEnv from '../utils/getEnv';

const env = getEnv();

const serverURL: { [env: string]: string } = {
	development: 'http://localhost:3000',
	uat: 'https://uat.payload.metatree.tech',
	production: 'https://uat.payload.metatree.tech'
};

export default serverURL[env];
