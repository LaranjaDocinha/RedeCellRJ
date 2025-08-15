const db = require('../db');
const AppError = require('../utils/appError');
const { validationResult } = require('express-validator');

// Create a new checklist template
exports.createChecklistTemplate = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new AppError(errors.array().map(err => err.msg).join(', '), 400));
    }

    const { name, description, category } = req.body;

    try {
        const newTemplate = await db.query(
            'INSERT INTO checklist_templates (name, description, category) VALUES ($1, $2, $3) RETURNING *'
            ,
            [name, description, category]
        );
        res.status(201).json(newTemplate.rows[0]);
    } catch (error) {
        console.error('Error creating checklist template:', error);
        next(new AppError('Erro ao criar template de checklist.', 500));
    }
};

// Get all checklist templates
exports.getAllChecklistTemplates = async (req, res, next) => {
    try {
        const templates = await db.query('SELECT * FROM checklist_templates ORDER BY name ASC');
        res.status(200).json(templates.rows);
    } catch (error) {
        console.error('Error fetching checklist templates:', error);
        next(new AppError('Erro ao buscar templates de checklist.', 500));
    }
};

// Get a single checklist template by ID
exports.getChecklistTemplateById = async (req, res, next) => {
    const { id } = req.params;
    try {
        const template = await db.query('SELECT * FROM checklist_templates WHERE id = $1', [id]);
        if (template.rows.length === 0) {
            return next(new AppError('Template de checklist não encontrado.', 404));
        }
        res.status(200).json(template.rows[0]);
    } catch (error) {
        console.error('Error fetching checklist template by ID:', error);
        next(new AppError('Erro ao buscar template de checklist.', 500));
    }
};

// Update a checklist template
exports.updateChecklistTemplate = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new AppError(errors.array().map(err => err.msg).join(', '), 400));
    }

    const { id } = req.params;
    const { name, description, category } = req.body;

    try {
        const updatedTemplate = await db.query(
            'UPDATE checklist_templates SET name = $1, description = $2, category = $3, updated_at = NOW() WHERE id = $4 RETURNING *'
            ,
            [name, description, category, id]
        );
        if (updatedTemplate.rows.length === 0) {
            return next(new AppError('Template de checklist não encontrado.', 404));
        }
        res.status(200).json(updatedTemplate.rows[0]);
    } catch (error) {
        console.error('Error updating checklist template:', error);
        next(new AppError('Erro ao atualizar template de checklist.', 500));
    }
};

// Delete a checklist template
exports.deleteChecklistTemplate = async (req, res, next) => {
    const { id } = req.params;
    try {
        const deletedTemplate = await db.query('DELETE FROM checklist_templates WHERE id = $1 RETURNING *'
        , [id]);
        if (deletedTemplate.rows.length === 0) {
            return next(new AppError('Template de checklist não encontrado.', 404));
        }
        res.status(204).send(); // No content for successful deletion
    } catch (error) {
        console.error('Error deleting checklist template:', error);
        next(new AppError('Erro ao excluir template de checklist.', 500));
    }
};
