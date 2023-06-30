import { DEV } from '../constants/env';

const getEnv = () => {
	return process.env.PAYLOAD_ENV || process.env.NODE_ENV || DEV;
};

export default getEnv;
