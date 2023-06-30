import { Access } from 'payload/config';

import ERole from '../../constants/roles';
import { checkRole } from './checkRole';

export const adminsAndUser: Access = ({ req: { user } }) => {
	// Need to be logged in
	if (user) {
		// If user has role of 'admin'
		if (checkRole([ERole.ADMIN], user)) {
			return true;
		}

		// If any other type of user, only provide access to themselves
		return {
			id: {
				equals: user.id
			}
		};
	}

	// Reject everyone else
	return false;
};
