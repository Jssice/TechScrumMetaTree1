import dayjs from 'dayjs';
import { CollectionConfig } from 'payload/types';

import { SUBSCRIPTION_STATUS } from '../constants/options';
import { admins } from './access/admins';
import { anyone } from './access/anyone';
import afterCreateSubscription from './hooks/subscription/afterCreateSubscription';
import beforeCreateSubscription from './hooks/subscription/beforeCreateSubscription';

const Subscription: CollectionConfig = {
	slug: 'subscriptions',
	labels: {
		singular: {
			en: 'Subscription',
			zh: '订阅'
		},
		plural: {
			en: 'Subscriptions',
			zh: '订阅'
		}
	},
	access: {
		read: anyone,
		create: admins,
		update: admins,
		delete: admins,
		admin: admins
	},
	hooks: {
		beforeChange: [beforeCreateSubscription],
		afterChange: [afterCreateSubscription]
	},
	fields: [
		{
			name: 'user',
			type: 'relationship',
			label: {
				en: 'User',
				zh: '用户'
			},
			relationTo: 'users',
			required: true
		},
		{
			name: 'package',
			type: 'relationship',
			label: {
				en: 'Package',
				zh: '套餐'
			},
			relationTo: 'packages',
			required: true
		},
		{
			name: 'status',
			type: 'select',
			label: {
				en: 'Status',
				zh: '状态'
			},
			options: [
				{
					value: SUBSCRIPTION_STATUS.ACTIVE,
					label: {
						en: 'Active',
						zh: '激活'
					}
				},
				{
					value: SUBSCRIPTION_STATUS.SUSPENDED,
					label: {
						en: 'Suspended',
						zh: '暂停'
					}
				},
				{
					value: SUBSCRIPTION_STATUS.CANCELED,
					label: {
						en: 'Canceled',
						zh: '取消'
					}
				}
			],
			required: true
		},
		{
			name: 'startDate',
			type: 'date',
			label: {
				en: 'Start Date',
				zh: '开始日期'
			},
			required: true,
			defaultValue: dayjs().startOf('day').toISOString()
		},
		{
			name: 'nextBillingDate',
			type: 'date',
			label: {
				en: 'Next Billing Date',
				zh: '下次账单日期'
			},
			admin: {
				description: '创建时保留空白，创建后会根据开始日期和套餐类型自动计算'
			}
		}
	]
};

export default Subscription;
