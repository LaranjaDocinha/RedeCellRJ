import { describe, it, expect } from 'vitest';
import * as labelService from '../../../src/services/labelService.js';

describe('labelService', () => {
  it('generateProductLabelZPL should return ZPL string with product info', () => {
    const zpl = labelService.generateProductLabelZPL('Test Product', 10.50, 'SKU123');
    expect(zpl).toContain('^XA');
    expect(zpl).toContain('Test Product');
    expect(zpl).toContain('R$ 10.50');
    expect(zpl).toContain('SKU123');
    expect(zpl).toContain('^XZ');
  });

  it('generateOSLabelZPL should return ZPL string with OS info', () => {
    const zpl = labelService.generateOSLabelZPL(101, 'Customer One', 'iPhone X');
    expect(zpl).toContain('^XA');
    expect(zpl).toContain('OS #101');
    expect(zpl).toContain('Customer One');
    expect(zpl).toContain('iPhone X');
    expect(zpl).toContain('^XZ');
  });
});
