import * as checklistService from '../services/checklistService.js';
import { z } from 'zod';
// Esquemas de validação com Zod
const createChecklistTemplateSchema = z.object({
    name: z.string().min(1),
    description: z.string().optional().nullable(),
    type: z.enum(['pre-repair', 'post-repair', 'general']).default('general'),
});
const updateChecklistTemplateSchema = z.object({
    name: z.string().min(1).optional(),
    description: z.string().optional().nullable(),
    type: z.enum(['pre-repair', 'post-repair', 'general']).optional(),
});
const createChecklistTemplateItemSchema = z.object({
    template_id: z.number().int(),
    item_text: z.string().min(1),
    response_type: z.enum(['text', 'boolean', 'number']).default('text'),
    order_index: z.number().int().min(0).optional(),
});
const updateChecklistTemplateItemSchema = z.object({
    item_text: z.string().min(1).optional(),
    response_type: z.enum(['text', 'boolean', 'number']).optional(),
    order_index: z.number().int().min(0).optional(),
});
export const getTemplate = async (req, res) => {
    try {
        const templateId = parseInt(req.params.id, 10);
        if (isNaN(templateId)) {
            return res.status(400).json({ message: 'ID inválido.' });
        }
        const template = await checklistService.getChecklistTemplateWithItems(templateId);
        if (!template)
            return res.status(404).json({ message: 'Template not found' });
        res.json(template);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const saveAnswers = async (req, res) => {
    try {
        const serviceOrderId = parseInt(req.params.id, 10);
        if (isNaN(serviceOrderId)) {
            return res.status(400).json({ message: 'ID de Ordem de Serviço inválido.' });
        }
        const userId = req.user?.id || 1; // Mock user ID
        const { answers } = req.body;
        if (!answers || !Array.isArray(answers)) {
            return res.status(400).json({ message: 'Invalid answers format' });
        }
        await checklistService.saveChecklistAnswers(serviceOrderId, userId, answers);
        res.status(201).json({ message: 'Checklist saved successfully' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// Funções CRUD para checklist_templates
export const createChecklistTemplate = async (req, res) => {
    try {
        const validatedData = createChecklistTemplateSchema.parse(req.body);
        const newTemplate = await checklistService.createChecklistTemplate(validatedData);
        res.status(201).json(newTemplate);
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.errors });
        }
        res.status(500).json({ message: error.message });
    }
};
export const getChecklistTemplateById = async (req, res) => {
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
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const getAllChecklistTemplates = async (req, res) => {
    try {
        const templates = await checklistService.getAllChecklistTemplates();
        res.status(200).json(templates);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const updateChecklistTemplate = async (req, res) => {
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
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.errors });
        }
        res.status(500).json({ message: error.message });
    }
};
export const deleteChecklistTemplate = async (req, res) => {
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
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// Funções CRUD para checklist_template_items
export const createChecklistTemplateItem = async (req, res) => {
    try {
        const validatedData = createChecklistTemplateItemSchema.parse(req.body);
        const newItem = await checklistService.createChecklistTemplateItem(validatedData);
        res.status(201).json(newItem);
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.errors });
        }
        res.status(500).json({ message: error.message });
    }
};
export const getChecklistTemplateItemById = async (req, res) => {
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
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const getChecklistTemplateItemsByTemplateId = async (req, res) => {
    try {
        const templateId = parseInt(req.params.templateId, 10); // Usar templateId do parâmetro
        if (isNaN(templateId)) {
            return res.status(400).json({ message: 'ID de Template inválido.' });
        }
        const items = await checklistService.getChecklistTemplateItemsByTemplateId(templateId);
        res.status(200).json(items);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const updateChecklistTemplateItem = async (req, res) => {
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
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.errors });
        }
        res.status(500).json({ message: error.message });
    }
};
export const deleteChecklistTemplateItem = async (req, res) => {
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
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
