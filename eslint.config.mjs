import typescriptEslint from "typescript-eslint";

export default [
	{
		files: [`**/*.ts`, `**/*.mjs`],
		plugins: {
			"@typescript-eslint": typescriptEslint.plugin
		},
		languageOptions: {
			parser: typescriptEslint.parser,
			ecmaVersion: 2022,
			sourceType: `module`
		},
		rules: {
			"@typescript-eslint/naming-convention":
				[`warn`, { selector: `import`, format: [`camelCase`, `PascalCase`] }],
			eqeqeq: `warn`,
			"no-throw-literal": `warn`,
			"prefer-const": `warn`,
			"no-var": `warn`,
			semi: `warn`,
			quotes: [`warn`, `backtick`],
			"no-unused-vars": `warn`,
			"no-restricted-syntax": [
				`warn`,
				{
					"selector": `ImportDeclaration > Literal[raw=/^[^"].*/]`,
					"message": `Import declarations must use doublequote.`
				},
				{
					"selector": `ImportExpression > Literal[raw=/^[^"].*/]`,
					"message": `Import expressions must use doublequote.`
				},
				{
					"selector": `ExportNamedDeclaration > Literal[raw=/^[^"].*/]`,
					"message": `Export named declarations must use doublequote.`
				}
			]
		},
	}
];