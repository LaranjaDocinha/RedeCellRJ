import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loyaltyTierService } from '../../../src/services/loyaltyTierService.js';
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

describe('loyaltyTierService', () => {
  beforeEach(() => {
    mockedPool.query.mockClear(); // Limpar o mockQuery antes de cada teste
  });

  // Testes para createTier
  describe('createTier', () => {
    it('should create a new loyalty tier successfully', async () => {
      const tierData = {
        name: 'Silver',
        min_points: 100,
        description: 'Silver Tier Benefits',
        benefits: { free_shipping: true },
      };
      const expectedTier = { id: 1, ...tierData };
      mockedPool.query.mockResolvedValueOnce({ rows: [expectedTier] });

      const result = await loyaltyTierService.createTier(
        tierData.name,
        tierData.min_points,
        tierData.description,
        tierData.benefits,
      );

      expect(result).toEqual(expectedTier);
      expect(mockedPool.query).toHaveBeenCalledTimes(1);
      expect(mockedPool.query).toHaveBeenCalledWith(
        'INSERT INTO loyalty_tiers (name, min_points, description, benefits) VALUES ($1, $2, $3, $4) RETURNING *',
        [tierData.name, tierData.min_points, tierData.description, tierData.benefits],
      );
    });

    it('should throw an error if database query fails', async () => {
      const tierData = {
        name: 'Gold',
        min_points: 500,
        description: 'Gold Tier Benefits',
        benefits: { free_shipping: true, discount: 0.1 },
      };
      const dbError = new Error('DB error during insert');
      mockedPool.query.mockRejectedValueOnce(dbError);

      await expect(
        loyaltyTierService.createTier(
          tierData.name,
          tierData.min_points,
          tierData.description,
          tierData.benefits,
        ),
      ).rejects.toThrow(dbError);
    });
  });

  // Testes para getTier
  describe('getTier', () => {
    it('should return a loyalty tier by ID', async () => {
      const id = 1;
      const mockTier = { id, name: 'Silver', min_points: 100 };
      mockedPool.query.mockResolvedValueOnce({ rows: [mockTier] });

      const result = await loyaltyTierService.getTier(id);

      expect(result).toEqual(mockTier);
      expect(mockedPool.query).toHaveBeenCalledTimes(1);
      expect(mockedPool.query).toHaveBeenCalledWith('SELECT * FROM loyalty_tiers WHERE id = $1', [id]);
    });

    it('should return undefined if tier not found', async () => {
      const id = 99;
      mockedPool.query.mockResolvedValueOnce({ rows: [] });

      const result = await loyaltyTierService.getTier(id);

      expect(result).toBeUndefined();
      expect(mockedPool.query).toHaveBeenCalledTimes(1);
    });

    it('should throw an error if database query fails', async () => {
      const id = 1;
      const dbError = new Error('DB error');
      mockedPool.query.mockRejectedValueOnce(dbError);

      await expect(loyaltyTierService.getTier(id)).rejects.toThrow(dbError);
    });
  });

  // Testes para getAllTiers
  describe('getAllTiers', () => {
    it('should return all loyalty tiers ordered by min_points', async () => {
      const mockTiers = [
        { id: 1, name: 'Bronze', min_points: 0 },
        { id: 2, name: 'Silver', min_points: 100 },
      ];
      mockedPool.query.mockResolvedValueOnce({ rows: mockTiers });

      const result = await loyaltyTierService.getAllTiers();

      expect(result).toEqual(mockTiers);
      expect(mockedPool.query).toHaveBeenCalledTimes(1);
      expect(mockedPool.query).toHaveBeenCalledWith('SELECT * FROM loyalty_tiers ORDER BY min_points ASC');
    });

    it('should return an empty array if no tiers exist', async () => {
      mockedPool.query.mockResolvedValueOnce({ rows: [] });

      const result = await loyaltyTierService.getAllTiers();

      expect(result).toEqual([]);
      expect(mockedPool.query).toHaveBeenCalledTimes(1);
    });

    it('should throw an error if database query fails', async () => {
      const dbError = new Error('DB error');
      mockedPool.query.mockRejectedValueOnce(dbError);

      await expect(loyaltyTierService.getAllTiers()).rejects.toThrow(dbError);
    });
  });

  // Testes para updateTier
  describe('updateTier', () => {
    it('should update a loyalty tier successfully', async () => {
      const id = 1;
      const updateData = {
        name: 'Updated Silver',
        min_points: 150,
        description: 'New benefits',
        benefits: { new_benefit: true },
      };
      const expectedTier = { id, ...updateData };
      mockedPool.query.mockResolvedValueOnce({ rows: [expectedTier] });

      const result = await loyaltyTierService.updateTier(
        id,
        updateData.name,
        updateData.min_points,
        updateData.description,
        updateData.benefits,
      );

      expect(result).toEqual(expectedTier);
      expect(mockedPool.query).toHaveBeenCalledTimes(1);
      expect(mockedPool.query).toHaveBeenCalledWith(
        'UPDATE loyalty_tiers SET name = $1, min_points = $2, description = $3, benefits = $4, updated_at = current_timestamp WHERE id = $5 RETURNING *',
        [updateData.name, updateData.min_points, updateData.description, updateData.benefits, id],
      );
    });

    it('should return undefined if tier not found for update', async () => {
      const id = 99;
      const updateData = { name: 'Non Existent' };
      mockedPool.query.mockResolvedValueOnce({ rows: [] });

      const result = await loyaltyTierService.updateTier(
        id,
        updateData.name,
        100, // min_points is required
        'desc',
        {},
      );

      expect(result).toBeUndefined();
      expect(mockedPool.query).toHaveBeenCalledTimes(1);
    });

    it('should throw an error if database query fails', async () => {
      const id = 1;
      const tierData = { name: 'Error', min_points: 100, description: 'desc', benefits: {} };
      const dbError = new Error('DB error');
      mockedPool.query.mockRejectedValueOnce(dbError);

      await expect(
        loyaltyTierService.updateTier(
          id,
          tierData.name,
          tierData.min_points,
          tierData.description,
          tierData.benefits,
        ),
      ).rejects.toThrow(dbError);
    });
  });

  // Testes para deleteTier
  describe('deleteTier', () => {
    it('should delete a loyalty tier successfully', async () => {
      const id = 1;
      mockedPool.query.mockResolvedValueOnce({ rowCount: 1 });

      const result = await loyaltyTierService.deleteTier(id);

      expect(result).toBe(true);
      expect(mockedPool.query).toHaveBeenCalledTimes(1);
      expect(mockedPool.query).toHaveBeenCalledWith('DELETE FROM loyalty_tiers WHERE id = $1', [id]);
    });

    it('should return false if tier not found for deletion', async () => {
      const id = 99;
      mockedPool.query.mockResolvedValueOnce({ rowCount: 0 });

      const result = await loyaltyTierService.deleteTier(id);

      expect(result).toBe(false);
      expect(mockedPool.query).toHaveBeenCalledTimes(1);
    });

    it('should throw an error if database query fails', async () => {
      const id = 1;
      const dbError = new Error('DB error');
      mockedPool.query.mockRejectedValueOnce(dbError);

      await expect(loyaltyTierService.deleteTier(id)).rejects.toThrow(dbError);
    });
  });

  // Testes para updateCustomerTier
  describe('updateCustomerTier', () => {
    it('should update customer tier based on loyalty points', async () => {
      const customerId = 1;
      // Mock para buscar pontos do cliente
      mockedPool.query.mockResolvedValueOnce({ rows: [{ loyalty_points: 300 }] });
      // Mock para buscar tiers (ordenado por min_points DESC)
      mockedPool.query.mockResolvedValueOnce({
        rows: [
          { id: 3, min_points: 500 },
          { id: 2, min_points: 200 }, // Cliente tem 300 pontos, deve cair neste tier
          { id: 1, min_points: 0 },
        ],
      });
      // Mock para atualizar o customer
      mockedPool.query.mockResolvedValueOnce({ rowCount: 1 });

      await loyaltyTierService.updateCustomerTier(customerId);

      expect(mockedPool.query).toHaveBeenCalledTimes(3); // 1 para customer points, 1 para tiers, 1 para update
      expect(mockedPool.query).toHaveBeenCalledWith(
        'UPDATE customers SET loyalty_tier_id = $1 WHERE id = $2',
        [2, customerId],
      );
    });

    it('should not update tier if customer not found', async () => {
      const customerId = 99;
      mockedPool.query.mockResolvedValueOnce({ rows: [] }); // Cliente não encontrado

      await loyaltyTierService.updateCustomerTier(customerId);

      expect(mockedPool.query).toHaveBeenCalledTimes(1); // Apenas a query para buscar o cliente
      // Nenhuma outra query de atualização deve ser chamada
    });

    it('should update with null tier if no tier matches points', async () => {
      const customerId = 1;
      mockedPool.query.mockResolvedValueOnce({ rows: [{ loyalty_points: 50 }] }); // Pontos abaixo do menor tier
      mockedPool.query.mockResolvedValueOnce({
        rows: [
          { id: 3, min_points: 500 },
          { id: 2, min_points: 200 },
        ],
      });
      mockedPool.query.mockResolvedValueOnce({ rowCount: 1 });

      await loyaltyTierService.updateCustomerTier(customerId);

      expect(mockedPool.query).toHaveBeenCalledTimes(3);
      expect(mockedPool.query).toHaveBeenCalledWith(
        'UPDATE customers SET loyalty_tier_id = $1 WHERE id = $2',
        [null, customerId], // Deve ser null pois nenhum tier corresponde
      );
    });

    it('should throw an error if database query for customer points fails', async () => {
      const customerId = 1;
      const dbError = new Error('DB error on customer points fetch');
      mockedPool.query.mockRejectedValueOnce(dbError);

      await expect(loyaltyTierService.updateCustomerTier(customerId)).rejects.toThrow(dbError);
    });

    it('should throw an error if database query for tiers fails', async () => {
      const customerId = 1;
      mockedPool.query.mockResolvedValueOnce({ rows: [{ loyalty_points: 300 }] });
      const dbError = new Error('DB error on tiers fetch');
      mockedPool.query.mockRejectedValueOnce(dbError);

      await expect(loyaltyTierService.updateCustomerTier(customerId)).rejects.toThrow(dbError);
    });

    it('should throw an error if database query for updating customer fails', async () => {
      const customerId = 1;
      mockedPool.query.mockResolvedValueOnce({ rows: [{ loyalty_points: 300 }] });
      mockedPool.query.mockResolvedValueOnce({
        rows: [
          { id: 2, min_points: 200 },
        ],
      });
      const dbError = new Error('DB error on customer update');
      mockedPool.query.mockRejectedValueOnce(dbError);

      await expect(loyaltyTierService.updateCustomerTier(customerId)).rejects.toThrow(dbError);
    });
  });

  // Testes para updateAllCustomerTiers
  describe('updateAllCustomerTiers', () => {
    it('should update tiers for all customers', async () => {
      const mockCustomers = [{ id: 1 }, { id: 2 }];
      // Mock para buscar todos os clientes
      mockedPool.query.mockResolvedValueOnce({ rows: mockCustomers });
      // Mocks para updateCustomerTier (3 queries cada, então 2 * 3 = 6 queries adicionais)
      // Customer 1
      mockedPool.query.mockResolvedValueOnce({ rows: [{ loyalty_points: 300 }] }); // customer points
      mockedPool.query.mockResolvedValueOnce({ rows: [{ id: 2, min_points: 200 }] }); // tiers
      mockedPool.query.mockResolvedValueOnce({ rowCount: 1 }); // update customer
      // Customer 2
      mockedPool.query.mockResolvedValueOnce({ rows: [{ loyalty_points: 50 }] }); // customer points
      mockedPool.query.mockResolvedValueOnce({ rows: [{ id: 2, min_points: 200 }] }); // tiers
      mockedPool.query.mockResolvedValueOnce({ rowCount: 1 }); // update customer

      await loyaltyTierService.updateAllCustomerTiers();

      expect(mockedPool.query).toHaveBeenCalledTimes(7); // 1 para getAllCustomers + 6 para os 2 clientes
      // Verificar se updateCustomerTier foi chamado para cada cliente
      expect(mockedPool.query).toHaveBeenCalledWith(
        'SELECT id FROM customers',
      );
      // Nao testar as chamadas internas de updateCustomerTier individualmente, pois ja e testado acima.
    });

    it('should handle errors when fetching all customers', async () => {
      const dbError = new Error('DB error fetching all customers');
      mockedPool.query.mockRejectedValueOnce(dbError);

      await expect(loyaltyTierService.updateAllCustomerTiers()).rejects.toThrow(dbError);
    });

    it('should handle errors within updateCustomerTier gracefully (individual error is rethrown)', async () => {
      const mockCustomers = [{ id: 1 }, { id: 2 }];
      mockedPool.query.mockResolvedValueOnce({ rows: mockCustomers });
      // Simulate error for first customer's points fetch
      mockedPool.query.mockRejectedValueOnce(new Error('DB error for customer 1 points'));

      await expect(loyaltyTierService.updateAllCustomerTiers()).rejects.toThrow('DB error for customer 1 points');
      expect(mockedPool.query).toHaveBeenCalledTimes(2); // getAllCustomers + first customer points fetch
    });
  });
});