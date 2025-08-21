module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  setupFilesAfterEnv: ['./jest.setup.js'],
  globalSetup: './jest.globalSetup.js',
  globalTeardown: './jest.globalTeardown.js',
};