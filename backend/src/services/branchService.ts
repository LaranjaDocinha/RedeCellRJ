import pool from '../db/index.js';
import { AppError } from '../utils/errors.js';

interface Branch {
  id: number;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  created_at: Date;
  updated_at: Date;
}

interface CreateBranchPayload {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
}

interface UpdateBranchPayload {
  name?: string;
  address?: string;
  phone?: string;
  email?: string;
}

class BranchService {
  async getAllBranches(): Promise<Branch[]> {
    const result = await pool.query('SELECT * FROM branches');
    return result.rows;
  }

  async getBranchById(id: number): Promise<Branch | undefined> {
    const result = await pool.query('SELECT * FROM branches WHERE id = $1', [id]);
    return result.rows[0];
  }

  async createBranch(payload: CreateBranchPayload): Promise<Branch> {
    const { name, address, phone, email } = payload;
    try {
      const result = await pool.query(
        'INSERT INTO branches (name, address, phone, email) VALUES ($1, $2, $3, $4) RETURNING *',
        [name, address, phone, email]
      );
      return result.rows[0];
    } catch (error: any) {
      if (error.code === '23505') { // Unique violation error code
        throw new AppError('Branch with this name already exists', 409);
      }
      throw error;
    }
  }

  async updateBranch(id: number, payload: UpdateBranchPayload): Promise<Branch | undefined> {
    const { name, address, phone, email } = payload;
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (name !== undefined) { fields.push(`name = $${paramIndex++}`); values.push(name); }
    if (address !== undefined) { fields.push(`address = $${paramIndex++}`); values.push(address); }
    if (phone !== undefined) { fields.push(`phone = $${paramIndex++}`); values.push(phone); }
    if (email !== undefined) { fields.push(`email = $${paramIndex++}`); values.push(email); }

    if (fields.length === 0) {
      const existingBranch = await this.getBranchById(id);
      if (!existingBranch) {
        return undefined; // No branch found to update
      }
      return existingBranch; // No fields to update, return existing branch
    }

    values.push(id); // Add id for WHERE clause
    const query = `UPDATE branches SET ${fields.join(', ')}, updated_at = current_timestamp WHERE id = $${paramIndex} RETURNING *`;

    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error: any) {
      if (error.code === '23505') { // Unique violation error code
        throw new AppError('Branch with this name already exists', 409);
      }
      throw error;
    }
  }

  async deleteBranch(id: number): Promise<boolean> {
    const result = await pool.query('DELETE FROM branches WHERE id = $1 RETURNING id', [id]);
    return (result?.rowCount ?? 0) > 0;
  }
}

export const branchService = new BranchService();