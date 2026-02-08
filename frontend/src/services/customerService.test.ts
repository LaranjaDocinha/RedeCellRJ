import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as customerService from './customerService';

describe('CustomerService', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  const mockToken = 'jwt-secret';

  it('should fetch all customers', async () => {
    const mockCustomers = [{ id: '1', name: 'John Doe' }];
    (fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockCustomers)
    });

    const result = await customerService.fetchAllCustomers(mockToken);

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/customers'),
      expect.objectContaining({
        headers: { Authorization: `Bearer ${mockToken}` }
      })
    );
    expect(result).toEqual(mockCustomers);
  });

  it('should create a customer', async () => {
    const newCust = { name: 'Jane' };
    (fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: '2', ...newCust })
    });

    const result = await customerService.createCustomer(newCust, mockToken);

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/customers'),
      expect.objectContaining({ method: 'POST' })
    );
    expect(result.id).toBe('2');
  });
});
