module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/backend/tests/**/*.test.js'],
  setupFilesAfterEnv: ['./backend/jest.setup.js'],
  globalSetup: './backend/jest.globalSetup.js',
  globalTeardown: './backend/jest.globalTeardown.js',
};