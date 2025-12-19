import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { inventoryService } from '../../../src/services/inventoryService.js';
import { AppError } from '../../../src/utils/errors.js';
import { demandPredictionService } from '../../../src/services/demandPredictionService.js';

// Mock do módulo de banco de dados
vi.mock('../../../src/db/index.js', () => {
  const mockQuery = vi.fn();
  const mockRelease = vi.fn();
  const mockClient = {
    query: mockQuery,
    release: mockRelease,
  };
  const mockConnect = vi.fn().mockResolvedValue(mockClient);
  const mockPool = {
    query: mockQuery,
    connect: mockConnect,
  };
  
  return {
    default: mockPool,
    getPool: () => mockPool,
    // Exportar para controle nos testes
    _mockQuery: mockQuery,
    _mockConnect: mockConnect,
    _mockClient: mockClient,
    _mockPool: mockPool
  };
});

// Mock do módulo de predição
vi.mock('../../../src/services/demandPredictionService.js', () => ({
  demandPredictionService: {
    predictDemand: vi.fn(),
  },
}));

// Mock do fetch global
global.fetch = vi.fn();

describe('inventoryService', () => {
  let mockQuery: any;
  let mockConnect: any;

  beforeEach(async () => {
    // Importar as referências dos mocks
    const dbModule = await import('../../../src/db/index.js');
    mockQuery = (dbModule as any)._mockQuery;
    mockConnect = (dbModule as any)._mockConnect;
    
    vi.clearAllMocks();
    
    // Define um comportamento padrão seguro para query
    mockQuery.mockResolvedValue({ rows: [], rowCount: 0 });
    
    // Resetar outros mocks
    mockConnect.mockResolvedValue((dbModule as any)._mockClient);
    (global.fetch as vi.Mock).mockClear();
    vi.mocked(demandPredictionService.predictDemand).mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('adjustStock', () => {
    const variationId = 1;
    const branchId = 1;
    const userId = 'test-user-id';

    it('should increase stock and record movement successfully', async () => {
      mockQuery.mockImplementation(async (sql: string, params: any[]) => {
        if (sql === 'BEGIN' || sql === 'COMMIT') return {};
        if (sql.includes('SELECT ps.quantity as stock_quantity')) {
          return {
            rows: [{ stock_quantity: 10, low_stock_threshold: 5, product_id: 101 }],
            rowCount: 1,
          };
        }
        if (sql.includes('UPDATE product_stock')) {
          return {
            rows: [{ quantity: 15 }],
            rowCount: 1,
          };
        }
        if (sql.includes('INSERT INTO inventory_movements')) {
          return { rowCount: 1 };
        }
        return { rows: [], rowCount: 0 };
      });

      const result = await inventoryService.adjustStock(
        variationId,
        5,
        'stock_received',
        userId,
        undefined,
        10,
        branchId,
      );

      expect(result).toEqual({ quantity: 15 });
      expect(mockQuery).toHaveBeenCalledWith('BEGIN');
      expect(mockQuery).toHaveBeenCalledWith('COMMIT');
    });
    // ... restante dos testes iguais, pois mockQuery já está no escopo ...

    it('should decrease stock and record movement successfully (non-FIFO)', async () => {
      mockQuery.mockImplementation(async (sql: string) => {
        if (sql === 'BEGIN' || sql === 'COMMIT') return {};
        if (sql.includes('SELECT ps.quantity')) {
          return {
            rows: [{ stock_quantity: 10, low_stock_threshold: 5, product_id: 101 }],
            rowCount: 1,
          };
        }
        if (sql.includes('UPDATE product_stock')) {
          return { rows: [{ quantity: 7 }], rowCount: 1 };
        }
        // Ajustado para garantir que retorne camadas se a query for feita
        if (sql.includes('FROM inventory_movements') && sql.includes('quantity_remaining > 0')) {
           return { 
               rows: [{ id: 999, quantity_remaining: 100 }], 
               rowCount: 1 
           };
        }
        return { rows: [], rowCount: 0 }; 
      });

      const result = await inventoryService.adjustStock(
        variationId,
        -3,
        'stock_dispatched',
        userId,
        undefined,
        undefined,
        branchId,
      );

      expect(result).toEqual({ quantity: 7 });
    });

    it('should throw AppError if product variation stock not found', async () => {
      mockQuery.mockImplementation(async (sql: string) => {
        if (sql === 'BEGIN' || sql === 'ROLLBACK') return {};
        if (sql.includes('SELECT ps.quantity')) {
          return { rows: [], rowCount: 0 }; // Not found
        }
        return { rows: [], rowCount: 0 };
      });

      await expect(
        inventoryService.adjustStock(variationId, 5, 'stock_received', userId, undefined, 10, branchId),
      ).rejects.toThrow(AppError);
      
      expect(mockQuery).toHaveBeenCalledWith('ROLLBACK');
    });

    it('should throw AppError if stock quantity becomes negative', async () => {
      mockQuery.mockImplementation(async (sql: string) => {
        if (sql === 'BEGIN' || sql === 'ROLLBACK') return {};
        if (sql.includes('SELECT ps.quantity')) {
          return {
            rows: [{ stock_quantity: 2, low_stock_threshold: 5, product_id: 101 }], // 2 + (-5) < 0
            rowCount: 1,
          };
        }
        return { rows: [], rowCount: 0 };
      });

      await expect(
        inventoryService.adjustStock(variationId, -5, 'stock_dispatched', userId, undefined, undefined, branchId),
      ).rejects.toThrow('Stock quantity cannot be negative');
      
      expect(mockQuery).toHaveBeenCalledWith('ROLLBACK');
    });

    it('should throw AppError if unit cost is not provided for stock_received', async () => {
        mockQuery.mockImplementation(async (sql: string) => {
            if (sql === 'BEGIN' || sql === 'ROLLBACK') return {};
            if (sql.includes('SELECT ps.quantity')) {
                return {
                    rows: [{ stock_quantity: 10, low_stock_threshold: 5, product_id: 101 }],
                    rowCount: 1,
                };
            }
            return { rows: [], rowCount: 0 };
        });

        await expect(
            inventoryService.adjustStock(variationId, 5, 'stock_received', userId, undefined, undefined, branchId),
        ).rejects.toThrow('Unit cost is required');
        
        expect(mockQuery).toHaveBeenCalledWith('ROLLBACK');
    });

    it('should send low stock notification if stock falls below threshold', async () => {
      mockQuery.mockImplementation(async (sql: string) => {
        if (sql === 'BEGIN' || sql === 'COMMIT') return {};
        if (sql.includes('SELECT ps.quantity')) {
          return {
            rows: [{ stock_quantity: 10, low_stock_threshold: 5, product_id: 101 }],
            rowCount: 1,
          };
        }
        if (sql.includes('UPDATE product_stock')) {
          return { rows: [{ quantity: 4 }], rowCount: 1 }; // 4 < 5
        }
        if (sql.includes('FROM inventory_movements') && sql.includes('quantity_remaining > 0')) {
           return { rows: [{ id: 999, quantity_remaining: 100 }], rowCount: 1 };
        }
        return { rows: [], rowCount: 0 };
      });

      await inventoryService.adjustStock(
        variationId,
        -6,
        'stock_dispatched',
        userId,
        undefined,
        undefined,
        branchId,
      );

      expect(global.fetch).toHaveBeenCalled();
    });

    it('should apply FIFO logic when decreasing stock', async () => {
      mockQuery.mockImplementation(async (sql: string) => {
        if (sql === 'BEGIN' || sql === 'COMMIT') return {};
        if (sql.includes('SELECT ps.quantity')) {
          return {
            rows: [{ stock_quantity: 10, low_stock_threshold: 5, product_id: 101 }],
            rowCount: 1,
          };
        }
        if (sql.includes('UPDATE product_stock')) {
          return { rows: [{ quantity: 0 }], rowCount: 1 };
        }
        if (sql.includes('SELECT id, quantity_remaining')) {
          return {
            rows: [
              { id: 1001, quantity_remaining: 3 },
              { id: 1002, quantity_remaining: 7 },
            ],
            rowCount: 2,
          };
        }
        return { rows: [], rowCount: 0 };
      });

      await inventoryService.adjustStock(
        variationId,
        -10,
        'stock_dispatched',
        userId,
        undefined,
        undefined,
        branchId,
      );

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE inventory_movements SET quantity_remaining'),
        expect.any(Array)
      );
    });

    it('should throw AppError if not enough stock layers for FIFO', async () => {
      mockQuery.mockImplementation(async (sql: string) => {
        if (sql === 'BEGIN' || sql === 'ROLLBACK') return {};
        if (sql.includes('SELECT ps.quantity')) {
          return {
            rows: [{ stock_quantity: 10, low_stock_threshold: 5, product_id: 101 }],
            rowCount: 1,
          };
        }
        if (sql.includes('UPDATE product_stock')) {
          return { rows: [{ quantity: 0 }], rowCount: 1 };
        }
        if (sql.includes('SELECT id, quantity_remaining')) {
          return {
            rows: [{ id: 1001, quantity_remaining: 5 }], // Only 5 available, need 10
            rowCount: 1,
          };
        }
        return { rows: [], rowCount: 0 };
      });

      await expect(
        inventoryService.adjustStock(
          variationId,
          -10, // Need 10
          'stock_dispatched',
          userId,
          undefined,
          undefined,
          branchId,
        ),
      ).rejects.toThrow('Not enough stock layers');
      
      expect(mockQuery).toHaveBeenCalledWith('ROLLBACK');
    });

    it('should manage transaction correctly when dbClient is not provided', async () => {
      mockQuery.mockImplementation(async (sql: string) => {
        if (sql === 'BEGIN' || sql === 'COMMIT') return {};
        if (sql.includes('SELECT ps.quantity')) {
          return {
            rows: [{ stock_quantity: 10, low_stock_threshold: 5, product_id: 101 }],
            rowCount: 1,
          };
        }
        if (sql.includes('UPDATE product_stock')) {
          return { rows: [{ quantity: 15 }], rowCount: 1 };
        }
        return { rows: [], rowCount: 0 };
      });

      await inventoryService.adjustStock(variationId, 5, 'stock_received', userId, undefined, 10, branchId);

      expect(mockConnect).toHaveBeenCalled();
      expect(mockQuery).toHaveBeenCalledWith('BEGIN');
      expect(mockQuery).toHaveBeenCalledWith('COMMIT');
    });

    it('should use provided dbClient and not manage transaction', async () => {
      const customMockQuery = vi.fn().mockImplementation(async (sql: string) => {
        if (sql.includes('SELECT ps.quantity')) {
          return {
            rows: [{ stock_quantity: 10, low_stock_threshold: 5, product_id: 101 }],
            rowCount: 1,
          };
        }
        if (sql.includes('UPDATE product_stock')) {
          return { rows: [{ quantity: 15 }], rowCount: 1 };
        }
        return { rows: [], rowCount: 0 };
      });
      const customMockClient = {
        query: customMockQuery,
        release: vi.fn(),
      } as any;

      await inventoryService.adjustStock(variationId, 5, 'stock_received', userId, customMockClient, 10, branchId);

      expect(mockConnect).not.toHaveBeenCalled();
      expect(customMockQuery).not.toHaveBeenCalledWith('BEGIN');
      expect(customMockQuery).not.toHaveBeenCalledWith('COMMIT');
      expect(customMockQuery).toHaveBeenCalledTimes(3); // Select, Update, Insert
    });
  });

  describe('receiveStock', () => {
    const variationId = 1;
    const quantity = 5;
    const unitCost = 10;
    const userId = 'test-user-id';
    const branchId = 1;

    it('should call adjustStock with correct parameters', async () => {
      const adjustStockSpy = vi.spyOn(inventoryService, 'adjustStock');
      // Mock adjustStock to avoid logic
      adjustStockSpy.mockResolvedValueOnce({ quantity: 15 });

      await inventoryService.receiveStock(variationId, quantity, unitCost, userId, undefined, branchId);

      expect(adjustStockSpy).toHaveBeenCalledWith(
        variationId,
        quantity,
        'stock_received',
        userId,
        undefined,
        unitCost
      );
    });

    it('should throw AppError if quantity is not positive', async () => {
      await expect(
        inventoryService.receiveStock(variationId, 0, unitCost, userId, undefined, branchId),
      ).rejects.toThrow('Quantity must be positive');
    });
  });

  describe('dispatchStock', () => {
    const variationId = 1;
    const quantity = 5;
    const userId = 'test-user-id';
    const branchId = 1;

    it('should call adjustStock with correct parameters', async () => {
      const adjustStockSpy = vi.spyOn(inventoryService, 'adjustStock');
      adjustStockSpy.mockResolvedValueOnce({ quantity: 5 });

      await inventoryService.dispatchStock(variationId, quantity, userId, undefined, branchId);

      expect(adjustStockSpy).toHaveBeenCalledWith(
        variationId,
        -quantity,
        'stock_dispatched',
        userId,
        undefined
      );
    });

    it('should throw AppError if quantity is not positive', async () => {
      await expect(
        inventoryService.dispatchStock(variationId, 0, userId, undefined, branchId),
      ).rejects.toThrow('Quantity must be positive');
    });
  });

  describe('getLowStockProducts', () => {
    it('should return products below threshold', async () => {
      const mockLowStockProducts = [
        { product_id: 1, name: 'Product A', stock_quantity: 3, low_stock_threshold: 5 },
      ];
      
      mockQuery.mockImplementation(async (sql: string) => {
        // Se o método existir e fizer SELECT, vai cair aqui
        if (sql.toLowerCase().includes('select')) { 
             return { rows: mockLowStockProducts, rowCount: 1 };
        }
        return { rows: mockLowStockProducts, rowCount: 1 }; 
      });

      const result = await inventoryService.getLowStockProducts(5);
      expect(result).toEqual(mockLowStockProducts);
    });
  });

  describe('getInventoryDiscrepancies', () => {
    const branchId = 1;
    it('should return inventory discrepancies', async () => {
      const mockDiscrepancies = [{ product_name: 'Produto X', discrepancy: -2 }];
      mockQuery.mockResolvedValueOnce({ rows: mockDiscrepancies, rowCount: 1 });

      const result = await inventoryService.getInventoryDiscrepancies(branchId);
      expect(result).toEqual(mockDiscrepancies);
    });
  });

  describe('suggestPurchaseOrders', () => {
    const branchId = 1;
    it('should suggest purchase orders', async () => {
      const mockProducts = [
        {
          product_id: 1,
          product_name: 'Product A',
          variation_id: 101,
          variation_color: 'Red',
          current_stock: 3,
          low_stock_threshold: 5,
          reorder_point: 5,
          lead_time_days: 7,
        },
      ];
      mockQuery.mockResolvedValueOnce({ rows: mockProducts, rowCount: 1 });
      vi.mocked(demandPredictionService.predictDemand).mockResolvedValueOnce(20);

      const result = await inventoryService.suggestPurchaseOrders(branchId);

      expect(result).toHaveLength(1);
      expect(result[0].productId).toBe(1);
    });

    it('should return empty array if no products need reorder', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 });

      const result = await inventoryService.suggestPurchaseOrders(branchId);

      expect(result).toEqual([]);
    });
  });
});