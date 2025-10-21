import js from '@eslint/js';
import globals from 'globals';
import prettier from 'eslint-plugin-prettier';
import react from 'eslint-plugin-react';

export default [
  {
    files: ['**/*.js', '**/*.jsx'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      globals: globals.browser,
    },
    plugins: {
      react,
      prettier,
    },
    rules: {
      'prettier/prettier': 'error',
    },
  },
  js.configs.recommended,
  react.configs.recommended,
];
