import { getPool } from '../db/index.js';
import { v4 as uuidv4 } from 'uuid';
const pool = getPool();
export const createTemplate = async (req, res, next) => {
    try {
        const { name, type, content } = req.body;
        const id = uuidv4();
        const result = await pool.query('INSERT INTO templates (id, name, type, content) VALUES ($1, $2, $3, $4) RETURNING *', [id, name, type, content]);
        res.status(201).json(result.rows[0]);
    }
    catch (error) {
        next(error);
    }
};
export const getTemplates = async (req, res, next) => {
    try {
        const result = await pool.query('SELECT * FROM templates');
        res.status(200).json(result.rows);
    }
    catch (error) {
        next(error);
    }
};
export const getTemplateById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM templates WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Template not found.' });
        }
        res.status(200).json(result.rows[0]);
    }
    catch (error) {
        next(error);
    }
};
export const updateTemplate = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, type, content } = req.body;
        const result = await pool.query('UPDATE templates SET name = $1, type = $2, content = $3, updated_at = current_timestamp WHERE id = $4 RETURNING *', [name, type, content, id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Template not found.' });
        }
        res.status(200).json(result.rows[0]);
    }
    catch (error) {
        next(error);
    }
};
export const deleteTemplate = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM templates WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Template not found.' });
        }
        res.status(204).send(); // No content for successful deletion
    }
    catch (error) {
        next(error);
    }
};
