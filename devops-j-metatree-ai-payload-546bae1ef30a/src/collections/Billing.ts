import { CollectionConfig } from 'payload/types';

import { BILLING_STATUS, PAYMENT_METHOD } from '../constants/options';
import { adminOrOwner } from './access/adminOrOwner';
import { admins } from './access/admins';
import afterCreateBilling from './hooks/billing/afterCreateBilling';
import beforeCreateBilling from './hooks/billing/beforeCreateBilling';

const Billing: CollectionConfig = {
	slug: 'billings',
	labels: {
		singular: {
			en: 'Billing',
			zh: '账单'
		},
		plural: {
			en: 'Billings',
			zh: '账单'
		}
	},
	access: {
		read: adminOrOwner(),
		create: admins,
		update: admins,
		delete: admins,
		admin: admins
	},
	hooks: {
		beforeChange: [beforeCreateBilling],
		afterChange: [afterCreateBilling]
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
			name: 'price',
			type: 'number',
			label: {
				en: 'Price',
				zh: '价格'
			},
			required: true
		},
		{
			name: 'paymentMethod',
			type: 'select',
			label: {
				en: 'Payment Method',
				zh: '支付方式'
			},
			options: [
				{
					label: {
						en: 'Bank',
						zh: '信用卡'
					},
					value: PAYMENT_METHOD.BANK
				}
			],
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
					label: {
						en: 'Failed',
						zh: '支付失败'
					},
					value: BILLING_STATUS.FAILED
				},
				{
					label: {
						en: 'Paid',
						zh: '已支付'
					},
					value: BILLING_STATUS.PAID
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
			required: true
		},
		{
			name: 'endDate',
			type: 'date',
			label: {
				en: 'End Date',
				zh: '结束日期'
			},
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
			name: 'packageSnapshot',
			type: 'json',
			label: {
				en: 'Package Snapshot',
				zh: '套餐快照'
			},
			admin: {
				readOnly: true,
				description: {
					en: 'Automatically generated when creating Billing, used to record the package information when creating Billing',
					zh: '创建时自动生成，用于记录创建Billing时的套餐信息'
				}
			}
		},
		{
			name: 'subscription',
			type: 'relationship',
			label: {
				en: 'Subscription',
				zh: '订阅'
			},
			relationTo: 'subscriptions'
		},
		{
			name: 'subscriptionSnapshot',
			type: 'json',
			label: {
				en: 'Subscription Snapshot',
				zh: '订阅快照'
			},
			admin: {
				readOnly: true,
				description: {
					en: 'Automatically generated when creating Billing, used to record the subscription information when creating Billing',
					zh: '创建时自动生成，用于记录创建Billing时的订阅信息'
				}
			}
		}
	]
};

export default Billing;
