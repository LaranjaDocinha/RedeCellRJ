import { describe, it, expect, vi, beforeEach } from 'vitest';
import { categoryService } from '../../../src/services/categoryService.js';
import pool from '../../../src/db/index.js';
import { AppError } from '../../../src/utils/errors.js';

// Mock do pool do banco de dados
const { mockQuery } = vi.hoisted(() => ({
  mockQuery: vi.fn(),
}));

vi.mock('../../../src/db/index.js', () => ({
  default: {
    query: mockQuery,
  },
}));

describe('CategoryService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAllCategories', () => {
    it('should return all categories', async () => {
      const mockCategories = [{ id: 1, name: 'Category 1' }];
      mockQuery.mockResolvedValueOnce({ rows: mockCategories });

      const result = await categoryService.getAllCategories();
      expect(result).toEqual(mockCategories);
      expect(mockQuery).toHaveBeenCalledWith('SELECT * FROM categories ORDER BY name ASC');
    });
  });

  describe('getCategoryById', () => {
    it('should return a category by id', async () => {
      const mockCategory = { id: 1, name: 'C1' };
      mockQuery.mockResolvedValueOnce({ rows: [mockCategory] });
      const res = await categoryService.getCategoryById(1);
      expect(res).toEqual(mockCategory);
    });
  });

  describe('createCategory', () => {
    it('should create a new category', async () => {
      const payload = { name: 'New Category', description: 'Desc' };
      const mockCreated = { id: 1, ...payload };
      mockQuery.mockResolvedValueOnce({ rows: [mockCreated] });

      const result = await categoryService.createCategory(payload);
      expect(result).toEqual(mockCreated);
      expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO categories'), [
        payload.name,
        payload.description,
        null,
        undefined,
        undefined,
        undefined,
      ]);
    });

    it('should throw AppError if category name already exists', async () => {
      const dbError = new Error('Duplicate');
      (dbError as any).code = '23505';
      mockQuery.mockRejectedValueOnce(dbError);

      await expect(categoryService.createCategory({ name: 'Dup' })).rejects.toThrow(
        'Category with this name or slug already exists',
      );
    });

    it('should rethrow generic errors', async () => {
      mockQuery.mockRejectedValueOnce(new Error('Fail'));
      await expect(categoryService.createCategory({ name: 'E' })).rejects.toThrow('Fail');
    });
  });

  describe('updateCategory', () => {
    it('should update a category with all fields', async () => {
      const mockUpdated = { id: 1, name: 'Updated' };
      mockQuery.mockResolvedValueOnce({ rows: [mockUpdated] });

      const result = await categoryService.updateCategory(1, { 
        name: 'Updated', 
        description: 'D', 
        parent_id: 2, 
        icon: 'I', 
        color: 'C', 
        slug: 'S' 
      });
      expect(result).toEqual(mockUpdated);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('name = $1, description = $2, parent_id = $3, icon = $4, color = $5, slug = $6'),
        ['Updated', 'D', 2, 'I', 'C', 'S', 1]
      );
    });

    it('should throw AppError on unique violation during update', async () => {
      const error = new Error('Dup');
      (error as any).code = '23505';
      mockQuery.mockRejectedValueOnce(error);
      await expect(categoryService.updateCategory(1, { name: 'Exists' })).rejects.toThrow(AppError);
    });

    it('should return existing category if no fields provided', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 1, name: 'Existing' }] });
      const result = await categoryService.updateCategory(1, {});
      expect(result?.name).toBe('Existing');
    });

    it('should return undefined if no fields and category not found', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 });
      const result = await categoryService.updateCategory(1, {});
      expect(result).toBeUndefined();
    });
  });

  describe('deleteCategory', () => {
    it('should return true if deleted', async () => {
      mockQuery.mockResolvedValueOnce({ rowCount: 1 });
      const result = await categoryService.deleteCategory(1);
      expect(result).toBe(true);
    });

    it('should return false if not found', async () => {
      mockQuery.mockResolvedValueOnce({ rowCount: 0 });
      const result = await categoryService.deleteCategory(999);
      expect(result).toBe(false);
    });
  });
});
