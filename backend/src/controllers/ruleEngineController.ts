import { Request, Response, NextFunction } from 'express';
import { ruleEngineService } from '../services/ruleEngineService.js';
import { AppError } from '../utils/errors.js';

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
