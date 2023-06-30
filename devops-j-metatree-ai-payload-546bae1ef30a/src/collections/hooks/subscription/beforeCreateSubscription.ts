import { isEmpty } from 'lodash';
import type { BeforeChangeHook } from 'payload/dist/collections/config/types';

import { SUBSCRIPTION_STATUS } from '../../../constants/options';
import getNextBillingDate from '../../../utils/getNextBillingDate';

const beforeCreateSubscription: BeforeChangeHook = async ({
	data,
	req: { payload, body = {} },
	operation
}) => {
	if (operation === 'create') {
		if (body.status === SUBSCRIPTION_STATUS.ACTIVE && isEmpty(body.nextBillingDate)) {
			const subscriptionPackage = await payload.findByID({
				collection: 'packages',
				id: body.package
			});
			const nextBillingDate = getNextBillingDate(body.startDate, subscriptionPackage.type);

			data.nextBillingDate = nextBillingDate;
		}
	}
	return data;
};

export default beforeCreateSubscription;
