import { Request, Response } from 'express';
import { smartPricingService } from '../services/smartPricingService.js';
import { catchAsync } from '../utils/catchAsync.js';
import { AppError } from '../utils/errors.js';

export const pricingRuleController = {
  getAllRules: catchAsync(async (req: Request, res: Response) => {
    const rules = await smartPricingService.getAllPricingRules();
    res.json(rules);
  }),

  getRuleById: catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const rule = await smartPricingService.getPricingRuleById(Number(id));
    if (!rule) {
      throw new AppError('Pricing rule not found', 404);
    }
    res.json(rule);
  }),

  createRule: catchAsync(async (req: Request, res: Response) => {
    const {
      name,
      condition_type,
      condition_value,
      action_type,
      action_value,
      is_active,
      priority,
    } = req.body;
    if (!name || !condition_type || !action_type || action_value === undefined) {
      throw new AppError('Missing required fields', 400);
    }
    const newRule = await smartPricingService.createPricingRule({
      name,
      condition_type,
      condition_value,
      action_type,
      action_value,
      is_active,
      priority,
    });
    res.status(201).json(newRule);
  }),

  updateRule: catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const {
      name,
      condition_type,
      condition_value,
      action_type,
      action_value,
      is_active,
      priority,
    } = req.body;
    const updatedRule = await smartPricingService.updatePricingRule(Number(id), {
      name,
      condition_type,
      condition_value,
      action_type,
      action_value,
      is_active,
      priority,
    });
    res.json(updatedRule);
  }),

  deleteRule: catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    await smartPricingService.deletePricingRule(Number(id));
    res.status(204).send();
  }),
};
