import jwt from 'jsonwebtoken';

import { config } from '@/configs';

const verifyToken = (token: string) => {
	try {
		const decoded = jwt.verify(token, config.jwt_secret);

		return {
			valid: true,
			decoded
		};
	} catch (err: any) {
		return {
			valid: false,
			decoded: null,
			expired: err.message === 'jwt expired'
		};
	}
};

export default verifyToken;
