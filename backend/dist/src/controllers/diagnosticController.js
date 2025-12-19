import httpStatus from 'http-status';
import { diagnosticService } from '../services/diagnosticService.js';
import { catchAsync } from '../utils/catchAsync.js';
import { AppError } from '../utils/errors.js';
import { z } from 'zod';
// Zod Schema for node ID validation (for path params)
export const nodeIdSchema = z.object({
    nodeId: z.string().uuid('Invalid node ID format'),
});
// Zod Schema for submitFeedback (request body)
export const submitFeedbackSchema = z.object({
    nodeId: z.string().uuid('Invalid node ID format'),
    isHelpful: z.boolean(),
    comments: z.string().optional(),
});
// Zod Schema for recordHistory (request body)
export const recordHistorySchema = z.object({
    sessionId: z.string().uuid('Invalid session ID format'),
    nodeId: z.string().uuid('Invalid node ID format'),
    selectedOptionId: z.string().uuid('Invalid option ID format').optional(),
});
// Validation Middleware
export const validate = (schema, type = 'params') => (req, res, next) => {
    try {
        if (type === 'body') {
            schema.parse(req.body);
        }
        else {
            schema.parse(req.params);
        }
        next();
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            return next(new AppError('Validation failed', 400, error.errors.map((err) => ({ path: err.path.join('.'), message: err.message }))));
        }
        next(error);
    }
};
export const getRootNodes = catchAsync(async (req, res) => {
    const nodes = await diagnosticService.getRootNodes();
    res.status(httpStatus.OK).send(nodes);
});
export const getChildNodes = catchAsync(async (req, res) => {
    const { nodeId } = req.params;
    const nodes = await diagnosticService.getChildNodes(nodeId);
    res.status(httpStatus.OK).send(nodes);
});
export const getNodeOptions = catchAsync(async (req, res) => {
    const { nodeId } = req.params;
    const options = await diagnosticService.getNodeOptions(nodeId);
    res.status(httpStatus.OK).send(options);
});
export const submitFeedback = catchAsync(async (req, res) => {
    const { nodeId, isHelpful, comments } = req.body;
    const userId = req.user?.id; // Assuming req.user is populated by auth middleware
    await diagnosticService.submitFeedback(nodeId, userId, isHelpful, comments);
    res.status(httpStatus.CREATED).send({ message: 'Feedback submitted successfully' });
});
export const recordHistory = catchAsync(async (req, res) => {
    const { sessionId, nodeId, selectedOptionId } = req.body;
    const userId = req.user?.id; // Assuming req.user is populated by auth middleware
    await diagnosticService.recordHistory(userId, sessionId, nodeId, selectedOptionId);
    res.status(httpStatus.CREATED).send({ message: 'Diagnostic history recorded successfully' });
});
