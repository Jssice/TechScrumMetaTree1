import { Access } from 'payload/config';
import { WhereField } from 'payload/types';

import ERole from '../../constants/roles';
import { checkRole } from './checkRole';

export const adminOrOwner = (andWhereConfig?: { [field: string]: WhereField }): Access => {
	return ({ req: { user } }) => {
		// Need to be logged in
		if (user) {
			// If user has role of 'admin'
			if (checkRole([ERole.ADMIN], user)) return true;

			return {
				and: [
					{
						user: {
							in: user.id
						}
					},
					...(andWhereConfig ? [andWhereConfig] : [])
				]
			};
		}

		// Reject everyone else
		return false;
	};
};
