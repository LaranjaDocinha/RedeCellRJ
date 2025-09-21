import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true, // Enables global APIs like describe, it, expect
    environment: 'jsdom', // Provides a browser-like environment (window, document)
    setupFiles: './src/setupTests.ts', // Assuming you have a setup file for @testing-library/jest-dom
    // You might need to add resolve.alias or other options here later for path mapping
    // if you use TypeScript path aliases in your project.
  },
});
