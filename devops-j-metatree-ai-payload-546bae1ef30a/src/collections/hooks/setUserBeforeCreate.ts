import type { BeforeChangeHook } from 'payload/dist/collections/config/types';

import ERole from '../../constants/roles';
import { checkRole } from '../access/checkRole';

// Ref: https://payloadcms.com/docs/hooks/collections#beforechange
export const setUserBeforeCreate: BeforeChangeHook = async ({ data, req, operation }) => {
	const { user } = req;
	if (operation === 'create') {
		if (!checkRole([ERole.ADMIN], user) || !data.user) {
			data.user = user.id;
			return data;
		}
	}

	return data;
};
