import dayjs from 'dayjs';
import type { Payload } from 'payload';

import { PROD } from '../constants/env';
import ERole from '../constants/roles';

export const seed = async (payload: Payload): Promise<void> => {
	// Create a company if the collection is empty
	const companies = await payload.find({
		collection: 'companies',
		where: {
			name: {
				equals: 'Metatree AI'
			}
		},
		limit: 1,
		depth: 0,
		pagination: false
	});

	if (companies.docs.length === 0) {
		await payload.create({
			collection: 'companies',
			data: {
				name: 'Metatree AI'
			}
		});
	}

	// create admin account if the collection is empty
	const adminAccount = await payload.find({
		collection: 'users',
		where: {
			roles: {
				in: [ERole.ADMIN]
			}
		},
		depth: 0,
		pagination: false
	});

	const adminUserEmail = 'admin@metatreeai.com';
	if (adminAccount.docs.length === 0) {
		const companies = await payload.find({
			collection: 'companies',
			where: {
				name: {
					equals: 'Metatree AI'
				}
			},
			limit: 1,
			depth: 0,
			pagination: false
		});
		await payload.create({
			collection: 'users',
			data: {
				email: adminUserEmail,
				password: 'admin',
				firstName: 'admin',
				lastName: 'admin',
				roles: [ERole.ADMIN, ERole.USER, ERole.COMPANY_ADMIN],
				company: companies.docs[0].id
			}
		});
	}

	if (process.env.NODE_ENV !== PROD) {
		// create a package if the collection is empty
		const packages = await payload.find({
			collection: 'packages',
			where: {
				name: {
					equals: 'Metatree AI Add-on'
				}
			},
			depth: 0,
			pagination: false
		});

		let addonPackage = packages.docs[0];

		if (!addonPackage) {
			addonPackage = await payload.create({
				collection: 'packages',
				data: {
					name: 'Metatree AI Add-on',
					description: 'Metatree AI Add-on',
					price: 100,
					type: 'add-on',
					licenseCount: 10,
					tokenLimitPerLicense: 100000
				}
			});
		}

		const billings = await payload.find({
			collection: 'billings',
			where: {
				package: {
					equals: addonPackage.id
				}
			},
			depth: 0,
			pagination: false
		});

		if (billings.docs.length === 0) {
			const users = await payload.find({
				collection: 'users',
				where: {
					email: {
						equals: adminUserEmail
					}
				},
				depth: 0,
				pagination: false
			});

			if (users.docs[0]) {
				const endDate = dayjs().add(1, 'M').startOf('D').toISOString();
				await payload.create({
					collection: 'billings',
					data: {
						user: users.docs[0].id,
						price: 100,
						paymentMethod: 'bank',
						status: 'paid',
						startDate: dayjs().startOf('D').toISOString(),
						endDate,
						package: addonPackage.id
					}
				});
				const licenses = await payload.find({
					collection: 'licenses',
					where: {
						company: {
							equals: users.docs[0].company
						},
						expiredAt: {
							equals: endDate
						}
					},
					limit: 1,
					depth: 0,
					pagination: false
				});

				if (licenses.docs.length !== 0) {
					await payload.update({
						collection: 'licenses',
						id: licenses.docs[0].id,
						data: {
							assignee: users.docs[0].id
						}
					});
				}
			}
		}
	}

	// Add more seed data here
};

export default seed;
