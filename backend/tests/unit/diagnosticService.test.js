import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getPool } from '../../src/db/index.js';
import { diagnosticService } from '../../src/services/diagnosticService.js';
import { AppError } from '../../src/utils/errors.js';
// Mock the database pool
vi.mock('../../src/db/index.js', () => ({
    getPool: vi.fn(),
}));
describe('DiagnosticService', () => {
    let mockQuery;
    beforeEach(() => {
        mockQuery = vi.fn();
        getPool.mockReturnValue({
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
                {
                    id: 'node2',
                    question_text: 'Root Q2',
                    is_solution: false,
                    solution_details: null,
                    parent_node_id: null,
                },
            ];
            mockQuery.mockResolvedValueOnce({ rows: mockNodes });
            const result = await diagnosticService.getRootNodes();
            expect(result).toEqual(mockNodes);
            expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining('SELECT id, question_text, is_solution, solution_details, parent_node_id FROM diagnostic_nodes WHERE parent_node_id IS NULL ORDER BY question_text'));
        });
        it('should throw AppError if fetching root nodes fails', async () => {
            mockQuery.mockRejectedValueOnce(new Error('DB error'));
            await expect(diagnosticService.getRootNodes()).rejects.toThrow(AppError);
        });
    });
    describe('getChildNodes', () => {
        it('should return child diagnostic nodes for a given node ID', async () => {
            const nodeId = 'parent-node-id';
            const mockNodes = [
                {
                    id: 'child1',
                    question_text: 'Child Q1',
                    is_solution: false,
                    solution_details: null,
                    parent_node_id: nodeId,
                },
            ];
            mockQuery.mockResolvedValueOnce({ rows: mockNodes });
            const result = await diagnosticService.getChildNodes(nodeId);
            expect(result).toEqual(mockNodes);
            expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining('SELECT id, question_text, is_solution, solution_details, parent_node_id FROM diagnostic_nodes WHERE parent_node_id = $1 ORDER BY question_text'), [nodeId]);
        });
        it('should throw AppError if fetching child nodes fails', async () => {
            const nodeId = 'parent-node-id';
            mockQuery.mockRejectedValueOnce(new Error('DB error'));
            await expect(diagnosticService.getChildNodes(nodeId)).rejects.toThrow(AppError);
        });
    });
    describe('getNodeOptions', () => {
        it('should return options for a given node ID', async () => {
            const nodeId = 'node-id';
            const mockOptions = [
                { id: 'opt1', diagnostic_node_id: nodeId, option_text: 'Option 1', next_node_id: 'next1' },
            ];
            mockQuery.mockResolvedValueOnce({ rows: mockOptions });
            const result = await diagnosticService.getNodeOptions(nodeId);
            expect(result).toEqual(mockOptions);
            expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining('SELECT id, diagnostic_node_id, option_text, next_node_id FROM diagnostic_node_options WHERE diagnostic_node_id = $1 ORDER BY option_text'), [nodeId]);
        });
        it('should throw AppError if fetching node options fails', async () => {
            const nodeId = 'node-id';
            mockQuery.mockRejectedValueOnce(new Error('DB error'));
            await expect(diagnosticService.getNodeOptions(nodeId)).rejects.toThrow(AppError);
        });
    });
    describe('submitFeedback', () => {
        it('should submit feedback successfully', async () => {
            const nodeId = 'node-id';
            const userId = 'user-id';
            const isHelpful = true;
            const comments = 'Great solution!';
            mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 1 });
            await diagnosticService.submitFeedback(nodeId, userId, isHelpful, comments);
            expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO diagnostic_feedback (node_id, user_id, is_helpful, comments) VALUES ($1, $2, $3, $4)'), [nodeId, userId, isHelpful, comments]);
        });
        it('should submit feedback successfully without user ID and comments', async () => {
            const nodeId = 'node-id';
            const isHelpful = false;
            mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 1 });
            await diagnosticService.submitFeedback(nodeId, undefined, isHelpful, undefined);
            expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO diagnostic_feedback (node_id, user_id, is_helpful, comments) VALUES ($1, $2, $3, $4)'), [nodeId, undefined, isHelpful, undefined]);
        });
        it('should throw AppError if submitting feedback fails', async () => {
            mockQuery.mockRejectedValueOnce(new Error('DB error'));
            await expect(diagnosticService.submitFeedback('node-id', 'user-id', true, 'comments')).rejects.toThrow(AppError);
        });
    });
    describe('recordHistory', () => {
        it('should record history successfully', async () => {
            const userId = 'user-id';
            const sessionId = 'session-id';
            const nodeId = 'node-id';
            const selectedOptionId = 'option-id';
            mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 1 });
            await diagnosticService.recordHistory(userId, sessionId, nodeId, selectedOptionId);
            expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO diagnostic_history (user_id, session_id, node_id, selected_option_id) VALUES ($1, $2, $3, $4)'), [userId, sessionId, nodeId, selectedOptionId]);
        });
        it('should record history successfully without user ID and selected option ID', async () => {
            const sessionId = 'session-id';
            const nodeId = 'node-id';
            mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 1 });
            await diagnosticService.recordHistory(undefined, sessionId, nodeId, undefined);
            expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO diagnostic_history (user_id, session_id, node_id, selected_option_id) VALUES ($1, $2, $3, $4)'), [undefined, sessionId, nodeId, undefined]);
        });
        it('should throw AppError if recording history fails', async () => {
            mockQuery.mockRejectedValueOnce(new Error('DB error'));
            await expect(diagnosticService.recordHistory('user-id', 'session-id', 'node-id', 'option-id')).rejects.toThrow(AppError);
        });
    });
});
