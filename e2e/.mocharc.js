const path = require("path");

module.exports = {
	require: [path.resolve('./ts-hook.js'), 'source-map-support/register'],
	// reporter: 'spec',
	watch: false,
};