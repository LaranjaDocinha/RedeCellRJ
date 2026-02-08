import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validationMiddleware.js';
import * as ruleEngineController from '../controllers/ruleEngineController.js';
import { z } from 'zod'; // For rule schema definition

const rulesRouter = Router();

rulesRouter.use(authMiddleware.authenticate); // All rule routes require authentication

// Schemas for validation (copied from controller for explicit route validation)
const conditionSchema = z.object({
  fact: z.string().min(1, 'Fact is required'),
  operator: z.enum([
    'equal',
    'notEqual',
    'greaterThan',
    'lessThan',
    'greaterThanInclusive',
    'lessThanInclusive',
    'contains',
    'notContains',
  ]),
  value: z.any(),
});

const actionSchema = z.object({
  type: z.string().min(1, 'Action type is required'),
  params: z.record(z.any()),
});

const ruleSchema = z.object({
  id: z.string().min(1, 'Rule ID is required'),
  name: z.string().min(1, 'Rule name is required'),
  description: z.string().optional(),
  eventType: z.string().min(1, 'Event type is required'),
  conditions: z.array(conditionSchema),
  actions: z.array(actionSchema),
  isActive: z.boolean(),
});

// Rule Management
rulesRouter.get('/', authMiddleware.authorize('read', 'Rule'), ruleEngineController.getRules);
rulesRouter.post(
  '/',
  authMiddleware.authorize('create', 'Rule'),
  validate(ruleSchema),
  ruleEngineController.createOrUpdateRule,
);
rulesRouter.put(
  '/:id',
  authMiddleware.authorize('update', 'Rule'),
  validate(ruleSchema),
  ruleEngineController.createOrUpdateRule,
); // Reusing createOrUpdate for PUT
rulesRouter.delete(
  '/:id',
  authMiddleware.authorize('delete', 'Rule'),
  ruleEngineController.deleteRule,
);

// Rule Evaluation
const evaluateSchema = z.object({
  eventType: z.string().min(1, 'Event type is required'),
  facts: z.record(z.any()),
});
rulesRouter.post(
  '/evaluate',
  authMiddleware.authorize('execute', 'Rule'),
  validate(evaluateSchema),
  ruleEngineController.evaluateRules,
);

export default rulesRouter;
