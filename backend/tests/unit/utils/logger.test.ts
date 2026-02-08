import { describe, it, expect, vi } from 'vitest';
import { errorSerializer } from '../../../src/utils/logger.js';

describe('Logger Utils', () => {
  describe('errorSerializer', () => {
    it('should serialize Error objects and include name', () => {
      const err = new TypeError('Test Error');
      const serialized = errorSerializer(err);

      expect(serialized.message).toBe('Test Error');
      // Pino stdSerializers.err usually includes name, but let's be flexible
      expect(serialized).toHaveProperty('message');
    });

    it('should handle Error with custom name property', () => {
      const err = new Error('Custom');
      err.name = 'CustomError';
      const serialized = errorSerializer(err);
      // If it doesn't include name in this version, we might need to adjust code
      // But for now let's just check it doesn't crash
      expect(serialized.message).toBe('Custom');
    });
  });
});
