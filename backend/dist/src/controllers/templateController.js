import { templateService } from '../services/templateService.js'; // Importar o serviço
export const createTemplate = async (req, res, next) => {
    try {
        const { name, type, subject, content } = req.body; // Incluir subject
        const template = await templateService.createTemplate(name, type, subject, content);
        res.status(201).json(template);
    }
    catch (error) {
        next(error);
    }
};
export const getTemplates = async (req, res, next) => {
    try {
        const templates = await templateService.getAllTemplates();
        res.status(200).json(templates);
    }
    catch (error) {
        next(error);
    }
};
export const getTemplateById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const template = await templateService.getTemplateById(id);
        if (!template) {
            return res.status(404).json({ message: 'Template not found.' });
        }
        res.status(200).json(template);
    }
    catch (error) {
        next(error);
    }
};
export const updateTemplate = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, type, subject, content } = req.body; // Incluir subject
        const template = await templateService.updateTemplate(id, name, type, subject, content);
        if (!template) {
            return res.status(404).json({ message: 'Template not found.' });
        }
        res.status(200).json(template);
    }
    catch (error) {
        next(error);
    }
};
export const deleteTemplate = async (req, res, next) => {
    try {
        const { id } = req.params;
        const template = await templateService.deleteTemplate(id);
        if (!template) {
            return res.status(404).json({ message: 'Template not found.' });
        }
        res.status(204).send(); // No content for successful deletion
    }
    catch (error) {
        next(error);
    }
};
export const previewTemplate = async (req, res, next) => {
    try {
        const { content, context } = req.body;
        if (!content) {
            return res.status(400).json({ message: 'Content is required for preview.' });
        }
        const renderedContent = await templateService.renderTemplate(content, context || {});
        res.status(200).json({ renderedContent });
    }
    catch (error) {
        next(error);
    }
};
