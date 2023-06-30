import { CollectionConfig } from 'payload/types';

import { PACKAGE_TYPE } from '../constants/options';
import { admins } from './access/admins';
import { anyone } from './access/anyone';

const Package: CollectionConfig = {
	slug: 'packages',
	labels: {
		singular: {
			en: 'Package',
			zh: '套餐'
		},
		plural: {
			en: 'Packages',
			zh: '套餐'
		}
	},
	admin: {
		useAsTitle: 'name'
	},
	access: {
		read: anyone,
		create: admins,
		update: admins,
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
			name: 'description',
			type: 'text',
			label: {
				en: 'Description',
				zh: '描述'
			}
		},
		{
			name: 'price',
			type: 'number',
			label: {
				en: 'Price',
				zh: '价格'
			}
		},
		{
			name: 'type',
			type: 'select',
			label: '类型',
			options: [
				{
					label: {
						en: 'Add-on',
						zh: '附加'
					},
					value: PACKAGE_TYPE.ADD_ON
				},
				{
					label: {
						en: 'Monthly',
						zh: '独立'
					},
					value: PACKAGE_TYPE.MONTHLY
				},
				{
					label: {
						en: 'Quarterly',
						zh: '季付'
					},
					value: PACKAGE_TYPE.QUARTERLY
				},
				{
					label: {
						en: 'Yearly',
						zh: '年付'
					},
					value: PACKAGE_TYPE.YEARLY
				}
			]
		},
		{
			name: 'licenseCount',
			type: 'number',
			label: {
				en: 'License Count',
				zh: '许可证数量'
			},
			required: true
		},
		{
			name: 'tokenLimitPerLicense',
			type: 'number',
			label: {
				en: 'Token Limit Per License',
				zh: '每个许可证的令牌限制'
			},
			required: true
		}
	]
};

export default Package;
