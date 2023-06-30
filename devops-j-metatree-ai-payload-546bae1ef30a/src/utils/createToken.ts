import jwt from 'jsonwebtoken';

type TTokenInfo = {
	id: string;
};

/**
 * @description return a token encoded by JWT with a random id for testing
 * @param {TTokenInfo} payload data to be encoded
 * @param {string} [expiresIn] expressed in seconds or a string describing a time span zeit/ms
 */

const createToken = (
	payload: TTokenInfo,
	expiresIn = process.env.METATREE_AI_TOKEN_EXPIRES_IN || '180s'
) => {
	return jwt.sign(payload, process.env.PAYLOAD_SECRET, { expiresIn });
};

export default createToken;
