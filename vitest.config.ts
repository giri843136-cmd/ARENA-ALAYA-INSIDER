import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        global: {
          branches: 85,
          functions: 90,
          lines: 90,
          statements: 90,
        },
        'lib/recommendations/**': { lines: 95 },
        'lib/analytics/**': { lines: 90 },
        'lib/backend/auth/**': { lines: 95 },
        'lib/ai/**': { lines: 80 },
      },
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/tests/e2e/**',
        '**/*.config.*',
        '**/scripts/**',
      ],
    },
    include: ['tests/unit/**/*.test.{ts,tsx}', 'lib/**/*.test.{ts,tsx}'],
    exclude: ['tests/e2e/**', 'tests/performance/**'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
});
