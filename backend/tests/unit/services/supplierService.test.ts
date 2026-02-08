import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supplierService } from '../../../src/services/supplierService.js';
import pool from '../../../src/db/index.js'; // Assuming default export for pool
import { AppError } from '../../../src/utils/errors.js';

// Mock the database pool
vi.mock('../../../src/db/index.js', () => ({
  default: {
    query: vi.fn(),
  },
}));

describe('SupplierService', () => {
  let mockQuery: vi.Mock;

  beforeEach(() => {
    vi.clearAllMocks();
    mockQuery = vi.mocked(pool.query);
  });

  describe('getAllSuppliers', () => {
    it('should return all suppliers', async () => {
      const mockSuppliers = [
        { id: 1, name: 'Supplier A', created_at: new Date(), updated_at: new Date() },
        { id: 2, name: 'Supplier B', created_at: new Date(), updated_at: new Date() },
      ];
      mockQuery.mockResolvedValueOnce({ rows: mockSuppliers });

      const result = await supplierService.getAllSuppliers();

      expect(result).toEqual(mockSuppliers);
      expect(mockQuery).toHaveBeenCalledWith('SELECT * FROM suppliers');
    });

    it('should return an empty array if no suppliers are found', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      const result = await supplierService.getAllSuppliers();

      expect(result).toEqual([]);
      expect(mockQuery).toHaveBeenCalledWith('SELECT * FROM suppliers');
    });
  });

  describe('getSupplierById', () => {
    it('should return a supplier if found', async () => {
      const mockSupplier = {
        id: 1,
        name: 'Supplier A',
        created_at: new Date(),
        updated_at: new Date(),
      };
      mockQuery.mockResolvedValueOnce({ rows: [mockSupplier] });

      const result = await supplierService.getSupplierById(1);

      expect(result).toEqual(mockSupplier);
      expect(mockQuery).toHaveBeenCalledWith('SELECT * FROM suppliers WHERE id = $1', [1]);
    });

    it('should return undefined if supplier is not found', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      const result = await supplierService.getSupplierById(999);

      expect(result).toBeUndefined();
      expect(mockQuery).toHaveBeenCalledWith('SELECT * FROM suppliers WHERE id = $1', [999]);
    });
  });

  describe('createSupplier', () => {
    const createPayload = {
      name: 'New Supplier',
      email: 'new@example.com',
    };

    it('should create a new supplier successfully', async () => {
      const mockNewSupplier = {
        id: 3,
        ...createPayload,
        created_at: new Date(),
        updated_at: new Date(),
      };
      mockQuery.mockResolvedValueOnce({ rows: [mockNewSupplier] });

      const result = await supplierService.createSupplier(createPayload);

      expect(result).toEqual(mockNewSupplier);
      expect(mockQuery).toHaveBeenCalledWith(
        'INSERT INTO suppliers (name, contact_person, email, phone, address) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [createPayload.name, undefined, createPayload.email, undefined, undefined],
      );
    });

    it('should throw AppError for duplicate name', async () => {
      const dbError = new Error(
        'duplicate key value violates unique constraint "suppliers_name_key"',
      );
      (dbError as any).code = '23505';
      (dbError as any).detail = 'Key (name)=(Existing Supplier) already exists.';

      mockQuery.mockRejectedValueOnce(dbError);

      await expect(supplierService.createSupplier(createPayload)).rejects.toThrow(
        new AppError('Supplier with this name already exists', 409),
      );
    });

    it('should throw AppError for duplicate email', async () => {
      const dbError = new Error(
        'duplicate key value violates unique constraint "suppliers_email_key"',
      );
      (dbError as any).code = '23505';
      (dbError as any).detail = 'Key (email)=(existing@example.com) already exists.';

      mockQuery.mockRejectedValueOnce(dbError);

      await expect(supplierService.createSupplier(createPayload)).rejects.toThrow(
        new AppError('Supplier with this email already exists', 409),
      );
    });

    it('should rethrow other database errors', async () => {
      const genericError = new Error('DB Connection Failed');
      mockQuery.mockRejectedValueOnce(genericError);

      await expect(supplierService.createSupplier(createPayload)).rejects.toThrow(genericError);
    });
  });

  describe('updateSupplier', () => {
    const updatePayload = { name: 'Updated Name', phone: '123-456-7890' };
    const supplierId = 1;
    const mockExistingSupplier = {
      id: supplierId,
      name: 'Old Name',
      created_at: new Date(),
      updated_at: new Date(),
    };
    const mockUpdatedSupplier = { ...mockExistingSupplier, ...updatePayload };

    it('should update fields successfully', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [mockUpdatedSupplier] }); // The UPDATE query returning *

      const result = await supplierService.updateSupplier(supplierId, updatePayload);

      expect(result).toEqual(mockUpdatedSupplier);
      expect(mockQuery).toHaveBeenCalledWith(
        'UPDATE suppliers SET name = $1, phone = $2, updated_at = current_timestamp WHERE id = $3 RETURNING *',
        [updatePayload.name, updatePayload.phone, supplierId],
      );
    });

    it('should return existing supplier if no fields to update', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [mockExistingSupplier] }); // For getSupplierById call

      const result = await supplierService.updateSupplier(supplierId, {});

      expect(result).toEqual(mockExistingSupplier);
      expect(mockQuery).toHaveBeenCalledWith('SELECT * FROM suppliers WHERE id = $1', [supplierId]); // getSupplierById call
      expect(mockQuery).not.toHaveBeenCalledWith(expect.stringContaining('UPDATE'));
    });

    it('should return undefined if supplier not found when no fields to update', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] }); // For getSupplierById call

      const result = await supplierService.updateSupplier(999, {});

      expect(result).toBeUndefined();
      expect(mockQuery).toHaveBeenCalledWith('SELECT * FROM suppliers WHERE id = $1', [999]); // getSupplierById call
      expect(mockQuery).not.toHaveBeenCalledWith(expect.stringContaining('UPDATE'));
    });

    it('should throw AppError for duplicate name on update', async () => {
      const dbError = new Error(
        'duplicate key value violates unique constraint "suppliers_name_key"',
      );
      (dbError as any).code = '23505';
      (dbError as any).detail = 'Key (name)=(Existing Supplier) already exists.';

      mockQuery.mockRejectedValueOnce(dbError);

      await expect(
        supplierService.updateSupplier(supplierId, { name: 'Existing Supplier' }),
      ).rejects.toThrow(new AppError('Supplier with this name already exists', 409));
    });

    it('should rethrow other database errors on update', async () => {
      const genericError = new Error('DB Connection Failed');
      mockQuery.mockRejectedValueOnce(genericError);

      await expect(supplierService.updateSupplier(supplierId, updatePayload)).rejects.toThrow(
        genericError,
      );
    });

    it('should return undefined if supplier not found for update (and fields provided)', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] }); // Simulating that update returns no rows

      const result = await supplierService.updateSupplier(999, { name: 'Non Existent' });

      expect(result).toBeUndefined();
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE suppliers SET name = $1'),
        ['Non Existent', 999],
      );
    });
  });

  describe('deleteSupplier', () => {
    it('should return true if supplier deleted', async () => {
      mockQuery.mockResolvedValueOnce({ rowCount: 1 });

      const result = await supplierService.deleteSupplier(1);

      expect(result).toBe(true);
      expect(mockQuery).toHaveBeenCalledWith('DELETE FROM suppliers WHERE id = $1 RETURNING id', [
        1,
      ]);
    });

    it('should return false if no supplier deleted', async () => {
      mockQuery.mockResolvedValueOnce({ rowCount: 0 });

      const result = await supplierService.deleteSupplier(999);

      expect(result).toBe(false);
      expect(mockQuery).toHaveBeenCalledWith('DELETE FROM suppliers WHERE id = $1 RETURNING id', [
        999,
      ]);
    });
  });
});
