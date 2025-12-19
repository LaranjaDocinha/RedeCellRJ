import pool from '../db/index.js';
class TemplateService {
    async getTemplateByName(name) {
        const result = await pool.query('SELECT * FROM templates WHERE name = $1', [name]);
        return result.rows[0];
    }
    async renderTemplate(name, context) {
        const template = await this.getTemplateByName(name);
        if (!template) {
            throw new Error(`Template ${name} not found`);
        }
        // Basic variable replacement
        let content = template.content;
        for (const key in context) {
            content = content.replace(new RegExp(`{{${key}}}`, 'g'), context[key]);
        }
        return content;
    }
}
export const templateService = new TemplateService();
