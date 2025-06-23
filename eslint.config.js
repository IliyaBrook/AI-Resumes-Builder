import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import unusedImports from 'eslint-plugin-unused-imports';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});

export default tseslint.config(
  {
    ignores: ['node_modules/', 'dist/', '.next/', '**/eslint.config.js'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...compat.config({
    extends: ['next/core-web-vitals'],
  }),
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    plugins: {
      'unused-imports': unusedImports,
    },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        projectService: true,
        tsconfigRootDir: __dirname,
      },
    },
    rules: {
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': 'warn',
      'react-hooks/exhaustive-deps': 'off',
      'react/display-name': 'off',
      'react/no-unescaped-entities': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-unused-expressions': 'warn',
      'prefer-const': 'error',
      'no-var': 'error',
      'no-console': 'off',
      'no-empty': 'warn',
      'no-useless-escape': 'warn',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  }
);
