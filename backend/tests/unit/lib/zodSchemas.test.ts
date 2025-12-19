import { describe, it, expect } from 'vitest';
import { partSchema, serviceOrderSchema } from '../../../src/lib/zodSchemas.js';

describe('Zod Schemas', () => {
  describe('partSchema', () => {
    it('should validate valid part', () => {
      const valid = { name: 'Part A', stock_quantity: 10 };
      expect(partSchema.safeParse(valid).success).toBe(true);
    });

    it('should reject invalid part', () => {
      const invalid = { name: 'A', stock_quantity: -1 };
      expect(partSchema.safeParse(invalid).success).toBe(false);
    });
  });

  describe('serviceOrderSchema', () => {
    it('should validate valid service order', () => {
      const valid = {
        customer_id: 1,
        product_description: 'Phone',
        issue_description: 'Broken Screen 12345',
      };
      expect(serviceOrderSchema.safeParse(valid).success).toBe(true);
    });

    it('should reject invalid service order', () => {
      const invalid = { customer_id: '1' }; // Wrong type
      expect(serviceOrderSchema.safeParse(invalid).success).toBe(false);
    });
  });
});
