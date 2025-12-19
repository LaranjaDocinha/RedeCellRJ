import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createDbMock } from '../../utils/dbMock.js';
import { AppError } from '../../../src/utils/errors.js';

// Mock do partSupplierService
vi.mock('../../../src/services/partSupplierService.js', () => ({
  partSupplierService: {
    addSupplierToPart: vi.fn(),
    updateSupplierForPart: vi.fn(),
    removeSupplierFromPart: vi.fn(),
    getSuppliersForPart: vi.fn(),
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
import * as partService from '../../../src/services/partService.js';
import { partSupplierService } from '../../../src/services/partSupplierService.js';

describe('PartService', () => {
  let mockQuery: any;
  let mockConnect: any;

  beforeEach(async () => {
    const dbModule = await import('../../../src/db/index.js');
    mockQuery = (dbModule as any)._mockQuery;
    mockConnect = (dbModule as any)._mockConnect;

    vi.clearAllMocks();
    mockQuery.mockResolvedValue({ rows: [], rowCount: 0 }); // Default fallback for query
    mockConnect.mockResolvedValue((dbModule as any)._mockClient); // Default fallback for connect

    // Limpar mocks do partSupplierService
    vi.mocked(partSupplierService.addSupplierToPart).mockClear();
    vi.mocked(partSupplierService.updateSupplierForPart).mockClear();
    vi.mocked(partSupplierService.removeSupplierFromPart).mockClear();
    vi.mocked(partSupplierService.getSuppliersForPart).mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('createPart', () => {
    const partData = {
      name: 'Screen',
      sku: 'SCRN-001',
      description: 'Mobile screen',
      stock_quantity: 10,
    };
    const newPartId = 1;
    const mockNewPart = { id: newPartId, ...partData };

    it('should create a part successfully without suppliers', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [mockNewPart], rowCount: 1 }) // INSERT into parts
        .mockResolvedValueOnce({ rows: [mockNewPart], rowCount: 1 }); // SELECT from getPartById
      
      vi.mocked(partSupplierService.getSuppliersForPart).mockResolvedValueOnce([]);

      const createdPart = await partService.createPart(partData);

      expect(createdPart).toEqual({ ...mockNewPart, suppliers: [] });
      expect(mockQuery).toHaveBeenCalledWith(
        'INSERT INTO parts (name, sku, description, stock_quantity) VALUES ($1, $2, $3, $4) RETURNING *',
        [partData.name, partData.sku, partData.description, partData.stock_quantity],
      );
    });

    it('should create a part and associate suppliers within a transaction', async () => {
      const partDataWithSuppliers = {
        ...partData,
        suppliers: [{ supplier_id: 1, cost: 50, lead_time_days: 5 }],
      };

      mockQuery
        .mockResolvedValueOnce({ rows: [mockNewPart], rowCount: 1 }) // INSERT into parts
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // BEGIN
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // COMMIT
        .mockResolvedValueOnce({ rows: [mockNewPart], rowCount: 1 }); // SELECT from getPartById

      vi.mocked(partSupplierService.addSupplierToPart).mockResolvedValueOnce(undefined as any);
      vi.mocked(partSupplierService.getSuppliersForPart).mockResolvedValueOnce([]); // Mock para a chamada dentro de getPartById

      const createdPart = await partService.createPart(partDataWithSuppliers);

      expect(createdPart).toEqual({ ...mockNewPart, suppliers: [] });
      expect(mockConnect).toHaveBeenCalledTimes(1); // One transaction
      expect(mockQuery).toHaveBeenCalledWith('BEGIN');
      expect(partSupplierService.addSupplierToPart).toHaveBeenCalledWith({
        part_id: newPartId,
        supplier_id: 1,
        cost: 50,
        lead_time_days: 5,
      });
      expect(mockQuery).toHaveBeenCalledWith('COMMIT');
    });

    it('should rollback and delete part if supplier association fails', async () => {
      const partDataWithSuppliers = {
        ...partData,
        suppliers: [{ supplier_id: 1, cost: 50, lead_time_days: 5 }],
      };

      mockQuery
        .mockResolvedValueOnce({ rows: [mockNewPart], rowCount: 1 }) // INSERT into parts
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // BEGIN
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // ROLLBACK
        .mockResolvedValueOnce({ rows: [], rowCount: 1 }); // DELETE part

      vi.mocked(partSupplierService.addSupplierToPart).mockRejectedValueOnce(
        new Error('Supplier DB Error'),
      );

      await expect(partService.createPart(partDataWithSuppliers)).rejects.toThrow(
        'Failed to associate suppliers, rolling back part creation.',
      );
      expect(mockQuery).toHaveBeenCalledWith('ROLLBACK');
      expect(mockQuery).toHaveBeenCalledWith('DELETE FROM parts WHERE id = $1', [newPartId]);
    });

    it('should rethrow original error if AppError occurs during supplier association', async () => {
      const partDataWithSuppliers = {
        ...partData,
        suppliers: [{ supplier_id: 1, cost: 50, lead_time_days: 5 }],
      };

      mockQuery
        .mockResolvedValueOnce({ rows: [mockNewPart], rowCount: 1 }) // INSERT into parts
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // BEGIN
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // ROLLBACK
        .mockResolvedValueOnce({ rows: [], rowCount: 1 }); // DELETE part

      vi.mocked(partSupplierService.addSupplierToPart).mockRejectedValueOnce(
        new AppError('Supplier Not Found', 404),
      );

      await expect(partService.createPart(partDataWithSuppliers)).rejects.toThrow(
        'Failed to associate suppliers, rolling back part creation.',
      );
      expect(mockQuery).toHaveBeenCalledWith('ROLLBACK');
      expect(mockQuery).toHaveBeenCalledWith('DELETE FROM parts WHERE id = $1', [newPartId]);
    });
  });

  describe('getAllParts', () => {
    it('should return all parts with preferred supplier info', async () => {
      const mockParts = [
        {
          id: 1,
          name: 'Part 1',
          sku: 'P1',
          stock_quantity: 5,
          preferred_supplier_id: 10,
          preferred_supplier_name: 'Sup A',
          preferred_supplier_cost: 20,
          supplier_count: 1,
        },
      ];
      mockQuery.mockResolvedValueOnce({ rows: mockParts, rowCount: 1 });

      const parts = await partService.getAllParts();

      expect(parts).toHaveLength(1);
      expect(parts[0].suppliers).toEqual([
        { id: 10, name: 'Sup A', cost: 20, supplier_count: 1 },
      ]);
      
      const sql = mockQuery.mock.calls[0][0];
      expect(sql).toContain('WITH supplier_info AS');
      expect(sql).toContain('COALESCE(ps.supplier_count, 0) as supplier_count');
      expect(sql).toContain('LEFT JOIN preferred_supplier ps ON p.id = ps.part_id');
    });

    it('should return parts without supplier info if no preferred supplier', async () => {
      const mockParts = [
        {
          id: 1,
          name: 'Part 1',
          sku: 'P1',
          stock_quantity: 5,
          preferred_supplier_id: null,
          preferred_supplier_name: null,
          preferred_supplier_cost: null,
          supplier_count: 0,
        },
      ];
      mockQuery.mockResolvedValueOnce({ rows: mockParts, rowCount: 1 });

      const parts = await partService.getAllParts();

      expect(parts).toHaveLength(1);
      expect(parts[0].suppliers).toEqual([]);
    });

    it('should return an empty array if no parts found', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 });

      const parts = await partService.getAllParts();
      expect(parts).toEqual([]);
    });
  });

  describe('getPartById', () => {
    const mockPart = { id: 1, name: 'Part 1', sku: 'P1' };
    const mockSuppliers = [{ id: 10, name: 'Sup A', cost: 20 }];

    it('should return a part by ID with its suppliers', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [mockPart], rowCount: 1 });
      vi.mocked(partSupplierService.getSuppliersForPart).mockResolvedValueOnce(mockSuppliers as any);

      const part = await partService.getPartById(1);

      expect(part).toEqual({ ...mockPart, suppliers: mockSuppliers });
      expect(mockQuery).toHaveBeenCalledWith('SELECT * FROM parts WHERE id = $1', [1]);
      expect(partSupplierService.getSuppliersForPart).toHaveBeenCalledWith(1);
    });

    it('should return null if part not found', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 });

      const part = await partService.getPartById(999);
      expect(part).toBeNull();
      expect(partSupplierService.getSuppliersForPart).not.toHaveBeenCalled();
    });
  });

  describe('updatePart', () => {
    const partId = 1;
    const initialPart = { id: partId, name: 'Old Name', sku: 'OLD-SKU' };
    const updateData = { name: 'New Name', stock_quantity: 20 };
    const mockUpdatedPart = { ...initialPart, ...updateData };
    const mockExistingSuppliers = [{ id: 1, name: 'Sup1', cost: 10, supplier_id: 1 }]; 
    const mockIncomingSuppliers = [
      { supplier_id: 1, cost: 12 }, // Update
      { supplier_id: 2, cost: 15 }, // Add
    ];

    it('should update part details without syncing suppliers if not provided', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // BEGIN
        .mockResolvedValueOnce({ rows: [mockUpdatedPart], rowCount: 1 }) // UPDATE parts
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // COMMIT
        .mockResolvedValueOnce({ rows: [mockUpdatedPart], rowCount: 1 }); // SELECT from getPartById

      vi.mocked(partSupplierService.getSuppliersForPart).mockResolvedValueOnce([]);

      const updatedPart = await partService.updatePart(partId, updateData);

      expect(updatedPart).toEqual({ ...mockUpdatedPart, suppliers: [] });
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE parts SET name = COALESCE($1, name)'),
        [updateData.name, undefined, undefined, updateData.stock_quantity, partId],
      );
    });

    it('should update part details and sync suppliers (add, update, remove)', async () => {
      const partDataWithSuppliers = { ...updateData, suppliers: mockIncomingSuppliers };

      mockQuery
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // BEGIN
        .mockResolvedValueOnce({ rows: [mockUpdatedPart], rowCount: 1 }) // UPDATE parts
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // COMMIT (end of updatePart)
        .mockResolvedValueOnce({ rows: [mockUpdatedPart], rowCount: 1 }); // SELECT from getPartById

      // Mocks for partSupplierService calls
      vi.mocked(partSupplierService.getSuppliersForPart)
        .mockResolvedValueOnce(mockExistingSuppliers as any) // For sync logic
        .mockResolvedValueOnce([]); // For getPartById result

      vi.mocked(partSupplierService.addSupplierToPart).mockResolvedValueOnce(undefined as any);
      vi.mocked(partSupplierService.updateSupplierForPart).mockResolvedValueOnce(undefined as any);
      vi.mocked(partSupplierService.removeSupplierFromPart).mockResolvedValueOnce(true);

      await partService.updatePart(partId, partDataWithSuppliers);

      // Verify supplier sync calls
      expect(partSupplierService.getSuppliersForPart).toHaveBeenCalledWith(partId);
      expect(partSupplierService.addSupplierToPart).toHaveBeenCalledWith({
        part_id: partId,
        supplier_id: 2,
        cost: 15,
      });
      expect(partSupplierService.updateSupplierForPart).toHaveBeenCalledWith(
        partId,
        1, // existing supplier_id
        { supplier_id: 1, cost: 12 },
      );
      expect(partSupplierService.removeSupplierFromPart).not.toHaveBeenCalled(); // No supplier to remove in this specific scenario
    });

    it('should throw AppError if part not found during core update', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // BEGIN
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }); // UPDATE parts (no rows affected)

      await expect(partService.updatePart(partId, updateData)).rejects.toThrow(
        new AppError('Part not found', 404),
      );
      expect(mockQuery).toHaveBeenCalledWith('ROLLBACK');
    });

    it('should rollback transaction if supplier sync fails', async () => {
      const partDataWithSuppliers = { ...updateData, suppliers: mockIncomingSuppliers };

      mockQuery
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // BEGIN
        .mockResolvedValueOnce({ rows: [mockUpdatedPart], rowCount: 1 }); // UPDATE parts

      vi.mocked(partSupplierService.getSuppliersForPart).mockResolvedValueOnce(mockExistingSuppliers as any);
      vi.mocked(partSupplierService.addSupplierToPart).mockRejectedValueOnce(
        new Error('Supplier add failed'),
      ); // Simulate supplier sync failure

      await expect(partService.updatePart(partId, partDataWithSuppliers)).rejects.toThrow(
        'Supplier add failed',
      );
      expect(mockQuery).toHaveBeenCalledWith('ROLLBACK');
    });
  });

  describe('deletePart', () => {
    it('should delete a part successfully', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 1 }); // DELETE from parts

      const isDeleted = await partService.deletePart(1);
      expect(isDeleted).toBe(true);
      expect(mockQuery).toHaveBeenCalledWith('DELETE FROM parts WHERE id = $1', [1]);
    });

    it('should return false if part not found for deletion', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 }); // DELETE from parts

      const isDeleted = await partService.deletePart(999);
      expect(isDeleted).toBe(false);
    });
  });

  describe('searchParts', () => {
    const mockParts = [
      {
        id: 1,
        name: 'Part 1',
        sku: 'P1',
        stock_quantity: 5,
        preferred_supplier_id: 10,
        preferred_supplier_name: 'Sup A',
        preferred_supplier_cost: 20,
      },
    ];

    it('should search parts by searchTerm', async () => {
      mockQuery.mockResolvedValueOnce({ rows: mockParts, rowCount: 1 });

      const parts = await partService.searchParts('Part');
      expect(parts).toHaveLength(1);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('(p.name ILIKE $1 OR p.description ILIKE $1)'),
        ['%Part%'],
      );
    });

    it('should search parts by barcode', async () => {
      mockQuery.mockResolvedValueOnce({ rows: mockParts, rowCount: 1 });

      const parts = await partService.searchParts(undefined, '12345');
      expect(parts).toHaveLength(1);
      expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining('p.barcode = $1'), ['12345']);
    });

    it('should search parts by sku', async () => {
      mockQuery.mockResolvedValueOnce({ rows: mockParts, rowCount: 1 });

      const parts = await partService.searchParts(undefined, undefined, 'SKU');
      expect(parts).toHaveLength(1);
      expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining('p.sku ILIKE $1'), ['%SKU%']);
    });

    it('should combine multiple search criteria', async () => {
      mockQuery.mockResolvedValueOnce({ rows: mockParts, rowCount: 1 });

      const parts = await partService.searchParts('Search', '123', 'COMB-SKU');
      expect(parts).toHaveLength(1);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining(
          'WHERE (p.name ILIKE $1 OR p.description ILIKE $1) AND p.barcode = $2 AND p.sku ILIKE $3',
        ),
        ['%Search%', '123', '%COMB-SKU%'],
      );
    });

    it('should return empty array if no parts found', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 });

      const parts = await partService.searchParts('NonExistent');
      expect(parts).toEqual([]);
    });
  });
});
