import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createDbMock } from '../../utils/dbMock.js';
import { AppError } from '../../../src/utils/errors.js';

// Mocks para serviços externos
vi.mock('../../../src/services/inventoryService.js', () => ({
  inventoryService: {
    adjustStock: vi.fn(),
  },
}));

// Mock do pool do PostgreSQL
vi.mock('../../../src/db/index.js', () => {
  const { mockPool, mockQuery, mockConnect, mockClient } = createDbMock();
  return {
    default: mockPool,
    connect: mockConnect,
    query: mockQuery,
    getPool: () => mockPool,
    _mockQuery: mockQuery,
    _mockConnect: mockConnect,
    _mockClient: mockClient,
    _mockPool: mockPool,
  };
});

// Importar o serviço APÓS os mocks
import { productKitService } from '../../../src/services/productKitService.js';

describe('ProductKitService', () => {
  let mockQuery: any;
  let mockConnect: any;

  beforeEach(async () => {
    const dbModule = await import('../../../src/db/index.js');
    mockQuery = (dbModule as any)._mockQuery;
    mockConnect = (dbModule as any)._mockConnect;

    vi.clearAllMocks();
    mockQuery.mockResolvedValue({ rows: [], rowCount: 0 }); // Default fallback for query
    mockConnect.mockResolvedValue((dbModule as any)._mockClient); // Default fallback for connect

    const inventoryServiceModule = await import('../../../src/services/inventoryService.js');
    vi.mocked(inventoryServiceModule.inventoryService.adjustStock).mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getAllProductKits', () => {
    it('should return all product kits', async () => {
      const mockKits = [{ id: 1, name: 'Kit A' }];
      mockQuery.mockResolvedValueOnce({ rows: mockKits, rowCount: 1 });

      const kits = await productKitService.getAllProductKits();
      expect(kits).toEqual(mockKits);
      expect(mockQuery).toHaveBeenCalledWith('SELECT * FROM product_kits');
    });
  });

  describe('getProductKitById', () => {
    const mockKit = { id: 1, name: 'Kit A', items: [] as any[] };
    const mockItems = [{ product_id: 10, variation_id: 100, quantity: 2 }];

    it('should return a kit by ID with items', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [mockKit], rowCount: 1 }) // SELECT kit
        .mockResolvedValueOnce({ rows: mockItems, rowCount: 1 }); // SELECT items

      const kit = await productKitService.getProductKitById(1);
      expect(kit).toBeDefined();
      expect(kit?.id).toBe(1);
      expect(kit?.items).toEqual(mockItems);
    });

    it('should return undefined if kit not found', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 }); // SELECT kit

      const kit = await productKitService.getProductKitById(999);
      expect(kit).toBeUndefined();
    });
  });

  describe('createProductKit', () => {
    const payload = {
      name: 'New Kit',
      description: 'Desc',
      price: 100,
      is_active: true,
      items: [{ product_id: 1, variation_id: 10, quantity: 1 }],
    };
    const mockCreatedKit = { id: 1, ...payload };

    it('should create a product kit and its items', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // BEGIN
        .mockResolvedValueOnce({ rows: [mockCreatedKit], rowCount: 1 }) // INSERT kit
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // INSERT item
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }); // COMMIT

      const kit = await productKitService.createProductKit(payload);
      expect(kit).toEqual(mockCreatedKit);
      expect(mockQuery).toHaveBeenCalledWith('BEGIN');
      expect(mockQuery).toHaveBeenCalledWith('COMMIT');
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO product_kits'),
        expect.any(Array),
      );
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO product_kit_items'),
        expect.any(Array),
      );
    });

    it('should rollback if creation fails', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // BEGIN
        .mockRejectedValueOnce(new Error('DB Error')); // INSERT kit fails

      await expect(productKitService.createProductKit(payload)).rejects.toThrow('DB Error');
      expect(mockQuery).toHaveBeenCalledWith('ROLLBACK');
    });
  });

  describe('updateProductKit', () => {
    const kitId = 1;
    const updatePayload = { name: 'Updated Kit', price: 150 };
    const mockUpdatedKit = { id: kitId, ...updatePayload, items: [] };

    it('should update a product kit', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // BEGIN
        .mockResolvedValueOnce({ rows: [mockUpdatedKit], rowCount: 1 }) // UPDATE kit
        // getProductKitById calls:
        .mockResolvedValueOnce({ rows: [mockUpdatedKit], rowCount: 1 }) // SELECT kit
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // SELECT items
        // end getProductKitById
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }); // COMMIT

      const kit = await productKitService.updateProductKit(kitId, updatePayload);
      expect(kit).toEqual(expect.objectContaining(updatePayload));
      expect(mockQuery).toHaveBeenCalledWith('COMMIT');
    });

    it('should return the existing kit if no fields are provided in payload', async () => {
        const mockExistingKit = { id: kitId, name: 'Existing Kit', price: 100, items: [] };
        // getProductKitById chama pool.query (duas vezes: kit e itens)
        mockQuery
            .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // BEGIN
            .mockResolvedValueOnce({ rows: [mockExistingKit], rowCount: 1 }) // SELECT kit
            .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // SELECT items
            .mockResolvedValueOnce({ rows: [], rowCount: 0 }); // COMMIT (do updateProductKit, que chama getProductKitById no final)

        const kit = await productKitService.updateProductKit(kitId, {}); // Empty payload
        expect(kit).toEqual(mockExistingKit);
        expect(mockQuery).not.toHaveBeenCalledWith(expect.stringContaining('UPDATE product_kits SET')); // Não deve atualizar
        expect(mockQuery).toHaveBeenCalledWith('COMMIT');
    });

    it('should update kit items if provided', async () => {
      const payloadWithItems = { ...updatePayload, items: [{ product_id: 2, variation_id: 20, quantity: 5 }] };
      
      mockQuery
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // BEGIN
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // UPDATE kit
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // DELETE existing items
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // INSERT new items
        // getProductKitById calls:
        .mockResolvedValueOnce({ rows: [mockUpdatedKit], rowCount: 1 }) // SELECT kit
        .mockResolvedValueOnce({ rows: payloadWithItems.items, rowCount: 1 }) // SELECT items
        // end getProductKitById
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }); // COMMIT

      await productKitService.updateProductKit(kitId, payloadWithItems);
      
      expect(mockQuery).toHaveBeenCalledWith('DELETE FROM product_kit_items WHERE kit_id = $1', [kitId]);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO product_kit_items'),
        expect.any(Array),
      );
    });
  });

  describe('deleteProductKit', () => {
    it('should delete a product kit', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // BEGIN
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // DELETE items
        .mockResolvedValueOnce({ rows: [{ id: 1 }], rowCount: 1 }) // DELETE kit
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }); // COMMIT

      const result = await productKitService.deleteProductKit(1);
      expect(result).toBe(true);
      expect(mockQuery).toHaveBeenCalledWith('DELETE FROM product_kits WHERE id = $1 RETURNING id', [1]);
    });
  });

  describe('kitProducts', () => {
    const kitId = 1;
    const quantity = 2;
    const userId = 'user123';
    const branchId = 1;
    const mockKit = {
      id: kitId,
      name: 'Kit Test',
      items: [{ product_id: 10, variation_id: 100, quantity: 1 }],
    };
    const mockKitNoItems = { ...mockKit, items: [] as any[] };
    const mockKitNullItems = { ...mockKit, items: undefined };

    it('should kit products successfully', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // BEGIN
        // getProductKitById
        .mockResolvedValueOnce({ rows: [mockKit], rowCount: 1 }) // SELECT kit
        .mockResolvedValueOnce({ rows: mockKit.items, rowCount: 1 }) // SELECT items
        // end getProductKitById
        .mockResolvedValueOnce({ rows: [{ stock_quantity: 10 }], rowCount: 1 }) // Check stock
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // UPDATE stock
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }); // COMMIT

      const inventoryServiceModule = await import('../../../src/services/inventoryService.js');
      vi.mocked(inventoryServiceModule.inventoryService.adjustStock).mockResolvedValue({} as any);

      const result = await productKitService.kitProducts(kitId, quantity, userId, branchId);

      expect(result.message).toContain('kitted successfully');
      expect(mockQuery).toHaveBeenCalledWith('COMMIT');
      expect(inventoryServiceModule.inventoryService.adjustStock).toHaveBeenCalledWith(
        100, // variation_id
        -2, // quantity (1 * 2) negated
        'kitting',
        userId,
        expect.anything() // client
      );
    });

    it('should throw error if kit not found', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // BEGIN
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }); // SELECT kit (not found)

      await expect(productKitService.kitProducts(999, quantity, userId, branchId)).rejects.toThrow(
        new AppError('Product kit not found', 404),
      );
      expect(mockQuery).toHaveBeenCalledWith('ROLLBACK');
    });

    it('should throw error if kit has no items defined', async () => {
        mockQuery
            .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // BEGIN
            // getProductKitById - retorna kit sem itens (vazio)
            .mockResolvedValueOnce({ rows: [mockKitNoItems], rowCount: 1 })
            .mockResolvedValueOnce({ rows: mockKitNoItems.items, rowCount: 0 }); // SELECT items para kit no items (empty array)

        await expect(productKitService.kitProducts(kitId, quantity, userId, branchId)).rejects.toThrow(
            new AppError('Product kit has no items defined', 400),
        );
        expect(mockQuery).toHaveBeenCalledWith('ROLLBACK');
    });

    it('should throw error if kit items is undefined', async () => {
        mockQuery
            .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // BEGIN
            // getProductKitById - retorna kit com items undefined
            .mockResolvedValueOnce({ rows: [mockKitNullItems], rowCount: 1 })
            .mockResolvedValueOnce({ rows: [], rowCount: 0 }); // SELECT items returns empty (simulando undefined)

        await expect(productKitService.kitProducts(kitId, quantity, userId, branchId)).rejects.toThrow(
            new AppError('Product kit has no items defined', 400),
        );
        expect(mockQuery).toHaveBeenCalledWith('ROLLBACK');
    });

    it('should throw error if product variation for kit item not found', async () => {
        mockQuery
            .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // BEGIN
            // getProductKitById
            .mockResolvedValueOnce({ rows: [mockKit], rowCount: 1 })
            .mockResolvedValueOnce({ rows: mockKit.items, rowCount: 1 })
            // end getProductKitById
            .mockResolvedValueOnce({ rows: [], rowCount: 0 }); // Check stock (no rows for variation)

        await expect(productKitService.kitProducts(kitId, quantity, userId, branchId)).rejects.toThrow(
            new AppError(`Product variation ${mockKit.items[0].variation_id} not found in branch ${branchId}`, 404),
        );
        expect(mockQuery).toHaveBeenCalledWith('ROLLBACK');
    });

    it('should throw error if insufficient stock', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // BEGIN
        // getProductKitById
        .mockResolvedValueOnce({ rows: [mockKit], rowCount: 1 })
        .mockResolvedValueOnce({ rows: mockKit.items, rowCount: 1 })
        // end getProductKitById
        .mockResolvedValueOnce({ rows: [{ stock_quantity: 1 }], rowCount: 1 }); // Check stock (1 available, need 2)

      await expect(productKitService.kitProducts(kitId, quantity, userId, branchId)).rejects.toThrow(
        'Insufficient stock',
      );
      expect(mockQuery).toHaveBeenCalledWith('ROLLBACK');
    });
  });

  describe('dekitProducts', () => {
    const kitId = 1;
    const quantity = 2;
    const userId = 'user123';
    const branchId = 1;
    const mockKit = {
      id: kitId,
      name: 'Kit Test',
      items: [{ product_id: 10, variation_id: 100, quantity: 1 }],
    };
    const mockKitNoItems = { ...mockKit, items: [] as any[] };
    const mockKitNullItems = { ...mockKit, items: undefined };

    it('should de-kit products successfully', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // BEGIN
        // getProductKitById
        .mockResolvedValueOnce({ rows: [mockKit], rowCount: 1 }) // SELECT kit
        .mockResolvedValueOnce({ rows: mockKit.items, rowCount: 1 }) // SELECT items
        // end getProductKitById
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // UPDATE stock (add back)
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }); // COMMIT

      const inventoryServiceModule = await import('../../../src/services/inventoryService.js');
      vi.mocked(inventoryServiceModule.inventoryService.adjustStock).mockResolvedValue({} as any);

      const result = await productKitService.dekitProducts(kitId, quantity, userId, branchId);

      expect(result.message).toContain('de-kitted successfully');
      expect(mockQuery).toHaveBeenCalledWith('COMMIT');
      expect(inventoryServiceModule.inventoryService.adjustStock).toHaveBeenCalledWith(
        100, // variation_id
        2, // quantity (1 * 2) positive
        'de-kitting',
        userId,
        expect.anything()
      );
    });

    it('should throw error if kit not found', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // BEGIN
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }); // SELECT kit (not found)

      await expect(productKitService.dekitProducts(999, quantity, userId, branchId)).rejects.toThrow(
        new AppError('Product kit not found', 404),
      );
      expect(mockQuery).toHaveBeenCalledWith('ROLLBACK');
    });

    it('should throw error if kit has no items defined', async () => {
        mockQuery
            .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // BEGIN
            // getProductKitById - retorna kit sem itens (vazio)
            .mockResolvedValueOnce({ rows: [mockKitNoItems], rowCount: 1 })
            .mockResolvedValueOnce({ rows: mockKitNoItems.items, rowCount: 0 }); // SELECT items para kit no items (empty array)

        await expect(productKitService.dekitProducts(kitId, quantity, userId, branchId)).rejects.toThrow(
            new AppError('Product kit has no items defined', 400),
        );
        expect(mockQuery).toHaveBeenCalledWith('ROLLBACK');
    });

    it('should throw error if kit items is undefined', async () => {
        mockQuery
            .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // BEGIN
            // getProductKitById - retorna kit com items undefined
            .mockResolvedValueOnce({ rows: [mockKitNullItems], rowCount: 1 })
            .mockResolvedValueOnce({ rows: [], rowCount: 0 }); // SELECT items returns empty (simulando undefined)

        await expect(productKitService.dekitProducts(kitId, quantity, userId, branchId)).rejects.toThrow(
            new AppError('Product kit has no items defined', 400),
        );
        expect(mockQuery).toHaveBeenCalledWith('ROLLBACK');
    });
  });
});
