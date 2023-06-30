import { isEmpty } from 'lodash';
import payload from 'payload';
import { CollectionConfig } from 'payload/types';

import { BOOLEAN_VALUE } from '../constants/common';
import ERole from '../constants/roles';
import { adminsAndUser } from './access/adminOrSelf';
import { admins } from './access/admins';
import { isLoggedIn } from './access/isLoggedIn';
import { protectRoles } from './hooks/protectRoles';

const Users: CollectionConfig = {
	slug: 'users',
	labels: {
		singular: {
			en: 'User',
			zh: '用户'
		},
		plural: {
			en: 'Users',
			zh: '用户'
		}
	},
	auth: {
		tokenExpiration: 60 * 60 * 8
	},
	admin: {
		useAsTitle: 'email',
		defaultColumns: ['email', 'firstName', 'lastName', 'roles', 'company']
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
			name: 'firstName',
			type: 'text',
			label: {
				en: 'First Name',
				zh: '名字'
			},
			required: true,
			saveToJWT: false
		},
		{
			name: 'lastName',
			type: 'text',
			label: {
				en: 'Last Name',
				zh: '姓氏'
			},
			required: true,
			saveToJWT: false
		},
		{
			name: 'roles',
			type: 'select',
			label: {
				en: 'Roles',
				zh: '角色'
			},
			hasMany: true,
			hooks: {
				beforeChange: [protectRoles]
			},
			options: [
				{
					label: {
						en: 'Admin',
						zh: '管理员'
					},
					value: ERole.ADMIN
				},
				{
					label: {
						en: 'User',
						zh: '用户'
					},
					value: ERole.USER
				},
				{
					label: {
						en: 'Company Admin',
						zh: '企业管理员'
					},
					value: ERole.COMPANY_ADMIN
				}
			]
		},
		{
			name: 'company',
			type: 'relationship',
			label: {
				en: 'Company',
				zh: '企业'
			},
			relationTo: 'companies',
			required: true,
			saveToJWT: false
		},
		{
			name: 'position',
			type: 'text',
			label: {
				en: 'Position',
				zh: '职位'
			},
			saveToJWT: false
		},
		{
			name: 'department',
			type: 'text',
			label: {
				en: 'Department',
				zh: '部门'
			},
			saveToJWT: false
		}
	],
	endpoints: [
		{
			// check if the user has existed
			path: '/existence',
			method: 'get',
			handler: async (req, res) => {
				const { email, phone } = req.query;
				if (!email || !phone) {
					res.status(400).json({
						error: 'Email or phone is required in query'
					});
					return;
				}

				switch (true) {
					case !!email:
						const emailUser = await payload.find({
							collection: 'users',
							where: {
								email: {
									equals: email
								}
							}
						});
						res.status(200).json({
							exists: !isEmpty(emailUser.docs)
						});
						return;
					default:
						res.status(400).json({
							error: 'Query is not invalid'
						});
						return;
				}
			}
		},
		{
			path: '/resetPassword',
			method: 'post',
			handler: async (req, res) => {
				try {
					const { user } = req;
					if (!user) {
						res.status(401).json({
							error: 'Unauthorized'
						});
						return;
					}
					const { password, newPassword } = req.body;

					await payload.login({
						collection: 'users',
						data: {
							email: user.email,
							password
						}
					});

					await payload.update({
						collection: 'users',
						id: user.id,
						data: {
							password: newPassword
						}
					});

					res.status(200).send();
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
			path: '/myCompanies',
			method: 'get',
			handler: async (req, res) => {
				try {
					const { user } = req;
					const { page = 1, sort, assignable, searchValue } = req.query;

					if (!user?.roles.includes(ERole.COMPANY_ADMIN) || !user?.company.id) {
						res.status(401).json({
							error: 'Unauthorized'
						});
						return;
					}
					// Get users without active licenses
					if (assignable === BOOLEAN_VALUE.TRUE) {
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
							pagination: false,
							depth: 0
						});
						const licenseAssignees = licenses.docs.map(license => license.assignee);
						const users = await payload.find({
							collection: 'users',
							where: {
								company: {
									equals: user.company.id
								},
								id: {
									not_in: licenseAssignees
								},
								...(searchValue
									? {
											or: [
												{
													firstName: {
														like: searchValue
													},
													lastName: {
														like: searchValue
													}
												}
											]
									  }
									: {})
							},
							sort: (sort as string) || '-createdAt',
							page: +page
						});
						res.status(200).json(users);
					} else {
						// Get users belongs to my company
						const users = await payload.find({
							collection: 'users',
							where: {
								company: {
									equals: user.company.id
								},
								...(searchValue
									? {
											or: [
												{
													firstName: {
														like: searchValue
													},
													lastName: {
														like: searchValue
													}
												}
											]
									  }
									: {})
							},
							sort: (sort as string) || '-createdAt',
							page: +page
						});
						res.status(200).json(users);
					}
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
			path: '/bulk',
			method: 'post',
			handler: async (req, res) => {
				try {
					const data = req.body;
					const { user } = req;
					if (!user?.roles.includes(ERole.COMPANY_ADMIN) || !user?.company.id) {
						res.status(401).json({
							error: 'Unauthorized'
						});
						return;
					}
					const users = await Promise.all(
						data.map(
							async userData =>
								await payload.create({
									collection: 'users',
									data: {
										...userData,
										company: user.company.id,
										password: 'metatree'
									}
								})
						)
					);
					// Assign licenses to users
					const availableLicenses = await payload.find({
						collection: 'licenses',
						where: {
							company: {
								equals: user.company.id
							},
							expiredAt: {
								greater_than: new Date()
							},
							assignee: {
								equals: null
							}
						},
						sort: 'tokenUsage',
						pagination: false
					});
					if (!isEmpty(availableLicenses.docs)) {
						await Promise.all(
							availableLicenses.docs.map(async (license, index) => {
								if (index > users.length - 1) {
									return;
								}
								await payload.update({
									collection: 'licenses',
									id: license.id,
									data: {
										assignee: users[index].id
									}
								});
							})
						);
					}
					res.status(200).json(users);
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

export default Users;
