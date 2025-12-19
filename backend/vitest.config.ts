import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    globalSetup: './tests/vitest.globalSetup.ts',
    setupFiles: ['./tests/setupVitestEnv.ts'],
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
    // You might need to add resolve.alias or other options here later for path mapping
    // if you use TypeScript path aliases in your project.
  },
  optimizeDeps: {
    include: ['express-validator'],
  },
});