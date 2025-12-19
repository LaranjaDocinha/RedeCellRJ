import pool from '../db/index.js';
class TemplateService {
    async getAllTemplates() {
        const result = await pool.query('SELECT id, name, type, subject, content FROM templates ORDER BY name ASC');
        return result.rows;
    }
    async getTemplateById(id) {
        const result = await pool.query('SELECT id, name, type, subject, content FROM templates WHERE id = $1', [id]);
        return result.rows[0];
    }
    async getTemplateByName(name) {
        const result = await pool.query('SELECT id, name, type, subject, content FROM templates WHERE name = $1', [name]);
        return result.rows[0];
    }
    async createTemplate(name, type, subject, content) {
        const result = await pool.query('INSERT INTO templates (name, type, subject, content) VALUES ($1, $2, $3, $4) RETURNING *', [name, type, subject, content]);
        return result.rows[0];
    }
    async updateTemplate(id, name, type, subject, content) {
        const result = await pool.query('UPDATE templates SET name = $1, type = $2, subject = $3, content = $4 WHERE id = $5 RETURNING *', [name, type, subject, content, id]);
        return result.rows[0];
    }
    async deleteTemplate(id) {
        const result = await pool.query('DELETE FROM templates WHERE id = $1 RETURNING *', [id]);
        return result.rows[0];
    }
    async renderTemplate(content, context) {
        // Basic variable replacement
        let renderedContent = content;
        for (const key in context) {
            renderedContent = renderedContent.replace(new RegExp(`{{\\s*${key}\\s*}}`, 'g'), context[key]);
        }
        return renderedContent;
    }
}
export const templateService = new TemplateService();
