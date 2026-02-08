import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as soService from './serviceOrderService';

describe('ServiceOrderService', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  const mockToken = 'tech-token';

  it('should fetch all service orders with filters', async () => {
    const mockData = [{ id: 1, product_description: 'Phone' }];
    (fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockData)
    });

    const result = await soService.fetchAllServiceOrders(mockToken, { status: 'Em Reparo' });

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('status=Em+Reparo'),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: `Bearer ${mockToken}` })
      })
    );
    expect(result).toEqual(mockData);
  });

  it('should update service order status', async () => {
    const mockUpdated = { id: 1, status: 'Pronto' };
    (fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockUpdated)
    });

    const result = await soService.changeServiceOrderStatus(mockToken, 1, 'Pronto');

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/service-orders/1/status'),
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({ status: 'Pronto' })
      })
    );
    expect(result.status).toBe('Pronto');
  });

  it('should handle API errors correctly', async () => {
    (fetch as any).mockResolvedValue({
      ok: false,
      status: 404,
      json: () => Promise.resolve({ message: 'OS not found' })
    });

    await expect(soService.fetchServiceOrderById(mockToken, 999)).rejects.toThrow('OS not found');
  });
});
