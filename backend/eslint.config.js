import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettierPlugin from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';

export default tseslint.config(
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.ts', 'tests/**/*.ts'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: './tsconfig.json',
        sourceType: 'module',
      },
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      ...prettierConfig.rules,
      'prettier/prettier': 'error',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      // Clean Code Rules
      'complexity': ['warn', 10], // Max cyclomatic complexity of 10
      'max-lines-per-function': ['warn', { max: 50, skipBlankLines: true, skipComments: true }], // Max 50 lines per function
      'max-depth': ['warn', 4], // Max 4 levels of nested blocks
      'no-shadow': 'error', // Disallow variable declarations from shadowing variables declared in outer scopes
      'prefer-const': 'error', // Require const declarations for variables that are never reassigned
    },
  },
);
