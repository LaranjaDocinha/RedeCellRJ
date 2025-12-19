import { describe, it, expect, vi } from 'vitest';
import * as customerPortalService from '../../../src/services/customerPortalService';

// Mock getPool to avoid import errors, even if not used
vi.mock('../../../src/db/index', () => ({
  getPool: vi.fn(),
}));

describe('CustomerPortalService', () => {
  it('should return simulated customer history', async () => {
    const result = await customerPortalService.getCustomerHistory(1);
    expect(result.success).toBe(true);
    expect(result.history).toBeDefined();
    expect(result.history.purchases).toHaveLength(2);
  });

  it('should simulate updating customer data', async () => {
    const result = await customerPortalService.updateCustomerData(1, { name: 'New Name' });
    expect(result.success).toBe(true);
    expect(result.message).toContain('Customer 1 data updated');
  });

  it('should return simulated customer invoices', async () => {
    const result = await customerPortalService.getCustomerInvoices(1);
    expect(result.success).toBe(true);
    expect(result.invoices).toEqual([]);
  });

  it('should return simulated customer warranties', async () => {
    const result = await customerPortalService.getCustomerWarranties(1);
    expect(result.success).toBe(true);
    expect(result.warranties).toEqual([]);
  });
});
