import { Router } from 'express';
import { z } from 'zod';
import { customerCommunicationService } from '../services/customerCommunicationService.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { ValidationError } from '../utils/errors.js';
const customerCommunicationsRouter = Router();
// Zod Schema for creating a communication log
const createCommunicationSchema = z.object({
    customer_id: z.number().int().positive(),
    user_id: z.number().int().positive().optional(),
    channel: z.string().nonempty(),
    direction: z.enum(['inbound', 'outbound']),
    summary: z.string().nonempty(),
    related_to_type: z.string().optional(),
    related_to_id: z.number().int().positive().optional(),
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
customerCommunicationsRouter.use(authMiddleware.authenticate);
// Log a new communication
customerCommunicationsRouter.post('/', authMiddleware.authorize('create', 'Communication'), // Assuming a 'Communication' subject for RBAC
validate(createCommunicationSchema), async (req, res, next) => {
    try {
        // Add the logged-in user's ID to the payload if it's not already there
        const payload = { ...req.body, user_id: req.body.user_id || req.user?.id };
        const communication = await customerCommunicationService.recordCommunication(payload);
        res.status(201).json(communication);
    }
    catch (error) {
        next(error);
    }
});
export default customerCommunicationsRouter;
