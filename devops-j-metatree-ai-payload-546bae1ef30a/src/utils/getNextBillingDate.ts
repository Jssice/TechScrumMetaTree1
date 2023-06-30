import dayjs from 'dayjs';

import { PACKAGE_TYPE } from '../constants/options';

const getNextBillingDate = (date: string, packageType: string) => {
	let nextBillingDate = dayjs(date);
	switch (packageType) {
		case PACKAGE_TYPE.MONTHLY:
			nextBillingDate = nextBillingDate.add(1, 'month');
			break;
		case PACKAGE_TYPE.QUARTERLY:
			nextBillingDate = nextBillingDate.add(3, 'month');
		case PACKAGE_TYPE.YEARLY:
			nextBillingDate = nextBillingDate.add(1, 'year');
			break;
		default:
			break;
	}
	return nextBillingDate.toISOString();
};

export default getNextBillingDate;
