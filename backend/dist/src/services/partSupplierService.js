import pool from '../db/index.js';
import { AppError } from '../utils/errors.js';
class PartSupplierService {
    async getSuppliersForPart(partId) {
        const query = `
      SELECT
        s.id,
        s.name,
        ps.cost,
        ps.lead_time_days,
        ps.supplier_part_number
      FROM suppliers s
      JOIN part_suppliers ps ON s.id = ps.supplier_id
      WHERE ps.part_id = $1
      ORDER BY ps.cost ASC;
    `;
        const result = await pool.query(query, [partId]);
        return result.rows;
    }
    async addSupplierToPart(payload) {
        const { part_id, supplier_id, cost, lead_time_days, supplier_part_number } = payload;
        // Check for duplicates
        const existing = await pool.query('SELECT id FROM part_suppliers WHERE part_id = $1 AND supplier_id = $2', [part_id, supplier_id]);
        if (existing.rows.length > 0) {
            throw new AppError('This supplier is already associated with this part', 409);
        }
        const query = `
      INSERT INTO part_suppliers (part_id, supplier_id, cost, lead_time_days, supplier_part_number)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
        const result = await pool.query(query, [
            part_id,
            supplier_id,
            cost,
            lead_time_days,
            supplier_part_number,
        ]);
        return result.rows[0];
    }
    async updateSupplierForPart(partId, supplierId, payload) {
        const { cost, lead_time_days, supplier_part_number } = payload;
        const fields = [];
        const values = [];
        let paramIndex = 1;
        if (cost !== undefined) {
            fields.push(`cost = $${paramIndex++}`);
            values.push(cost);
        }
        if (lead_time_days !== undefined) {
            fields.push(`lead_time_days = $${paramIndex++}`);
            values.push(lead_time_days);
        }
        if (supplier_part_number !== undefined) {
            fields.push(`supplier_part_number = $${paramIndex++}`);
            values.push(supplier_part_number);
        }
        if (fields.length === 0) {
            const existing = await pool.query('SELECT * FROM part_suppliers WHERE part_id = $1 AND supplier_id = $2', [partId, supplierId]);
            return existing.rows[0];
        }
        values.push(partId, supplierId);
        const query = `
      UPDATE part_suppliers
      SET ${fields.join(', ')}, updated_at = current_timestamp
      WHERE part_id = $${paramIndex++} AND supplier_id = $${paramIndex++}
      RETURNING *;
    `;
        const result = await pool.query(query, values);
        return result.rows[0];
    }
    async removeSupplierFromPart(partId, supplierId) {
        const result = await pool.query('DELETE FROM part_suppliers WHERE part_id = $1 AND supplier_id = $2 RETURNING id', [partId, supplierId]);
        return (result?.rowCount ?? 0) > 0;
    }
}
export const partSupplierService = new PartSupplierService();
