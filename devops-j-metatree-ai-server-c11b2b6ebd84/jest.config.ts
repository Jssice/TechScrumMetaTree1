/*
 * For a detailed explanation regarding each configuration property and type check, visit:
 * https://jestjs.io/docs/configuration
 */

export default {
	clearMocks: true,
	moduleFileExtensions: ['js', 'ts'],
	roots: ['<rootDir>/src'],
	moduleNameMapper: {
		'@/(.*)': '<rootDir>/src/$1'
	},
	testEnvironment: 'node',
	transform: {
		'^.+\\.ts?$': 'ts-jest'
	},
	verbose: true
};
