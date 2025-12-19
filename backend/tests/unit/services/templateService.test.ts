import { describe, it, expect, vi, beforeEach } from 'vitest';
import { templateService } from '../../../src/services/templateService.js';

// Usando vi.hoisted para garantir que o mock seja criado antes da importação
const mocks = vi.hoisted(() => ({
  query: vi.fn(),
}));

vi.mock('../../../src/db/index.js', () => ({
  default: {
    query: mocks.query,
  },
  __esModule: true,
}));

describe('TemplateService', () => {
  beforeEach(() => {
    mocks.query.mockReset();
  });

  describe('getAllTemplates', () => {
    it('should return all templates', async () => {
      const mockRows = [{ id: '1', name: 'T1' }];
      mocks.query.mockResolvedValueOnce({ rows: mockRows });

      const result = await templateService.getAllTemplates();
      expect(result).toEqual(mockRows);
      expect(mocks.query).toHaveBeenCalledWith(expect.stringContaining('SELECT id, name, type, subject, content FROM templates'));
    });
  });

  describe('getTemplateById', () => {
    it('should return a template by ID', async () => {
      const mockRow = { id: '1', name: 'T1' };
      mocks.query.mockResolvedValueOnce({ rows: [mockRow] });

      const result = await templateService.getTemplateById('1');
      expect(result).toEqual(mockRow);
      expect(mocks.query).toHaveBeenCalledWith(expect.stringContaining('WHERE id = $1'), ['1']);
    });
  });

  describe('getTemplateByName', () => {
    it('should return a template by name', async () => {
      const mockRow = { id: '1', name: 'Welcome' };
      mocks.query.mockResolvedValueOnce({ rows: [mockRow] });

      const result = await templateService.getTemplateByName('Welcome');
      expect(result).toEqual(mockRow);
      expect(mocks.query).toHaveBeenCalledWith(expect.stringContaining('WHERE name = $1'), ['Welcome']);
    });
  });

  describe('createTemplate', () => {
    it('should create a template', async () => {
      const mockRow = { id: '1', name: 'New' };
      mocks.query.mockResolvedValueOnce({ rows: [mockRow] });

      const result = await templateService.createTemplate('New', 'email', 'Sub', 'Content');
      expect(result).toEqual(mockRow);
      expect(mocks.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO templates'),
        ['New', 'email', 'Sub', 'Content']
      );
    });
  });

  describe('updateTemplate', () => {
    it('should update a template', async () => {
      const mockRow = { id: '1', name: 'Updated' };
      mocks.query.mockResolvedValueOnce({ rows: [mockRow] });

      const result = await templateService.updateTemplate('1', 'Updated', 'email', 'Sub', 'Content');
      expect(result).toEqual(mockRow);
      expect(mocks.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE templates SET'),
        ['Updated', 'email', 'Sub', 'Content', '1']
      );
    });
  });

  describe('deleteTemplate', () => {
    it('should delete a template', async () => {
      const mockRow = { id: '1' };
      mocks.query.mockResolvedValueOnce({ rows: [mockRow] });

      const result = await templateService.deleteTemplate('1');
      expect(result).toEqual(mockRow);
      expect(mocks.query).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM templates'),
        ['1']
      );
    });
  });

  describe('renderTemplate', () => {
    it('should replace placeholders with context values', async () => {
      const content = 'Hello {{ name }}, welcome to {{ company }}!';
      const context = { name: 'Alice', company: 'Redecell' };
      
      const result = await templateService.renderTemplate(content, context);
      expect(result).toBe('Hello Alice, welcome to Redecell!');
    });

    it('should handle extra spaces in placeholders', async () => {
      const content = 'Value: {{  val  }}';
      const context = { val: '123' };
      
      const result = await templateService.renderTemplate(content, context);
      expect(result).toBe('Value: 123');
    });
  });
});