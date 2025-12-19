import { describe, it, expect } from 'vitest';
import { IRepository } from '../../../src/repositories/base.repository.js';

describe('Base Repository Interface', () => {
  it('should exist', () => {
      // Just usage to ensure file is "covered" if possible, or just to have a test file.
      // Since it is an interface, there is no runtime code.
      const mockRepo: IRepository<any> = {
          findById: async () => null,
          findAll: async () => [],
          create: async () => ({}),
          update: async () => ({}),
          delete: async () => true,
      };
      expect(mockRepo).toBeDefined();
  });
});
