import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as checklistService from '../../../src/services/checklistService.js';
import pool from '../../../src/db/index.js';

vi.mock('../../../src/db/index.js', () => ({
  default: {
    query: vi.fn(),
    connect: vi.fn(),
  },
}));

describe('ChecklistService', () => {
  const mockClient = {
    query: vi.fn(),
    release: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (pool.connect as any).mockResolvedValue(mockClient);
  });

  describe('CRUD Checklist Templates', () => {
    it('should create a checklist template', async () => {
      (pool.query as any).mockResolvedValue({ rows: [{ id: 1, name: 'Template' }] });
      const result = await checklistService.createChecklistTemplate({ name: 'Template' } as any);
      expect(result.name).toBe('Template');
    });

    it('should get all templates', async () => {
        (pool.query as any).mockResolvedValue({ rows: [{ id: 1 }] });
        const result = await checklistService.getAllChecklistTemplates();
        expect(result).toHaveLength(1);
    });

    it('should get template by ID', async () => {
        (pool.query as any).mockResolvedValue({ rows: [{ id: 1 }] });
        const result = await checklistService.getChecklistTemplateById(1);
        expect(result.id).toBe(1);
    });

    it('should update template', async () => {
        (pool.query as any).mockResolvedValue({ rows: [{ id: 1, name: 'Updated' }] });
        const result = await checklistService.updateChecklistTemplate(1, { name: 'Updated' });
        expect(result.name).toBe('Updated');
    });

    it('should delete template', async () => {
        (pool.query as any).mockResolvedValue({ rowCount: 1 });
        const result = await checklistService.deleteChecklistTemplate(1);
        expect(result).toBe(true);
    });
  });

  describe('CRUD Checklist Template Items', () => {
    it('should create template item', async () => {
        (pool.query as any).mockResolvedValue({ rows: [{ id: 10 }] });
        const result = await checklistService.createChecklistTemplateItem({ template_id: 1, item_text: 'Item' } as any);
        expect(result.id).toBe(10);
    });

    it('should update template item', async () => {
        (pool.query as any).mockResolvedValue({ rows: [{ id: 10, item_text: 'New' }] });
        const result = await checklistService.updateChecklistTemplateItem(10, { item_text: 'New' });
        expect(result.item_text).toBe('New');
    });

    it('should delete template item', async () => {
        (pool.query as any).mockResolvedValue({ rowCount: 1 });
        const result = await checklistService.deleteChecklistTemplateItem(10);
        expect(result).toBe(true);
    });

    it('should get items by template ID', async () => {
        (pool.query as any).mockResolvedValue({ rows: [{ id: 10 }] });
        const result = await checklistService.getChecklistTemplateItemsByTemplateId(1);
        expect(result).toHaveLength(1);
    });

    it('should get template item by ID', async () => {
        (pool.query as any).mockResolvedValue({ rows: [{ id: 10 }] });
        const result = await checklistService.getChecklistTemplateItemById(10);
        expect(result.id).toBe(10);
    });
  });

  describe('Complex Operations', () => {
    it('should get template with items', async () => {
      (pool.query as any)
        .mockResolvedValueOnce({ rows: [{ id: 1, name: 'T1' }] }) // Template
        .mockResolvedValueOnce({ rows: [{ id: 10, item_text: 'I1' }] }); // Items

      const result = await checklistService.getChecklistTemplateWithItems(1);
      expect(result).toEqual({ id: 1, name: 'T1', items: [{ id: 10, item_text: 'I1' }] });
    });

    it('should return null if template with items not found', async () => {
        (pool.query as any).mockResolvedValueOnce({ rows: [] });
        const result = await checklistService.getChecklistTemplateWithItems(999);
        expect(result).toBeNull();
    });

    it('should save checklist answers in a transaction', async () => {
      const answers = [{ template_item_id: 1, answer: 'Yes' }];
      await checklistService.saveChecklistAnswers(100, 1, answers);

      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO service_order_checklist_answers'), expect.any(Array));
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should rollback and throw on error', async () => {
        mockClient.query.mockImplementation(q => {
            if (q === 'BEGIN') return Promise.resolve();
            if (q === 'ROLLBACK') return Promise.resolve();
            return Promise.reject(new Error('Transaction failed'));
        });

        await expect(checklistService.saveChecklistAnswers(1, 1, [{ template_item_id: 1, answer: 'x' }]))
            .rejects.toThrow('Transaction failed');
        
        expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
    });
  });
});