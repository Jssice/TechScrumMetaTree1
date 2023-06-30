import type { BeforeChangeHook } from 'payload/dist/collections/config/types';

const beforeCreateBilling: BeforeChangeHook = async ({ data, req: { payload }, operation }) => {
	if (operation === 'create') {
		// update the package snapshot
		const billingPackage = await payload.findByID({
			collection: 'packages',
			id: data.package,
			depth: 0
		});
		data.packageSnapshot = billingPackage;
		// update the subscription snapshot
		if (data.subscription) {
			const subscription = await payload.findByID({
				collection: 'subscriptions',
				id: data.subscription,
				depth: 0
			});
			data.subscriptionSnapshot = subscription;
		}
	}

	return data;
};

export default beforeCreateBilling;
