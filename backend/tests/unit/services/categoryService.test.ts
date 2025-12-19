import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { categoryService } from '../../../src/services/categoryService';
import { AppError } from '../../../src/utils/errors';
import * as dbModule from '../../../src/db/index';

// Hoisted mocks para o banco de dados
const { mockClientQuery, mockClientConnect, mockGetPool, mockDefaultQuery } = vi.hoisted(() => {
  const query = vi.fn();
  const connect = vi.fn();
  const end = vi.fn();
  const getPool = vi.fn(() => ({
    query: query,
    connect: connect,
    end: end,
  }));
  const defaultQuery = vi.fn();
  return {
    mockClientQuery: query,
    mockClientConnect: connect,
    mockGetPool: getPool,
    mockDefaultQuery: defaultQuery,
  };
});

// Mock do módulo de banco de dados
vi.mock('../../../src/db/index', async (importActual) => {
  const actual = await importActual<typeof dbModule>();
  return {
    ...actual,
    getPool: mockGetPool,
    default: {
      query: mockDefaultQuery,
      connect: mockClientConnect,
      getPool: mockGetPool,
    },
  };
});

describe('CategoryService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDefaultQuery.mockResolvedValue({ rows: [], rowCount: 0 });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getAllCategories', () => {
    it('should return all categories', async () => {
      const mockCategories = [{ id: 1, name: 'Electronics' }, { id: 2, name: 'Books' }];
      mockDefaultQuery.mockResolvedValueOnce({ rows: mockCategories });

      const result = await categoryService.getAllCategories();

      expect(mockDefaultQuery).toHaveBeenCalledWith('SELECT * FROM categories');
      expect(result).toEqual(mockCategories);
    });
  });

  describe('getCategoryById', () => {
    it('should return a category by id', async () => {
      const mockCategory = { id: 1, name: 'Electronics' };
      mockDefaultQuery.mockResolvedValueOnce({ rows: [mockCategory] });

      const result = await categoryService.getCategoryById(1);

      expect(mockDefaultQuery).toHaveBeenCalledWith('SELECT * FROM categories WHERE id = $1', [1]);
      expect(result).toEqual(mockCategory);
    });

    it('should return undefined if category not found', async () => {
      mockDefaultQuery.mockResolvedValueOnce({ rows: [] });

      const result = await categoryService.getCategoryById(999);

      expect(result).toBeUndefined();
    });
  });

  describe('createCategory', () => {
    it('should create a new category', async () => {
      const payload = { name: 'New Category', description: 'Desc' };
      const createdCategory = { id: 1, ...payload };
      mockDefaultQuery.mockResolvedValueOnce({ rows: [createdCategory] });

      const result = await categoryService.createCategory(payload);

      expect(mockDefaultQuery).toHaveBeenCalledWith(
        'INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING *',
        [payload.name, payload.description]
      );
      expect(result).toEqual(createdCategory);
    });

    it('should throw AppError if category name already exists', async () => {
      const payload = { name: 'Duplicate' };
      const error = new Error('Unique violation');
      (error as any).code = '23505';
      mockDefaultQuery.mockImplementationOnce(() => Promise.reject(error));

      const promise = categoryService.createCategory(payload);
      await expect(promise).rejects.toThrow(AppError);
      await expect(promise).rejects.toThrow('Category with this name already exists');
    });

    it('should throw other errors', async () => {
      const payload = { name: 'Error' };
      const error = new Error('DB Error');
      mockDefaultQuery.mockRejectedValueOnce(error);

      await expect(categoryService.createCategory(payload)).rejects.toThrow('DB Error');
    });
  });

  describe('updateCategory', () => {
    it('should update a category', async () => {
      const payload = { name: 'Updated Name' };
      const updatedCategory = { id: 1, name: 'Updated Name', description: 'Old Desc' };
      mockDefaultQuery.mockResolvedValueOnce({ rows: [updatedCategory] });

      const result = await categoryService.updateCategory(1, payload);

      expect(mockDefaultQuery).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE categories SET name = $1, updated_at = current_timestamp WHERE id = $2 RETURNING *'),
        ['Updated Name', 1]
      );
      expect(result).toEqual(updatedCategory);
    });

    it('should return existing category if no fields to update', async () => {
      const existingCategory = { id: 1, name: 'Old Name' };
      // Mock getCategoryById call inside updateCategory
      mockDefaultQuery.mockResolvedValueOnce({ rows: [existingCategory] });

      const result = await categoryService.updateCategory(1, {});

      expect(result).toEqual(existingCategory);
      // update query should NOT be called
      expect(mockDefaultQuery).toHaveBeenCalledTimes(1); // Only select call
    });

    it('should throw AppError if update causes duplicate name', async () => {
      const payload = { name: 'Duplicate' };
      const error = new Error('Duplicate entry');
      (error as any).code = '23505';
      mockDefaultQuery.mockRejectedValueOnce(error);

      await expect(categoryService.updateCategory(1, payload)).rejects.toThrow(AppError);
    });
  });

  describe('deleteCategory', () => {
    it('should return true if category deleted', async () => {
      mockDefaultQuery.mockResolvedValueOnce({ rowCount: 1 });

      const result = await categoryService.deleteCategory(1);

      expect(mockDefaultQuery).toHaveBeenCalledWith('DELETE FROM categories WHERE id = $1 RETURNING id', [1]);
      expect(result).toBe(true);
    });

    it('should return false if category not found', async () => {
      mockDefaultQuery.mockResolvedValueOnce({ rowCount: 0 });

      const result = await categoryService.deleteCategory(999);

      expect(result).toBe(false);
    });
  });
});
