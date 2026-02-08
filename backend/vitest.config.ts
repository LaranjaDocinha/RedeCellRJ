import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    globalSetup: './vitest.global-setup.ts',
    setupFiles: ['./tests/setupVitestEnv.ts'],
    include: ['tests/unit/**/*.test.ts', 'tests/integration/**/*.test.ts'],
    
    // Force sequential execution in a single process to eliminate DB conflicts
    fileParallelism: false,
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },

    hookTimeout: 300000,
    testTimeout: 60000,
  },
});
