import type { AfterChangeHook } from 'payload/dist/collections/config/types';

import { SUBSCRIPTION_STATUS } from '../../../constants/options';

const afterCreateSubscription: AfterChangeHook = async ({ doc, operation }) => {
	if (operation === 'create') {
		if (doc.status === SUBSCRIPTION_STATUS.ACTIVE) {
			// Create payment and billing
		}
	}

	return doc;
};

export default afterCreateSubscription;
