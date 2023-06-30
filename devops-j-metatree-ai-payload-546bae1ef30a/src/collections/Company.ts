import { CollectionConfig } from 'payload/types';

import { adminsAndUser } from './access/adminOrSelf';
import { admins } from './access/admins';
import { isLoggedIn } from './access/isLoggedIn';

const Company: CollectionConfig = {
	slug: 'companies',
	labels: {
		singular: {
			en: 'Company',
			zh: '企业'
		},
		plural: {
			en: 'Companies',
			zh: '企业'
		}
	},
	admin: {
		useAsTitle: 'name'
	},
	access: {
		read: adminsAndUser,
		create: isLoggedIn,
		update: adminsAndUser,
		delete: admins,
		admin: admins
	},
	fields: [
		{
			name: 'name',
			type: 'text',
			label: {
				en: 'Name',
				zh: '名字'
			},
			required: true
		},
		{
			name: 'address',
			type: 'text',
			label: {
				en: 'Address',
				zh: '地址'
			}
		}
	]
};

export default Company;
