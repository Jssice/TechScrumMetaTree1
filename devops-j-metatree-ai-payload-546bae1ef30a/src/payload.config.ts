import path from 'path';
import { buildConfig } from 'payload/config';

import Billing from './collections/Billing';
import Company from './collections/Company';
import Conversation from './collections/Conversation';
import License from './collections/License';
import Package from './collections/Package';
import Subscription from './collections/Subscription';
import Users from './collections/Users';
import allowedCors from './config/allowedCors';
import serverUrl from './config/serverUrl';

const createTokenPath = path.resolve(__dirname, 'utils/createToken');
const mockModulePath = path.resolve(__dirname, 'mocks/emptyObjects');

export default buildConfig({
	serverURL: serverUrl,
	admin: {
		user: Users.slug,
		webpack: config => ({
			...config,
			resolve: {
				...config.resolve,
				// the use of server-only packages need to be aliased, to prevent them from inclusion into the browser JavaScript bundle
				// Reference: https://payloadcms.com/docs/admin/webpack#aliasing-server-only-modules
				alias: {
					...config.resolve.alias,
					[createTokenPath]: mockModulePath
				}
			}
		})
	},
	collections: [
		Users,
		Conversation,
		Company,
		License,
		Package,
		Subscription,
		Billing
		// Add Collections here
	],
	cors: allowedCors,
	csrf: [
		// whitelist of domains to allow cookie auth from
		...allowedCors
	],
	typescript: {
		outputFile: path.resolve(__dirname, 'payload-types.ts')
	}
});
