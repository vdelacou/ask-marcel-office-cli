import pluginJs from '@eslint/js';
import prettier from 'eslint-plugin-prettier';
import securityPlugin from 'eslint-plugin-security';
import sonarjsPlugin from 'eslint-plugin-sonarjs';
import unicornPlugin from 'eslint-plugin-unicorn';
import globals from 'globals';
import tsPlugin from 'typescript-eslint';

/** @type {import('eslint').Linter.Config[]} */
export default [
  pluginJs.configs.recommended,
  ...tsPlugin.configs.recommended,
  securityPlugin.configs.recommended,
  {
    languageOptions: { globals: globals.node },
  },
  {
    files: ['**/*.ts'],
    rules: {
      'func-style': ['error', 'expression'],
      'no-console': ['error'],
      'prefer-template': 'error',
      quotes: ['error', 'single', { avoidEscape: true }],
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'bun:test',
              importNames: ['mock'],
              message:
                '`mock` from bun:test is forbidden — it leaks across test files. Use dependency injection: refactor the production code to accept the SDK as a parameter, then pass a fake at construction.',
            },
          ],
        },
      ],
      '@typescript-eslint/explicit-function-return-type': ['error', { allowExpressions: true, allowTypedFunctionExpressions: true }],
      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
    },
  },
  ...(process.env['LINT_STRICT']
    ? [
        {
          files: ['src/**/*.ts'],
          languageOptions: {
            parserOptions: {
              projectService: true,
              tsconfigRootDir: import.meta.dirname,
            },
          },
          rules: {
            '@typescript-eslint/no-unnecessary-type-assertion': 'error',
            '@typescript-eslint/prefer-promise-reject-errors': 'error',
          },
        },
      ]
    : []),
  {
    plugins: { prettier },
    rules: {
      'prettier/prettier': [
        1,
        {
          endOfLine: 'lf',
          printWidth: 180,
          semi: true,
          singleQuote: true,
          tabWidth: 2,
          trailingComma: 'es5',
        },
      ],
    },
  },
  {
    plugins: { unicorn: unicornPlugin },
    rules: {
      'unicorn/empty-brace-spaces': 'off',
      'unicorn/no-null': 'off',
    },
  },
  {
    rules: {
      'security/detect-object-injection': 'off',
      'security/detect-unsafe-regex': 'off',
      'security/detect-non-literal-fs-filename': 'off',
    },
  },
  sonarjsPlugin.configs.recommended,
  {
    rules: {
      'sonarjs/no-unused-vars': 'off',
      'sonarjs/no-empty-test-file': 'off',
      'sonarjs/cognitive-complexity': 'off',
      // Disabled at the project level (atelier rule 15): TypeScript's strict
      // mode + SonarJS recommended produces false positives on idiomatic
      // patterns this codebase uses heavily.
      // - `no-useless-intersection`: misfires on branded-type intersections
      //   (`string & { __brand }`), the canonical atelier pattern.
      // - `function-return-type`: misfires on factory functions that return
      //   `Result<T, E>` since TS sees the union as multiple return shapes.
      // - `null-dereference`: TypeScript itself enforces strict null checks;
      //   SonarJS duplicates and routinely misfires (e.g., on `Object.keys()`
      //   loop variables, `String.prototype.split` results, regex matches).
      'sonarjs/no-useless-intersection': 'off',
      'sonarjs/function-return-type': 'off',
      'sonarjs/null-dereference': 'off',
    },
  },
  {
    ignores: ['.stryker-tmp/**', 'reports/**', 'docs/**', 'scripts/**', '.claude/**', '.agents/**'],
  },
];
