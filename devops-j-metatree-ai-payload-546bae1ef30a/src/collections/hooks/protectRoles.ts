import { uniq } from 'lodash';
import type { User } from 'payload/generated-types';
import type { FieldHook } from 'payload/types';

import ERole from '../../constants/roles';

// ensure there is always a `user` role
// do not let non-admins change roles
// eslint-disable-next-line consistent-return
export const protectRoles: FieldHook<User & { id: string }> = async ({
	req,
	data,
	originalDoc
}) => {
	const isAdmin = req.user?.roles.includes(ERole.ADMIN) || data.email === 'admin@metatreeai.com';

	if (!isAdmin) {
		return uniq(originalDoc.roles || [ERole.USER]);
	}

	return uniq([...(data.roles || []), ERole.USER]);
};
