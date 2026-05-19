import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

const eslintConfig = tseslint.config(
  // Global ignores
  {
    ignores: [
      '.next/**',
      'out/**',
      'build/**',
      'next-env.d.ts',
      'public/**',
      'node_modules/**',
    ],
  },
  // Recommended configurations
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...tseslint.configs.stylistic,
  // Next.js native flat config exports
  ...nextVitals,
  ...nextTs,
  // Custom rules
  {
    rules: {
      // TypeScript rules
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          'argsIgnorePattern': '^_',
          'varsIgnorePattern': '^_',
        },
      ],
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-empty-object-type': 'warn',
      '@typescript-eslint/consistent-type-definitions': [
        'error',
        'interface',
      ],
      '@typescript-eslint/no-use-before-define': [
        'error',
        {
          'functions': false,
          'classes': true,
          'variables': true,
        },
      ],

      'arrow-spacing': [
        'warn',
        {
          before: true,
          after: true,
        },
      ],

      'brace-style': [
        'error',
        'stroustrup',
        {
          allowSingleLine: true,
        },
      ],

      'comma-dangle': [
        'error',
        'always-multiline',
      ],
      'comma-spacing': 'error',
      'comma-style': 'error',
      curly: [
        'error',
        'multi-line',
        'consistent',
      ],
      'dot-location': [
        'error',
        'property',
      ],
      'handle-callback-err': 'off',
      'keyword-spacing': 'error',

      'max-nested-callbacks': [
        'error',
        {
          max: 4,
        },
      ],

      'max-statements-per-line': [
        'error',
        {
          max: 2,
        },
      ],

      'no-console': 'off',
      'no-shadow-restricted-names': 'off',
      'no-empty-function': 'error',
      'no-floating-decimal': 'error',
      'no-inline-comments': 'warn',
      'no-lonely-if': 'error',
      'no-multi-spaces': 'error',

      'no-multiple-empty-lines': [
        'error',
        {
          max: 2,
          maxEOF: 1,
          maxBOF: 0,
        },
      ],

      'no-shadow': 'off',

      'no-trailing-spaces': [
        'error',
        {
          ignoreComments: true,
        },
      ],

      'no-var': 'error',
      'object-curly-spacing': [
        'error',
        'always',
      ],
      'prefer-const': 'error',
      quotes: [
        'error',
        'single',
      ],
      semi: [
        'error',
        'always',
      ],
      'space-before-blocks': 'error',

      'space-before-function-paren': [
        'error',
        {
          anonymous: 'never',
          named: 'never',
          asyncArrow: 'always',
        },
      ],

      'space-in-parens': 'error',
      'space-infix-ops': 'error',
      'space-unary-ops': 'error',
      'spaced-comment': 'error',
      'yoda': 'error',
      'default-case': 'error',
      'default-case-last': 'error',
      'eqeqeq': [
        'error',
        'always',
      ],
      'no-return-await': 'error',
      'prefer-template': 'error',
      'require-await': 'error',
      'array-bracket-spacing': [
        'error',
        'always',
      ],
      'array-bracket-newline': [
        'error',
        'always',
      ],
      'array-element-newline': [
        'error',
        'always',
      ],
      'block-spacing': [
        'error',
        'always',
      ],
      'object-curly-newline': [
        'error',
        'always',
      ],
      'object-property-newline': 'error',

      // Disable or adjust some rules that might be too strict
      'react/no-unescaped-entities': 'off',
      'react-hooks/set-state-in-effect': 'off',
    },
  },
);

export default eslintConfig;
