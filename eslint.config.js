import { default as defaultConfig } from '@epic-web/config/eslint'

/** @type {import("eslint").Linter.Config} */
export default [
	...defaultConfig,
	{
		// Apply this configuration to all TypeScript files
		files: ['**/*.ts', '**/*.tsx'],
		// Exclude specific files or patterns
		excludedFiles: [
			'**/*.spec.ts', // Exclude test files
			'node_modules/**/*', // Exclude node_modules
			'build/**/*', // Exclude build folder
			'dist/**/*', // Exclude dist folder
			'app/routes/**/*', // Adjust as needed to exclude specific routes or paths
		],
		rules: {
			// Add any additional rule customizations here if needed
		},
	},
]
