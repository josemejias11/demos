// Flat ESLint config for TypeScript + Node + minimal stylistic rules
// Migration target for ESLint v9+.

const tsParser = require('@typescript-eslint/parser');
const tsPlugin = require('@typescript-eslint/eslint-plugin');

/** @type {import('eslint').Linter.FlatConfig[]} */
module.exports = [
  {
    files: ['**/*.ts', '**/*.js'],
    ignores: [
      'node_modules/**',
      'dist/**',
      'build/**',
      'test-results/**',
      'playwright-report/**',
      'allure-results/**',
      'automation-telemetry.jsonl',
      'automation-locators-kb.jsonl',
    ],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2021,
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      // Use TS-aware unused vars rule and disable the base one to avoid false positives
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
      'no-console': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
];
