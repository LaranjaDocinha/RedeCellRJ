import { Request, Response, NextFunction } from 'express';
import { ruleEngineService } from '../services/ruleEngineService.js';
import { z } from 'zod';
import { validate } from '../middlewares/validationMiddleware.js';
import { AppError } from '../utils/errors.js';

// Zod schemas for validation
const conditionSchema = z.object({
  fact: z.string().min(1, 'Fact is required'),
  operator: z.enum(['equal', 'notEqual', 'greaterThan', 'lessThan', 'greaterThanInclusive', 'lessThanInclusive', 'contains', 'notContains']),
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

export const getRules = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rules = await ruleEngineService.getRules();
    res.status(200).json(rules);
  } catch (error) {
    next(error);
  }
};

export const createOrUpdateRule = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rule = req.body;
    const newOrUpdatedRule = await ruleEngineService.createOrUpdateRule(rule);
    res.status(200).json(newOrUpdatedRule);
  } catch (error) {
    next(error);
  }
};

export const deleteRule = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const deleted = await ruleEngineService.deleteRule(id);
    if (!deleted) throw new AppError('Rule not found', 404);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const evaluateRules = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { eventType, facts } = req.body;
    if (!eventType || !facts) {
      return res.status(400).json({ message: 'eventType and facts are required' });
    }
    const actions = await ruleEngineService.evaluate(eventType, facts);
    res.status(200).json(actions);
  } catch (error) {
    next(error);
  }
};
