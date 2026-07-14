// eslint.config.js
// Flat config (ESLint 9+). Run via `npm run lint`.

import js from '@eslint/js';
import typescriptEslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import importPlugin from 'eslint-plugin-import';
import jsxA11y from 'eslint-plugin-jsx-a11y';

export default typescriptEslint.config(
  { ignores: ['dist', 'node_modules', 'coverage', '*.config.js'] },

  js.configs.recommended,
  ...typescriptEslint.configs.strictTypeChecked,
  ...typescriptEslint.configs.stylisticTypeChecked,

  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parserOptions: {
        project: ['./tsconfig.json', './tsconfig.node.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      import: importPlugin,
      'jsx-a11y': jsxA11y,
    },
    settings: {
      'import/resolver': {
        typescript: { alwaysTryTypes: true, project: './tsconfig.json' },
      },
    },
    rules: {
      // ------------------------------------------------------------------
      // React Hooks — non-negotiable, catches stale closures and missing
      // deps that would otherwise surface as hard-to-repro production bugs
      // in the transactions/analytics data-fetching hooks.
      // ------------------------------------------------------------------
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],

      // ------------------------------------------------------------------
      // MONEY FORMATTING BOUNDARY — enforces the rule promised in
      // src/shared/utils/currency.ts: nowhere outside that file may call
      // .toFixed() on a number or construct Intl.NumberFormat directly.
      // ------------------------------------------------------------------
      'no-restricted-syntax': [
        'error',
        {
          selector:
            "CallExpression[callee.property.name='toFixed']",
          message:
            'Do not call .toFixed() on monetary values directly. Use formatCurrency() from @/shared/utils/currency.',
        },
        {
          selector:
            "NewExpression[callee.object.name='Intl'][callee.property.name='NumberFormat']",
          message:
            'Do not construct Intl.NumberFormat directly for money. Use formatCurrency() from @/shared/utils/currency.',
        },
      ],

      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              // Blocks `import { X } from '@/features/transactions/components/TxRow'`
              // from OUTSIDE the transactions feature — only the barrel
              // (`@/features/transactions`) is a valid cross-feature import.
              group: [
                '@/features/*/components/*',
                '@/features/*/hooks/*',
                '@/features/*/api/*',
                '@/features/*/services/*',
                '@/features/*/utils/*',
                '@/features/*/context/*',
                '@/features/*/validation/*',
              ],
              message:
                'Deep-import into another feature is forbidden. Import only from that feature\'s barrel (e.g. "@/features/transactions").',
            },
            {
              group: ['../../*'],
              message:
                'Avoid traversing more than one directory up with relative imports — use the "@/" path alias instead.',
            },
          ],
        },
      ],

      // ------------------------------------------------------------------
      // Import hygiene
      // ------------------------------------------------------------------
      'import/order': [
        'warn',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
            'type',
          ],
          pathGroups: [
            { pattern: '@/app/**', group: 'internal', position: 'before' },
            { pattern: '@/features/**', group: 'internal', position: 'before' },
            { pattern: '@/shared/**', group: 'internal' },
            { pattern: '@/styles/**', group: 'internal', position: 'after' },
          ],
          pathGroupsExcludedImportTypes: ['builtin'],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
      'import/no-duplicates': 'error',
      'import/no-cycle': ['error', { maxDepth: 3 }],

      // ------------------------------------------------------------------
      // TypeScript strictness beyond tsconfig — lint-time only checks
      // ------------------------------------------------------------------
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'separate-type-imports' },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/explicit-function-return-type': [
        'warn',
        { allowExpressions: true },
      ],
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': [
        'error',
        { checksVoidReturn: { attributes: false } },
      ],

      // ------------------------------------------------------------------
      // Accessibility (WCAG AA requirement from spec)
      // ------------------------------------------------------------------
      ...jsxA11y.configs.recommended.rules,
    },
  },

  {
    // Config files run under Node, not the browser — relax type-aware
    // linting overhead for them.
    files: ['*.config.ts', '*.config.js'],
    extends: [typescriptEslint.configs.disableTypeChecked],
  },
);
