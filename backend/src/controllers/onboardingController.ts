import { Request, Response } from 'express';
import { AppError } from '../utils/errors.js';
import * as onboardingService from '../services/onboardingService.js';

export const getChecklists = async (req: Request, res: Response) => {
  try {
    const checklists = await onboardingService.getChecklists();
    res.json(checklists);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching checklists', error });
  }
};

export const getChecklist = async (req: Request, res: Response) => {
  try {
    const checklist = await onboardingService.getChecklist(parseInt(req.params.id, 10));
    res.json(checklist);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching checklist', error });
  }
};

export const assignChecklist = async (req: Request, res: Response) => {
  try {
    const { userId, checklistId } = req.body;
    await onboardingService.assignChecklistToUser(userId, checklistId);
    res.status(201).send();
  } catch (error) {
    res.status(500).json({ message: 'Error assigning checklist', error });
  }
};

export const getEmployeeProgress = async (req: Request, res: Response) => {
  try {
    const progress = await onboardingService.getEmployeeOnboardingProgress(req.params.userId);
    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching employee progress', error });
  }
};

export const completeItem = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }
    const { itemId } = req.body;
    const updatedItem = await onboardingService.markItemAsComplete(String(userId), itemId);
    res.json(updatedItem);
  } catch (error) {
    res.status(500).json({ message: 'Error completing item', error });
  }
};
