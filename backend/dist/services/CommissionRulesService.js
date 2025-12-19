import { getPool } from '../db/index.js';
const pool = getPool();
import { v4 as uuidv4 } from 'uuid';
export class CommissionRulesService {
    async createCommissionRule(rule) {
        const id = uuidv4();
        const result = await pool.query(`INSERT INTO commission_rules (id, name, value_type, value, applies_to, conditions, min_value, max_value)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`, [
            id,
            rule.name,
            rule.value_type,
            rule.value,
            rule.applies_to,
            rule.conditions,
            rule.min_value,
            rule.max_value,
        ]);
        return result.rows[0];
    }
    async getCommissionRules() {
        const result = await pool.query('SELECT * FROM commission_rules');
        return result.rows;
    }
    async getCommissionRuleById(id) {
        const result = await pool.query('SELECT * FROM commission_rules WHERE id = $1', [id]);
        return result.rows[0] || null;
    }
    async updateCommissionRule(id, rule) {
        const fields = Object.keys(rule)
            .map((key, index) => `
${key} = $${index + 2}`)
            .join(', ');
        const values = [id, ...Object.values(rule)];
        const result = await pool.query(`UPDATE commission_rules SET ${fields} WHERE id = $1 RETURNING *`, values);
        return result.rows[0] || null;
    }
    async deleteCommissionRule(id) {
        const result = await pool.query('DELETE FROM commission_rules WHERE id = $1 RETURNING id', [
            id,
        ]);
        return (result.rowCount ?? 0) > 0;
    }
}
