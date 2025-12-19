import { Request, Response, NextFunction } from 'express';
import * as leadService from '../services/leadService.js';
import { z } from 'zod';
import { validate } from '../middlewares/validationMiddleware.js'; // Assuming validationMiddleware exists
import { AppError } from '../utils/errors.js'; // Assuming AppError exists

// Zod Schemas for validation
const createLeadSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email format'),
  phone: z.string().optional(),
  source: z.string().min(1, 'Source is required'),
  assignedTo: z.number().int().positive('Assigned user ID must be a positive integer').optional(),
});

const updateLeadSchema = createLeadSchema.partial().extend({
  status: z.enum(['new', 'contacted', 'qualified', 'unqualified', 'converted']).optional(),
});

const createLeadActivitySchema = z.object({
  activityType: z.enum(['call', 'email', 'meeting', 'note']),
  description: z.string().min(1, 'Description is required'),
  activityDate: z.string().datetime('Invalid date format'),
  userId: z.number().int().positive('User ID must be a positive integer'),
});

// Controllers
export const createLead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const newLead = await leadService.createLead(req.body);
    res.status(201).json(newLead);
  } catch (error) {
    next(error);
  }
};

export const getAllLeads = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const leads = await leadService.getAllLeads();
    res.status(200).json(leads);
  } catch (error) {
    next(error);
  }
};

export const getLeadById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const leadId = parseInt(req.params.id, 10);
    if (isNaN(leadId)) throw new AppError('Invalid Lead ID', 400);
    const lead = await leadService.getLeadById(leadId);
    if (!lead) throw new AppError('Lead not found', 404);
    res.status(200).json(lead);
  } catch (error) {
    next(error);
  }
};

export const updateLead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const leadId = parseInt(req.params.id, 10);
    if (isNaN(leadId)) throw new AppError('Invalid Lead ID', 400);
    const updatedLead = await leadService.updateLead(leadId, req.body);
    if (!updatedLead) throw new AppError('Lead not found', 404);
    res.status(200).json(updatedLead);
  } catch (error) {
    next(error);
  }
};

export const deleteLead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const leadId = parseInt(req.params.id, 10);
    if (isNaN(leadId)) throw new AppError('Invalid Lead ID', 400);
    const deleted = await leadService.deleteLead(leadId);
    if (!deleted) throw new AppError('Lead not found', 404);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const addLeadActivity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const leadId = parseInt(req.params.id, 10);
    if (isNaN(leadId)) throw new AppError('Invalid Lead ID', 400);
    const newActivity = await leadService.addLeadActivity({ ...req.body, leadId });
    res.status(201).json(newActivity);
  } catch (error) {
    next(error);
  }
};

export const getLeadActivities = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const leadId = parseInt(req.params.id, 10);
    if (isNaN(leadId)) throw new AppError('Invalid Lead ID', 400);
    const activities = await leadService.getLeadActivities(leadId);
    res.status(200).json(activities);
  } catch (error) {
    next(error);
  }
};
