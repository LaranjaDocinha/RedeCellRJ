import { describe, it, expect, vi, beforeEach } from 'vitest';
import httpStatus from 'http-status';
import { getRootNodes, getChildNodes, getNodeOptions, submitFeedback, recordHistory, } from '../../src/controllers/diagnosticController.js';
import { diagnosticService } from '../../src/services/diagnosticService.js';
import { AppError } from '../../src/utils/errors.js';
// Mock diagnosticService
vi.mock('../../src/services/diagnosticService.js', () => ({
    diagnosticService: {
        getRootNodes: vi.fn(),
        getChildNodes: vi.fn(),
        getNodeOptions: vi.fn(),
        submitFeedback: vi.fn(),
        recordHistory: vi.fn(),
    },
}));
describe('DiagnosticController', () => {
    let mockRequest;
    let mockResponse;
    let mockNext;
    beforeEach(() => {
        mockRequest = {};
        mockResponse = {
            status: vi.fn().mockReturnThis(),
            send: vi.fn(),
        };
        mockNext = vi.fn();
        vi.clearAllMocks();
    });
    describe('getRootNodes', () => {
        it('should return root nodes with status 200', async () => {
            const mockNodes = [{ id: 'node1', question_text: 'Root Q1' }];
            diagnosticService.getRootNodes.mockResolvedValueOnce(mockNodes);
            await getRootNodes(mockRequest, mockResponse, mockNext);
            expect(diagnosticService.getRootNodes).toHaveBeenCalled();
            expect(mockResponse.status).toHaveBeenCalledWith(httpStatus.OK);
            expect(mockResponse.send).toHaveBeenCalledWith(mockNodes);
            expect(mockNext).not.toHaveBeenCalled();
        });
        it('should call next with AppError if service throws an error', async () => {
            const error = new AppError('Failed to fetch', 500);
            diagnosticService.getRootNodes.mockRejectedValueOnce(error);
            await getRootNodes(mockRequest, mockResponse, mockNext);
            expect(diagnosticService.getRootNodes).toHaveBeenCalled();
            expect(mockNext).toHaveBeenCalledWith(error);
            expect(mockResponse.status).not.toHaveBeenCalled();
            expect(mockResponse.send).not.toHaveBeenCalled();
        });
    });
    describe('getChildNodes', () => {
        it('should return child nodes with status 200', async () => {
            const nodeId = 'valid-uuid-123';
            mockRequest.params = { nodeId };
            const mockNodes = [{ id: 'child1', question_text: 'Child Q1' }];
            diagnosticService.getChildNodes.mockResolvedValueOnce(mockNodes);
            await getChildNodes(mockRequest, mockResponse, mockNext);
            expect(diagnosticService.getChildNodes).toHaveBeenCalledWith(nodeId);
            expect(mockResponse.status).toHaveBeenCalledWith(httpStatus.OK);
            expect(mockResponse.send).toHaveBeenCalledWith(mockNodes);
            expect(mockNext).not.toHaveBeenCalled();
        });
        it('should call next with AppError if service throws an error', async () => {
            const nodeId = 'valid-uuid-123';
            mockRequest.params = { nodeId };
            const error = new AppError('Failed to fetch', 500);
            diagnosticService.getChildNodes.mockRejectedValueOnce(error);
            await getChildNodes(mockRequest, mockResponse, mockNext);
            expect(diagnosticService.getChildNodes).toHaveBeenCalledWith(nodeId);
            expect(mockNext).toHaveBeenCalledWith(error);
        });
    });
    describe('getNodeOptions', () => {
        it('should return node options with status 200', async () => {
            const nodeId = 'valid-uuid-123';
            mockRequest.params = { nodeId };
            const mockOptions = [{ id: 'opt1', option_text: 'Option 1' }];
            diagnosticService.getNodeOptions.mockResolvedValueOnce(mockOptions);
            await getNodeOptions(mockRequest, mockResponse, mockNext);
            expect(diagnosticService.getNodeOptions).toHaveBeenCalledWith(nodeId);
            expect(mockResponse.status).toHaveBeenCalledWith(httpStatus.OK);
            expect(mockResponse.send).toHaveBeenCalledWith(mockOptions);
            expect(mockNext).not.toHaveBeenCalled();
        });
        it('should call next with AppError if service throws an error', async () => {
            const nodeId = 'valid-uuid-123';
            mockRequest.params = { nodeId };
            const error = new AppError('Failed to fetch', 500);
            diagnosticService.getNodeOptions.mockRejectedValueOnce(error);
            await getNodeOptions(mockRequest, mockResponse, mockNext);
            expect(diagnosticService.getNodeOptions).toHaveBeenCalledWith(nodeId);
            expect(mockNext).toHaveBeenCalledWith(error);
        });
    });
    describe('submitFeedback', () => {
        it('should submit feedback with status 201', async () => {
            const nodeId = 'valid-uuid-123';
            const isHelpful = true;
            const comments = 'Good';
            const userId = 'user-uuid-456';
            mockRequest.body = { nodeId, isHelpful, comments };
            mockRequest.user = { id: userId }; // Mock req.user
            diagnosticService.submitFeedback.mockResolvedValueOnce(undefined);
            await submitFeedback(mockRequest, mockResponse, mockNext);
            expect(diagnosticService.submitFeedback).toHaveBeenCalledWith(nodeId, userId, isHelpful, comments);
            expect(mockResponse.status).toHaveBeenCalledWith(httpStatus.CREATED);
            expect(mockResponse.send).toHaveBeenCalledWith({
                message: 'Feedback submitted successfully',
            });
            expect(mockNext).not.toHaveBeenCalled();
        });
        it('should call next with AppError if service throws an error', async () => {
            const nodeId = 'valid-uuid-123';
            const isHelpful = true;
            mockRequest.body = { nodeId, isHelpful };
            mockRequest.user = { id: 'user-uuid-456' };
            const error = new AppError('Failed to submit', 500);
            diagnosticService.submitFeedback.mockRejectedValueOnce(error);
            await submitFeedback(mockRequest, mockResponse, mockNext);
            expect(diagnosticService.submitFeedback).toHaveBeenCalled();
            expect(mockNext).toHaveBeenCalledWith(error);
        });
    });
    describe('recordHistory', () => {
        it('should record history with status 201', async () => {
            const sessionId = 'session-uuid-789';
            const nodeId = 'valid-uuid-123';
            const selectedOptionId = 'option-uuid-abc';
            const userId = 'user-uuid-456';
            mockRequest.body = { sessionId, nodeId, selectedOptionId };
            mockRequest.user = { id: userId };
            diagnosticService.recordHistory.mockResolvedValueOnce(undefined);
            await recordHistory(mockRequest, mockResponse, mockNext);
            expect(diagnosticService.recordHistory).toHaveBeenCalledWith(userId, sessionId, nodeId, selectedOptionId);
            expect(mockResponse.status).toHaveBeenCalledWith(httpStatus.CREATED);
            expect(mockResponse.send).toHaveBeenCalledWith({
                message: 'Diagnostic history recorded successfully',
            });
            expect(mockNext).not.toHaveBeenCalled();
        });
        it('should call next with AppError if service throws an error', async () => {
            const sessionId = 'session-uuid-789';
            const nodeId = 'valid-uuid-123';
            mockRequest.body = { sessionId, nodeId };
            mockRequest.user = { id: 'user-uuid-456' };
            const error = new AppError('Failed to record', 500);
            diagnosticService.recordHistory.mockRejectedValueOnce(error);
            await recordHistory(mockRequest, mockResponse, mockNext);
            expect(diagnosticService.recordHistory).toHaveBeenCalled();
            expect(mockNext).toHaveBeenCalledWith(error);
        });
    });
});
