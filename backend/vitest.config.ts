import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setupVitestEnv.ts', './tests/setupDbMock.ts'],
    globalSetup: './tests/vitest.globalSetup.ts',
    include: ['tests/unit/**/*.test.ts', 'tests/integration/**/*.test.ts'],
    deps: {
      optimizer: {
        ssr: {
          include: ['express-validator'],
        },
      },
    },
    transformMode: {
      ssr: ['express-validator'],
      web: ['express-validator'],
    },
    hookTimeout: 300000,
    alias: {
      '../src/db': './tests/__mocks__/db.ts',
    }, // Aumentar o timeout para 5 minutos
    // You might need to add resolve.alias or other options here later for path mapping
    // if you use TypeScript path aliases in your project.
  },
  optimizeDeps: {
    include: ['express-validator'],
  },
});