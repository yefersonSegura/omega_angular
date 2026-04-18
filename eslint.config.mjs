// Omega ESLint: monorepo uses projects/<app>/src globs; standalone Angular apps use src/ at repo root.
// See eslint-plugin-omega-angular for path detection (any tree under src/).
import { createRequire } from 'node:module';

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

const require = createRequire(import.meta.url);
const omegaAngular = require('omega-angular/eslint-plugin/index.cjs');

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.angular/**',
      '**/out-tsc/**',
      '**/coverage/**',
      'projects/omega-angular/**/*.js',
      'projects/eslint-plugin-omega-angular/**/*.cjs',
      'projects/omega-angular/eslint-plugin/**',
      'projects/omega-angular/eslint/**',
      'projects/omega-angular/eslint-then/**',
      '**/*.d.ts',
    ],
  },
  {
    files: ['projects/**/*.ts'],
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  {
    files: ['projects/*/src/**/*.ts', 'src/**/*.ts'],
    ignores: [
      '**/node_modules/**',
      'projects/omega-angular/**',
      '**/*.spec.ts',
    ],
    plugins: { 'omega-angular': omegaAngular },
    rules: {
      'omega-angular/prefer-intent-from-name': 'error',
      'omega-angular/prefer-event-from-name': 'error',
      'omega-angular/no-http-client-in-orchestration': 'error',
      'omega-angular/no-channel-inject-in-services': 'warn',
      'omega-angular/no-http-client-in-components': 'error',
      'omega-angular/no-value-import-from-services-in-components': 'error',
      'omega-angular/no-web-storage-in-components': 'error',
      'omega-angular/no-ngrx-in-components': 'error',
      'omega-angular/no-omega-session-helper-in-components': 'error',
    },
  },
);
