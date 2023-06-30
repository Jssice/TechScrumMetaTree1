const { ESLint } = require('eslint');

const removeIgnoredFiles = async files => {
	const eslint = new ESLint();
	const isIgnored = await Promise.all(
		files.map(file => {
			return eslint.isPathIgnored(file);
		})
	);
	const filteredFiles = files.filter((_, i) => !isIgnored[i]);
	return filteredFiles.join(' ');
};

module.exports = {
	'*.{.js,ts,md,json,d.ts}': ['prettier --write', 'git add .'],
	'*.{.js,ts,json,d.ts}': async files => {
		const filesToLint = await removeIgnoredFiles(files);
		return [`eslint --fix --max-warnings=0 ${filesToLint}`];
	}
};
