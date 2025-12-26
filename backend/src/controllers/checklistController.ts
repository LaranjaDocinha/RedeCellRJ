import { Request, Response } from 'express';
import * as checklistService from '../services/checklistService.js';
import { z } from 'zod';

// Zod validation schemas
export const createChecklistTemplateSchema = z.object({
  name: z.string().min(1, 'Template name is required'),
  description: z.string().optional(),
  entity_type: z.enum(['service_order', 'product', 'customer']).default('service_order'),
});

export const updateChecklistTemplateSchema = z.object({
  name: z.string().min(1, 'Template name is required'),
  description: z.string().optional(),
}).partial();

export const createChecklistTemplateItemSchema = z.object({
  label: z.string().min(1, 'Item label is required'),
  description: z.string().optional(),
  item_type: z.enum(['checkbox', 'text', 'photo', 'signature']).default('checkbox'),
  is_required: z.boolean().default(true),
  order_index: z.number().int().min(0).default(0),
});

export const updateChecklistTemplateItemSchema = z.object({
  label: z.string().min(1, 'Item label is required'),
  description: z.string().optional(),
  item_type: z.enum(['checkbox', 'text', 'photo', 'signature']),
  is_required: z.boolean(),
  order_index: z.number().int().min(0),
}).partial();


export const getTemplate = async (req: Request, res: Response) => {
  try {
    const templateId = parseInt(req.params.id, 10);
    if (isNaN(templateId)) {
      return res.status(400).json({ message: 'ID inválido.' });
    }
    const template = await checklistService.getChecklistTemplateWithItems(templateId);
    if (!template) return res.status(404).json({ message: 'Template not found' });
    res.json(template);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const saveAnswers = async (req: Request, res: Response) => {
  try {
    const serviceOrderId = parseInt(req.params.id, 10);
    if (isNaN(serviceOrderId)) {
      return res.status(400).json({ message: 'ID de Ordem de Serviço inválido.' });
    }
    const userId = (req as any).user?.id || 1; // Mock user ID
    const { answers } = req.body;

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ message: 'Invalid answers format' });
    }

    await checklistService.saveChecklistAnswers(serviceOrderId, userId, answers);
    res.status(201).json({ message: 'Checklist saved successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Funções CRUD para checklist_templates
export const createChecklistTemplate = async (req: Request, res: Response) => {
  try {
    const validatedData = createChecklistTemplateSchema.parse(req.body);
    const newTemplate = await checklistService.createChecklistTemplate(validatedData);
    res.status(201).json(newTemplate);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    res.status(500).json({ message: error.message });
  }
};

export const getChecklistTemplateById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'ID inválido.' });
    }
    const template = await checklistService.getChecklistTemplateById(id);
    if (!template) {
      return res.status(404).json({ message: 'Template de checklist não encontrado.' });
    }
    res.status(200).json(template);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllChecklistTemplates = async (req: Request, res: Response) => {
  try {
    const templates = await checklistService.getAllChecklistTemplates();
    res.status(200).json(templates);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateChecklistTemplate = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'ID inválido.' });
    }
    const validatedData = updateChecklistTemplateSchema.parse(req.body);
    const updatedTemplate = await checklistService.updateChecklistTemplate(id, validatedData);
    if (!updatedTemplate) {
      return res.status(404).json({ message: 'Template de checklist não encontrado.' });
    }
    res.status(200).json(updatedTemplate);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    res.status(500).json({ message: error.message });
  }
};

export const deleteChecklistTemplate = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'ID inválido.' });
    }
    const deleted = await checklistService.deleteChecklistTemplate(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Template de checklist não encontrado.' });
    }
    res.status(204).send(); // No Content
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Funções CRUD para checklist_template_items
export const createChecklistTemplateItem = async (req: Request, res: Response) => {
  try {
    const validatedData = createChecklistTemplateItemSchema.parse(req.body);
    const newItem = await checklistService.createChecklistTemplateItem(validatedData);
    res.status(201).json(newItem);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    res.status(500).json({ message: error.message });
  }
};

export const getChecklistTemplateItemById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'ID inválido.' });
    }
    const item = await checklistService.getChecklistTemplateItemById(id);
    if (!item) {
      return res.status(404).json({ message: 'Item de template de checklist não encontrado.' });
    }
    res.status(200).json(item);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getChecklistTemplateItemsByTemplateId = async (req: Request, res: Response) => {
  try {
    const templateId = parseInt(req.params.templateId, 10); // Usar templateId do parâmetro
    if (isNaN(templateId)) {
      return res.status(400).json({ message: 'ID de Template inválido.' });
    }
    const items = await checklistService.getChecklistTemplateItemsByTemplateId(templateId);
    res.status(200).json(items);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateChecklistTemplateItem = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'ID inválido.' });
    }
    const validatedData = updateChecklistTemplateItemSchema.parse(req.body);
    const updatedItem = await checklistService.updateChecklistTemplateItem(id, validatedData);
    if (!updatedItem) {
      return res.status(404).json({ message: 'Item de template de checklist não encontrado.' });
    }
    res.status(200).json(updatedItem);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    res.status(500).json({ message: error.message });
  }
};

export const deleteChecklistTemplateItem = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'ID inválido.' });
    }
    const deleted = await checklistService.deleteChecklistTemplateItem(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Item de template de checklist não encontrado.' });
    }
    res.status(204).send(); // No Content
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
