import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as meService from '../../../src/services/meService.js';
import pool from '../../../src/db/index.js';
import { AppError } from '../../../src/utils/errors.js';

// Mock do módulo db/index.js para controlar a função `pool.query`
vi.mock('../../../src/db/index.js', () => {
  const mockQuery = vi.fn(); // Declarado DENTRO da factory
  return {
    default: {
      query: mockQuery,
    },
  };
});

// Acessar a função query do mock de pool.
const mockedPool = pool as { query: vi.Mock };

describe('meService', () => {
  beforeEach(() => {
    mockedPool.query.mockClear(); // Limpar o mockQuery antes de cada teste
  });

  // Testes para getMyProfile
  describe('getMyProfile', () => {
    it('should return the user profile if found', async () => {
      const userId = 1;
      const mockProfile = {
        id: userId,
        name: 'Test User',
        email: 'test@example.com',
        phone: '12345',
      };
      mockedPool.query.mockResolvedValueOnce({ rows: [mockProfile] });

      const result = await meService.getMyProfile(userId);

      expect(result).toEqual(mockProfile);
      expect(mockedPool.query).toHaveBeenCalledTimes(1);
      expect(mockedPool.query).toHaveBeenCalledWith(
        'SELECT id, name, email, phone FROM users WHERE id = $1',
        [userId],
      );
    });

    it('should return undefined if user profile not found', async () => {
      const userId = 99;
      mockedPool.query.mockResolvedValueOnce({ rows: [] });

      const result = await meService.getMyProfile(userId);

      expect(result).toBeUndefined();
      expect(mockedPool.query).toHaveBeenCalledTimes(1);
    });

    it('should throw an error if database query fails', async () => {
      const userId = 1;
      const dbError = new Error('DB error');
      mockedPool.query.mockRejectedValueOnce(dbError);

      await expect(meService.getMyProfile(userId)).rejects.toThrow(dbError);
    });
  });

  // Testes para getMySales
  describe('getMySales', () => {
    it('should return a list of sales for the user', async () => {
      const userId = 1;
      const mockSales = [{ id: 1, user_id: userId, total: 100, sale_date: new Date() }];
      mockedPool.query.mockResolvedValueOnce({ rows: mockSales });

      const result = await meService.getMySales(userId);

      expect(result).toEqual(mockSales);
      expect(mockedPool.query).toHaveBeenCalledTimes(1);
      expect(mockedPool.query).toHaveBeenCalledWith(
        'SELECT * FROM sales WHERE user_id = $1 ORDER BY sale_date DESC',
        [userId],
      );
    });

    it('should return an empty array if no sales found for the user', async () => {
      const userId = 99;
      mockedPool.query.mockResolvedValueOnce({ rows: [] });

      const result = await meService.getMySales(userId);

      expect(result).toEqual([]);
      expect(mockedPool.query).toHaveBeenCalledTimes(1);
    });

    it('should throw an error if database query fails', async () => {
      const userId = 1;
      const dbError = new Error('DB error');
      mockedPool.query.mockRejectedValueOnce(dbError);

      await expect(meService.getMySales(userId)).rejects.toThrow(dbError);
    });
  });

  // Testes para getMyServiceOrders
  describe('getMyServiceOrders', () => {
    it('should return a list of service orders for the user', async () => {
      const userId = 1;
      const mockServiceOrders = [
        { id: 1, user_id: userId, description: 'Repair', created_at: new Date() },
      ];
      mockedPool.query.mockResolvedValueOnce({ rows: mockServiceOrders });

      const result = await meService.getMyServiceOrders(userId);

      expect(result).toEqual(mockServiceOrders);
      expect(mockedPool.query).toHaveBeenCalledTimes(1);
      expect(mockedPool.query).toHaveBeenCalledWith(
        'SELECT * FROM service_orders WHERE user_id = $1 ORDER BY created_at DESC',
        [userId],
      );
    });

    it('should return an empty array if no service orders found for the user', async () => {
      const userId = 99;
      mockedPool.query.mockResolvedValueOnce({ rows: [] });

      const result = await meService.getMyServiceOrders(userId);

      expect(result).toEqual([]);
      expect(mockedPool.query).toHaveBeenCalledTimes(1);
    });

    it('should throw an error if database query fails', async () => {
      const userId = 1;
      const dbError = new Error('DB error');
      mockedPool.query.mockRejectedValueOnce(dbError);

      await expect(meService.getMyServiceOrders(userId)).rejects.toThrow(dbError);
    });
  });
});
