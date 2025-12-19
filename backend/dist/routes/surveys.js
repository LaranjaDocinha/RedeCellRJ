import { Router } from 'express';
import { z } from 'zod';
import { surveyService } from '../services/surveyService.js';
import { ValidationError } from '../utils/errors.js';
const surveysRouter = Router();
// Zod Schema for survey response
const surveyResponseSchema = z.object({
    token: z.string().nonempty('Token is required'),
    score: z.number().int().min(1).max(10, 'Score must be between 1 and 10'),
    comment: z.string().trim().optional(),
});
// Validation Middleware
const validate = (schema) => (req, res, next) => {
    try {
        schema.parse(req.body);
        next();
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            return next(new ValidationError('Validation failed', error.errors.map((err) => ({ path: err.path.join('.'), message: err.message }))));
        }
        next(error);
    }
};
// This is a public endpoint for customers to submit their survey responses
surveysRouter.post('/submit', validate(surveyResponseSchema), async (req, res, next) => {
    try {
        const { token, score, comment } = req.body;
        const response = await surveyService.recordSurveyResponse(token, score, comment || '');
        res.status(201).json({ message: 'Thank you for your feedback!', response });
    }
    catch (error) {
        next(error);
    }
});
import { authMiddleware } from '../middlewares/authMiddleware.js';
surveysRouter.get('/results', authMiddleware.authenticate, authMiddleware.authorize('read', 'Report'), async (req, res, next) => {
    try {
        const scores = await surveyService.getSatisfactionScores();
        res.json(scores);
    }
    catch (error) {
        next(error);
    }
});
export default surveysRouter;
