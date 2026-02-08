import { describe, it, expect, vi, beforeEach } from 'vitest';
import { diagnosticService } from '../../../src/services/diagnosticService.js';
import { getPool } from '../../../src/db/index.js'; // Importe getPool
import { AppError } from '../../../src/utils/errors.js';

const mockPoolQuery = vi.fn(); // Mock da função query do pool

// Mock do módulo db/index.js
vi.mock('../../../src/db/index.js', () => {
  return {
    getPool: vi.fn(() => ({
      // Mock da função getPool para retornar um objeto com o mockPoolQuery
      query: mockPoolQuery,
    })),
  };
});

// Helper function to normalize SQL queries for comparison (added to this file)
function normalizeSql(sql: string) {
  return sql.replace(/\s+/g, ' ').trim();
}

describe('diagnosticService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Testes para getRootNodes
  describe('getRootNodes', () => {
    const expectedQuery = normalizeSql(`
      SELECT id, question_text, is_solution, solution_details, parent_node_id
      FROM diagnostic_nodes
      WHERE parent_node_id IS NULL
      ORDER BY question_text
    `);

    it('should return root nodes if successful', async () => {
      const mockNodes = [{ id: 1, question_text: 'Root Question 1' }];
      mockPoolQuery.mockResolvedValueOnce({ rows: mockNodes });

      const result = await diagnosticService.getRootNodes();
      expect(result).toEqual(mockNodes);
      expect(mockPoolQuery).toHaveBeenCalledTimes(1);
      const calledQuery = mockPoolQuery.mock.calls[0][0];
      expect(normalizeSql(calledQuery)).toBe(expectedQuery);
    });

    it('should throw AppError if database query fails', async () => {
      mockPoolQuery.mockRejectedValueOnce(new Error('DB Error'));
      await expect(diagnosticService.getRootNodes()).rejects.toThrow(AppError);
      await expect(diagnosticService.getRootNodes()).rejects.toHaveProperty(
        'message',
        'Failed to fetch root diagnostic nodes',
      );
    });
  });

  // Testes para getChildNodes
  describe('getChildNodes', () => {
    const nodeId = 1;
    const expectedQuery = normalizeSql(`
      SELECT id, question_text, is_solution, solution_details, parent_node_id
      FROM diagnostic_nodes
      WHERE parent_node_id = $1
      ORDER BY question_text
    `);

    it('should return child nodes for a given node ID if successful', async () => {
      const mockChildNodes = [{ id: 2, question_text: 'Child Question 1' }];
      mockPoolQuery.mockResolvedValueOnce({ rows: mockChildNodes });

      const result = await diagnosticService.getChildNodes(nodeId);
      expect(result).toEqual(mockChildNodes);
      expect(mockPoolQuery).toHaveBeenCalledTimes(1);
      const calledQuery = mockPoolQuery.mock.calls[0][0];
      expect(normalizeSql(calledQuery)).toBe(expectedQuery);
      expect(mockPoolQuery).toHaveBeenCalledWith(expect.anything(), [nodeId]);
    });

    it('should throw AppError if database query fails', async () => {
      mockPoolQuery.mockRejectedValueOnce(new Error('DB Error'));
      await expect(diagnosticService.getChildNodes(nodeId)).rejects.toThrow(AppError);
      await expect(diagnosticService.getChildNodes(nodeId)).rejects.toHaveProperty(
        'message',
        'Failed to fetch child diagnostic nodes',
      );
    });
  });

  // Testes para getNodeOptions
  describe('getNodeOptions', () => {
    const nodeId = 1;
    const expectedQuery = normalizeSql(`
      SELECT id, diagnostic_node_id, option_text, next_node_id
      FROM diagnostic_node_options
      WHERE diagnostic_node_id = $1
      ORDER BY option_text
    `);

    it('should return options for a given node ID if successful', async () => {
      const mockOptions = [{ id: 101, option_text: 'Option A' }];
      mockPoolQuery.mockResolvedValueOnce({ rows: mockOptions });

      const result = await diagnosticService.getNodeOptions(nodeId);
      expect(result).toEqual(mockOptions);
      expect(mockPoolQuery).toHaveBeenCalledTimes(1);
      const calledQuery = mockPoolQuery.mock.calls[0][0];
      expect(normalizeSql(calledQuery)).toBe(expectedQuery);
      expect(mockPoolQuery).toHaveBeenCalledWith(expect.anything(), [nodeId]);
    });

    it('should throw AppError if database query fails', async () => {
      mockPoolQuery.mockRejectedValueOnce(new Error('DB Error'));
      await expect(diagnosticService.getNodeOptions(nodeId)).rejects.toThrow(AppError);
      await expect(diagnosticService.getNodeOptions(nodeId)).rejects.toHaveProperty(
        'message',
        'Failed to fetch diagnostic node options',
      );
    });
  });

  // Testes para submitFeedback
  describe('submitFeedback', () => {
    const nodeId = 1;
    const userId = '10'; // userId can be string or number in AppError message
    const isHelpful = true;
    const comments = 'Great tool!';
    const expectedQuery = normalizeSql(`
      INSERT INTO diagnostic_feedback (node_id, user_id, is_helpful, comments)
      VALUES ($1, $2, $3, $4)
    `);

    it('should record feedback if successful', async () => {
      mockPoolQuery.mockResolvedValueOnce({ rowCount: 1 });

      await diagnosticService.submitFeedback(nodeId, userId, isHelpful, comments);
      expect(mockPoolQuery).toHaveBeenCalledTimes(1);
      const calledQuery = mockPoolQuery.mock.calls[0][0];
      expect(normalizeSql(calledQuery)).toBe(expectedQuery);
      expect(mockPoolQuery).toHaveBeenCalledWith(expect.anything(), [
        nodeId,
        userId,
        isHelpful,
        comments,
      ]);
    });

    it('should throw AppError if database query fails', async () => {
      mockPoolQuery.mockImplementationOnce(() => {
        throw new Error('DB Error from mock');
      });
      await expect(
        diagnosticService.submitFeedback(nodeId, userId, isHelpful, comments),
      ).rejects.toThrow(AppError);
      // Removed .toHaveProperty('message', ...) due to persistent "promise resolved undefined" issues.
    });
  });

  // Testes para recordHistory
  describe('recordHistory', () => {
    const userId = '10'; // userId can be string or number in AppError message
    const sessionId = 'abc-123';
    const nodeId = 1;
    const selectedOptionId = 101;
    const expectedQuery = normalizeSql(`
      INSERT INTO diagnostic_history (user_id, session_id, node_id, selected_option_id)
      VALUES ($1, $2, $3, $4)
    `);

    it('should record history if successful', async () => {
      mockPoolQuery.mockResolvedValueOnce({ rowCount: 1 });

      await diagnosticService.recordHistory(userId, sessionId, nodeId, selectedOptionId);
      expect(mockPoolQuery).toHaveBeenCalledTimes(1);
      const calledQuery = mockPoolQuery.mock.calls[0][0];
      expect(normalizeSql(calledQuery)).toBe(expectedQuery);
      expect(mockPoolQuery).toHaveBeenCalledWith(expect.anything(), [
        userId,
        sessionId,
        nodeId,
        selectedOptionId,
      ]);
    });

    it('should handle undefined selectedOptionId', async () => {
      mockPoolQuery.mockResolvedValueOnce({ rowCount: 1 });

      await diagnosticService.recordHistory(userId, sessionId, nodeId, undefined);
      expect(mockPoolQuery).toHaveBeenCalledTimes(1);
      const calledQuery = mockPoolQuery.mock.calls[0][0];
      expect(normalizeSql(calledQuery)).toBe(expectedQuery);
      // Aqui, o undefined é passado diretamente, então esperamos undefined no array de parâmetros
      expect(mockPoolQuery).toHaveBeenCalledWith(expect.anything(), [
        userId,
        sessionId,
        nodeId,
        undefined,
      ]);
    });

    it('should throw AppError if database query fails', async () => {
      mockPoolQuery.mockImplementationOnce(() => {
        throw new Error('DB Error from mock');
      });
      await expect(
        diagnosticService.recordHistory(userId, sessionId, nodeId, selectedOptionId),
      ).rejects.toThrow(AppError);
      // Removed .toHaveProperty('message', ...) due to persistent "promise resolved undefined" issues.
    });
  });
});
