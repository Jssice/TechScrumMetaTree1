import type { AfterChangeHook } from 'payload/dist/collections/config/types';

import { BILLING_STATUS, PACKAGE_TYPE } from '../../../constants/options';
import getNextBillingDate from '../../../utils/getNextBillingDate';

const afterCreateBilling: AfterChangeHook = async ({ doc, req: { payload }, operation }) => {
	if (operation === 'create') {
		if (doc.status === BILLING_STATUS.PAID) {
			const user = await payload.findByID({
				collection: 'users',
				id: doc.user,
				depth: 0
			});
			const licenses = await payload.find({
				collection: 'licenses',
				where: {
					company: {
						equals: user.company
					}
				},
				sort: '-tokenUsage',
				pagination: false
			});

			const licensesToUpdate = licenses.docs.slice(0, doc.packageSnapshot.licenseCount);
			// Update existing licenses
			await payload.update({
				collection: 'licenses',
				where: {
					id: {
						in: licensesToUpdate.map(license => license.id)
					}
				},
				data: {
					expiredAt: doc.endDate,
					tokenUsage: 0
				}
			});
			// Create new licenses
			if (licenses.docs.length < doc.packageSnapshot.licenseCount) {
				const licenseCountToCreate =
					doc.packageSnapshot.licenseCount - licenses.docs.length;
				await Promise.all(
					Array.from({ length: licenseCountToCreate }).map(
						async () =>
							await payload.create({
								collection: 'licenses',
								data: {
									company: user.company,
									expiredAt: doc.endDate,
									tokenUsage: 0,
									tokenLimit: doc.packageSnapshot.tokenLimitPerLicense
								}
							})
					)
				);
			}
			// Update subscription next billing date
			if (doc.subscription && doc.packageSnapshot.type !== PACKAGE_TYPE.ADD_ON) {
				const nextBillingDate = getNextBillingDate(
					doc.subscriptionSnapshot.nextBillingDate,
					doc.packageSnapshot.type
				);

				await payload.update({
					collection: 'subscriptions',
					id: doc.subscription,
					data: {
						nextBillingDate: nextBillingDate
					}
				});
			}
		}
	}

	return doc;
};

export default afterCreateBilling;
