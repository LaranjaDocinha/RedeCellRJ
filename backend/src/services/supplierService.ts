import pool from '../db/index.js';
import { AppError } from '../utils/errors.js';

interface Supplier {
  id: number;
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  created_at: Date;
  updated_at: Date;
}

interface CreateSupplierPayload {
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
}

interface UpdateSupplierPayload {
  name?: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
}

class SupplierService {
  async getAllSuppliers(): Promise<Supplier[]> {
    const result = await pool.query('SELECT * FROM suppliers');
    return result.rows;
  }

  async getSupplierById(id: number): Promise<Supplier | undefined> {
    const result = await pool.query('SELECT * FROM suppliers WHERE id = $1', [id]);
    return result.rows[0];
  }

  async createSupplier(payload: CreateSupplierPayload): Promise<Supplier> {
    const { name, contact_person, email, phone, address } = payload;
    try {
      const result = await pool.query(
        'INSERT INTO suppliers (name, contact_person, email, phone, address) VALUES ($1, $2, $3, $4, $5) RETURNING *'
        , [name, contact_person, email, phone, address]
      );
      return result.rows[0];
    } catch (error: unknown) {
      if (error instanceof AppError) {
        throw error;
      }
      if (error instanceof Error && (error as any).code === '23505') { // Unique violation error code
        if ((error as any).detail.includes('name')) {
          throw new AppError('Supplier with this name already exists', 409);
        }
        else if ((error as any).detail.includes('email')) {
          throw new AppError('Supplier with this email already exists', 409);
        }
      }
      throw error;
    }
  }

  async updateSupplier(id: number, payload: UpdateSupplierPayload): Promise<Supplier | undefined> {
    const { name, contact_person, email, phone, address } = payload;
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (name !== undefined) { fields.push(`name = $${paramIndex++}`); values.push(name); }
    if (contact_person !== undefined) { fields.push(`contact_person = $${paramIndex++}`); values.push(contact_person); }
    if (email !== undefined) { fields.push(`email = $${paramIndex++}`); values.push(email); }
    if (phone !== undefined) { fields.push(`phone = $${paramIndex++}`); values.push(phone); }
    if (address !== undefined) { fields.push(`address = $${paramIndex++}`); values.push(address); }

    if (fields.length === 0) {
      const existingSupplier = await this.getSupplierById(id);
      if (!existingSupplier) {
        return undefined; // No supplier found to update
      }
      return existingSupplier; // No fields to update, return existing supplier
    }

    values.push(id); // Add id for WHERE clause
    const query = `UPDATE suppliers SET ${fields.join(', ')}, updated_at = current_timestamp WHERE id = $${paramIndex} RETURNING *`;

    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error: unknown) {
      if (error instanceof AppError) {
        throw error;
      }
      if (error instanceof Error && (error as any).code === '23505') { // Unique violation error code
        if ((error as any).detail.includes('name')) {
          throw new AppError('Supplier with this name already exists', 409);
        } else if ((error as any).detail.includes('email')) {
          throw new AppError('Supplier with this email already exists', 409);
        }
      }
      throw error;
    }
  }

  async deleteSupplier(id: number): Promise<boolean> {
    const result = await pool.query('DELETE FROM suppliers WHERE id = $1 RETURNING id', [id]);
    return (result?.rowCount ?? 0) > 0;
  }
}

export const supplierService = new SupplierService();