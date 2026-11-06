import js from '@eslint/js'
import globals from 'globals'
import vitest from '@vitest/eslint-plugin'
import stylistic from '@stylistic/eslint-plugin'
import tseslint from 'typescript-eslint'

export default [
  {
    files: ['**/*.js'],

    languageOptions: {
      globals: {
        ...globals.browser,
        global: 'writable',
      },
    },

    plugins: {
      js,
      vitest,
      '@stylistic': stylistic,
    },

    rules: {
      ...js.configs.recommended.rules,
      ...vitest.configs.recommended.rules,
      ...stylistic.configs.recommended.rules,

      '@stylistic/padded-blocks': 'off',
      '@stylistic/multiline-ternary': 'off',
      '@stylistic/brace-style': ['error', '1tbs'],
    },
  },

  ...tseslint.configs.recommended.map(config => ({ ...config, files: ['**/*.ts'] })),

  {
    files: ['**/*.ts'],

    languageOptions: {
      globals: {
        ...globals.browser,
        global: 'writable',
      },
    },

    plugins: {
      '@stylistic': stylistic,
    },

    rules: {
      '@stylistic/padded-blocks': 'off',
      '@stylistic/multiline-ternary': 'off',
      '@stylistic/brace-style': ['error', '1tbs'],
    },
  },

  {
    ignores: ['dist/', 'node_modules/'],
  },
]
