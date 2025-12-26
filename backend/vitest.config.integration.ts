import { defineConfig } from 'vitest/config';
import swc from 'unplugin-swc';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    include: ['**/*.integration.test.ts'],
    setupFiles: [
      resolve(__dirname, './tests/setupVitestEnv.ts'),
      resolve(__dirname, './tests/setupPaymentTest.ts')
    ],
    globalSetup: [resolve(__dirname, './vitest.global-setup.ts')],
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
