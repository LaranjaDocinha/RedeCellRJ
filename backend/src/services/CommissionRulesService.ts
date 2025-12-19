import { getPool } from '../db/index.js';
const pool = getPool();
import { v4 as uuidv4 } from 'uuid';

interface CommissionRule {
  id?: string;
  name: string;
  value_type: 'percentage' | 'fixed_amount';
  value: number;
  applies_to: 'all' | 'product' | 'category' | 'service';
  conditions?: object;
  min_value?: number;
  max_value?: number;
}

export class CommissionRulesService {
  async createCommissionRule(rule: CommissionRule): Promise<CommissionRule> {
    const id = uuidv4();
    const result = await pool.query(
      `INSERT INTO commission_rules (id, name, value_type, value, applies_to, conditions, min_value, max_value)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [
        id,
        rule.name,
        rule.value_type,
        rule.value,
        rule.applies_to,
        rule.conditions,
        rule.min_value,
        rule.max_value,
      ],
    );
    return result.rows[0];
  }

  async getCommissionRules(): Promise<CommissionRule[]> {
    const result = await pool.query('SELECT * FROM commission_rules');
    return result.rows;
  }

  async getCommissionRuleById(id: string): Promise<CommissionRule | null> {
    const result = await pool.query('SELECT * FROM commission_rules WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  async updateCommissionRule(
    id: string,
    rule: Partial<CommissionRule>,
  ): Promise<CommissionRule | null> {
    const fields = Object.keys(rule)
      .map(
        (key, index) => `
${key} = $${index + 2}`,
      )
      .join(', ');
    const values = [id, ...Object.values(rule)];
    const result = await pool.query(
      `UPDATE commission_rules SET ${fields} WHERE id = $1 RETURNING *`,
      values,
    );
    return result.rows[0] || null;
  }

  async deleteCommissionRule(id: string): Promise<boolean> {
    const result = await pool.query('DELETE FROM commission_rules WHERE id = $1 RETURNING id', [
      id,
    ]);
    return (result.rowCount ?? 0) > 0;
  }
}
