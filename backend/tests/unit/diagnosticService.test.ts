import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getPool } from '../../src/db/index.js';
import { diagnosticService } from '../../src/services/diagnosticService.js';
import { AppError } from '../../src/utils/errors.js';

// Mock the database pool
vi.mock('../../src/db/index.js', () => ({
  getPool: vi.fn(),
}));

describe('DiagnosticService', () => {
  let mockQuery: vi.Mock;

  beforeEach(() => {
    mockQuery = vi.fn();
    (getPool as vi.Mock).mockReturnValue({
      query: mockQuery,
    });
    vi.clearAllMocks();
  });

  describe('getRootNodes', () => {
    it('should return root diagnostic nodes', async () => {
      const mockNodes = [
        {
          id: 'node1',
          question_text: 'Root Q1',
          is_solution: false,
          solution_details: null,
          parent_node_id: null,
        },
      ];
      mockQuery.mockResolvedValueOnce({ rows: mockNodes });

      const result = await diagnosticService.getRootNodes();
      expect(result).toEqual(mockNodes);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining(
          'SELECT id, question_text, is_solution, solution_details, parent_node_id',
        ),
      );
    });

    it('should throw AppError if fetching root nodes fails', async () => {
      mockQuery.mockRejectedValueOnce(new Error('DB error'));
      await expect(diagnosticService.getRootNodes()).rejects.toThrow(AppError);
    });
  });

  describe('getChildNodes', () => {
    it('should return child diagnostic nodes for a given node ID', async () => {
      const nodeId = 'parent-node-id';
      const mockNodes = [{ id: 'child1', question_text: 'Child Q1' }];
      mockQuery.mockResolvedValueOnce({ rows: mockNodes });

      const result = await diagnosticService.getChildNodes(nodeId);
      expect(result).toEqual(mockNodes);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining(
          'SELECT id, question_text, is_solution, solution_details, parent_node_id',
        ),
        [nodeId],
      );
    });

    it('should throw AppError if fetching child nodes fails', async () => {
      mockQuery.mockRejectedValueOnce(new Error('DB error'));
      await expect(diagnosticService.getChildNodes('id')).rejects.toThrow(AppError);
    });
  });

  describe('getNodeOptions', () => {
    it('should return options for a given node ID', async () => {
      const nodeId = 'node-id';
      const mockOptions = [{ id: 'opt1', option_text: 'Option 1' }];
      mockQuery.mockResolvedValueOnce({ rows: mockOptions });

      const result = await diagnosticService.getNodeOptions(nodeId);
      expect(result).toEqual(mockOptions);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('SELECT id, diagnostic_node_id, option_text, next_node_id'),
        [nodeId],
      );
    });

    it('should throw AppError if fetching node options fails', async () => {
      mockQuery.mockRejectedValueOnce(new Error('DB error'));
      await expect(diagnosticService.getNodeOptions('id')).rejects.toThrow(AppError);
    });
  });

  describe('submitFeedback', () => {
    it('should submit feedback successfully', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 1 });
      await diagnosticService.submitFeedback('node-id', 'user-id', true, 'comments');
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO diagnostic_feedback'),
        ['node-id', 'user-id', true, 'comments'],
      );
    });

    it('should submit feedback successfully without user ID and comments', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 1 });
      await diagnosticService.submitFeedback('node-id', undefined, false, undefined);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO diagnostic_feedback'),
        ['node-id', undefined, false, undefined],
      );
    });

    it('should throw AppError if submitting feedback fails', async () => {
      mockQuery.mockRejectedValueOnce(new Error('DB error'));
      await expect(
        diagnosticService.submitFeedback('node-id', 'user-id', true, 'comments'),
      ).rejects.toThrow(AppError);
    });
  });

  describe('recordHistory', () => {
    it('should record history successfully', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 1 });
      await diagnosticService.recordHistory('user-id', 'session-id', 'node-id', 'option-id');
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO diagnostic_history'),
        ['user-id', 'session-id', 'node-id', 'option-id'],
      );
    });

    it('should record history successfully without user ID and selected option ID', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 1 });
      await diagnosticService.recordHistory(undefined, 'session-id', 'node-id', undefined);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO diagnostic_history'),
        [undefined, 'session-id', 'node-id', undefined],
      );
    });

    it('should throw AppError if recording history fails', async () => {
      mockQuery.mockRejectedValueOnce(new Error('DB error'));
      await expect(
        diagnosticService.recordHistory('user-id', 'session-id', 'node-id', 'option-id'),
      ).rejects.toThrow(AppError);
    });
  });
});
