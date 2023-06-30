import dayjs from 'dayjs';
import payload from 'payload';
import { CollectionConfig, FieldHook } from 'payload/types';

import ERole from '../constants/roles';
import { adminOrOwner } from './access/adminOrOwner';
import { admins } from './access/admins';

const checkLicenseStatus: FieldHook = async ({ data }) => {
	return dayjs(data.expiredAt).isAfter(dayjs()) && data.tokenUsage < data.tokenLimit;
};

const License: CollectionConfig = {
	slug: 'licenses',
	labels: {
		singular: {
			en: 'License',
			zh: '许可证'
		},
		plural: {
			en: 'Licenses',
			zh: '许可证'
		}
	},
	access: {
		read: adminOrOwner(),
		create: admins,
		update: admins,
		delete: admins,
		admin: admins
	},
	fields: [
		{
			name: 'company',
			type: 'relationship',
			label: {
				en: 'Company',
				zh: '企业'
			},
			required: true,
			maxDepth: 0,
			relationTo: 'companies'
		},
		{
			name: 'assignee',
			type: 'relationship',
			label: {
				en: 'Assignee',
				zh: 'License持有者'
			},
			maxDepth: 1,
			relationTo: 'users'
		},
		{
			name: 'expiredAt',
			type: 'date',
			label: {
				en: 'Expired At',
				zh: '到期时间'
			},
			required: true,
			access: {
				create: admins,
				update: admins
			}
		},
		{
			name: 'tokenUsage',
			type: 'number',
			label: {
				en: 'Token Usage',
				zh: '令牌使用量'
			},
			defaultValue: 0
		},
		{
			name: 'tokenLimit',
			type: 'number',
			label: {
				en: 'Token Limit',
				zh: '令牌限制'
			},
			defaultValue: 1000000,
			admin: {
				readOnly: true
			},
			access: {
				create: admins,
				update: admins
			}
		},
		{
			name: 'isValid',
			label: false,
			type: 'checkbox',
			hooks: {
				beforeChange: [
					({ siblingData }) => {
						// Mutate the sibling data to prevent DB storage
						// eslint-disable-next-line no-param-reassign
						siblingData.isValid = undefined;
					}
				],
				afterRead: [checkLicenseStatus]
			},
			access: {
				create: () => false,
				update: () => false
			},
			admin: {
				hidden: true
			}
		}
	],
	endpoints: [
		{
			path: '/myCompanies',
			method: 'get',
			handler: async (req, res) => {
				try {
					const { user } = req;
					const { page, sort = 'tokenUsage' } = req.query;

					if (!user?.roles.includes(ERole.COMPANY_ADMIN) || !user?.company.id) {
						res.status(401).json({
							error: 'Unauthorized'
						});
						return;
					}

					const licenses = await payload.find({
						collection: 'licenses',
						where: {
							company: {
								equals: user.company.id
							},
							expiredAt: {
								greater_than: new Date()
							}
						},
						sort: sort as string,
						page: page ? +page : 1
					});
					res.status(200).json(licenses);
				} catch (error) {
					if (error instanceof Error) {
						res.status(500).json({
							error: error.message
						});
					}
				}
			}
		},
		{
			path: '/myCompanies/assignedCount',
			method: 'get',
			handler: async (req, res) => {
				try {
					const { user } = req;

					if (!user?.roles.includes(ERole.COMPANY_ADMIN) || !user?.company.id) {
						res.status(401).json({
							error: 'Unauthorized'
						});
						return;
					}

					const assignedLicenses = await payload.find({
						collection: 'licenses',
						where: {
							company: {
								equals: user.company.id
							},
							expiredAt: {
								greater_than: new Date()
							},
							assignee: {
								not_equals: null
							}
						},
						pagination: false
					});

					res.status(200).json(assignedLicenses.docs.length);
				} catch (error) {
					if (error instanceof Error) {
						res.status(500).json({
							error: error.message
						});
					}
				}
			}
		},
		{
			path: '/:id/assign',
			method: 'patch',
			handler: async (req, res) => {
				try {
					const { user } = req;
					const { id } = req.params;
					const { assignee } = req.body;

					if (!user?.roles.includes(ERole.COMPANY_ADMIN) || !user?.company) {
						res.status(401).json({
							error: 'Unauthorized'
						});
						return;
					}

					const licenses = await payload.find({
						collection: 'licenses',
						where: {
							id: {
								equals: id
							},
							company: {
								equals: user.company.id
							}
						}
					});

					if (!licenses.docs[0]) {
						return res.status(404).json({
							error: 'License not found'
						});
					}

					const license = await payload.update({
						collection: 'licenses',
						id,
						data: {
							assignee
						}
					});

					res.status(200).json(license);
				} catch (error) {
					if (error instanceof Error) {
						res.status(500).json({
							error: error.message
						});
					}
				}
			}
		},
		{
			path: '/:id/unassign',
			method: 'patch',
			handler: async (req, res) => {
				try {
					const { user } = req;
					const { id } = req.params;

					if (!user?.roles.includes(ERole.COMPANY_ADMIN) || !user?.company) {
						res.status(401).json({
							error: 'Unauthorized'
						});
						return;
					}

					const licenses = await payload.find({
						collection: 'licenses',
						where: {
							id: {
								equals: id
							},
							company: {
								equals: user.company.id
							}
						}
					});

					if (!licenses.docs[0]) {
						return res.status(404).json({
							error: 'License not found'
						});
					}

					const license = await payload.update({
						collection: 'licenses',
						id,
						data: {
							assignee: null
						}
					});

					res.status(200).json(license);
				} catch (error) {
					if (error instanceof Error) {
						res.status(500).json({
							error: error.message
						});
					}
				}
			}
		},
		{
			path: '/mine',
			method: 'get',
			handler: async (req, res) => {
				try {
					const { user } = req;
					if (!user) {
						res.status(401).json({
							error: 'Unauthorized'
						});
						return;
					}

					const licenses = await payload.find({
						collection: 'licenses',
						where: {
							assignee: {
								equals: user.id
							},
							company: {
								equals: user.company.id
							}
						},
						depth: 0
					});

					if (!licenses.docs[0]) {
						return res.status(404).json({
							error: 'License not found'
						});
					}
					res.status(200).json(licenses.docs[0]);
				} catch (error) {
					if (error instanceof Error) {
						res.status(500).json({
							error: error.message
						});
					}
				}
			}
		}
	]
};

export default License;
