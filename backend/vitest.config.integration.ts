
import { defineConfig } from 'vitest/config';
import swc from 'unplugin-swc';
import { resolve } from 'path';

export default defineConfig({
  test: {
    include: ['**/*.integration.test.ts'],
    setupFiles: ['./tests/setupVitestEnv.ts', './tests/setupPaymentTest.ts'],
    globalSetup: ['./vitest.global-setup.ts'],
    testTimeout: 30000, // 30 seconds
    hookTimeout: 180000, // 180 seconds for beforeAll/afterAll hooks
    fileParallelism: false, // Run tests sequentially to avoid db deadlocks
    globals: true,
    coverage: {
      enabled: false,
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['**/node_modules/**', '**/dist/**', '**/tests/**', '**/vitest.*.ts', '**/vitest.global-setup.ts'],
    },
  },
  plugins: [
    swc.vite({
      module: { type: 'es6' },
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});
