import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const omegaPlugin = require(join(__dirname, '..', 'eslint-plugin', 'index.cjs'));

/**
 * ESLint flat config fragments for Omega app code (after eslint + typescript-eslint recommended).
 * Spread into `tseslint.config(...recommended, ...omegaAngularEslintConfigs)`.
 */
export const omegaAngularEslintConfigs = [
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
      '**/dist/**',
      '**/.angular/**',
      '**/out-tsc/**',
      '**/coverage/**',
      'projects/omega-angular/**',
      '**/node_modules/omega-angular/**',
      '**/*.spec.ts',
    ],
    plugins: { 'omega-angular': omegaPlugin },
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
];
