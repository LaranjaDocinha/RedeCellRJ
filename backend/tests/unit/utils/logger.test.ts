import { describe, it, expect, vi } from 'vitest';
import { logger, errorSerializer } from '../../../src/utils/logger.js';

describe('Logger Utils', () => {
  it('should be defined', () => {
    expect(logger).toBeDefined();
  });

  it('should have an error serializer', () => {
    expect(errorSerializer).toBeDefined();
  });

  describe('errorSerializer', () => {
      it('should serialize Error objects', () => {
          const err = new Error('Test error');
          err.stack = 'stack trace';
          
          const result = errorSerializer(err);
          expect(result.message).toBe('Test error');
          expect(result.stack).toBe('stack trace');
      });

      it('should return the object if not an Error', () => {
        const result = errorSerializer({ foo: 'bar' });
        expect(result).toEqual({ foo: 'bar' });
      });
  });
});