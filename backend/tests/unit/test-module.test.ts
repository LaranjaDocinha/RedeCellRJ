import { testFunction } from '../../src/utils/test-module.js'; // Import with .js extension

describe('Test Module Resolution', () => {
  it('should import the test module correctly', () => {
    expect(testFunction()).toBe('Hello from test module');
  });
});
