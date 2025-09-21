import pool from '../db/index.js';
import { AppError } from '../utils/errors.js';

interface Customer {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  created_at: Date;
  updated_at: Date;
}

interface CreateCustomerPayload {
  name: string;
  email: string;
  phone?: string;
  address?: string;
}

interface UpdateCustomerPayload {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
}

class CustomerService {
  async getAllCustomers(): Promise<Customer[]> {
    const result = await pool.query('SELECT * FROM customers');
    return result.rows;
  }

  async getCustomerById(id: number): Promise<Customer | undefined> {
    const result = await pool.query('SELECT * FROM customers WHERE id = $1', [id]);
    return result.rows[0];
  }

  async createCustomer(payload: CreateCustomerPayload): Promise<Customer> {
    const { name, email, phone, address } = payload;
    try {
      const result = await pool.query(
        'INSERT INTO customers (name, email, phone, address) VALUES ($1, $2, $3, $4) RETURNING *'
        , [name, email, phone, address]
      );
      return result.rows[0];
    } catch (error: unknown) {
      if (error instanceof AppError) {
        throw error;
      }
      if (error instanceof Error && (error as any).code === '23505') { // Unique violation error code
        throw new AppError('Customer with this email already exists', 409);
      }
      throw error;
    }
  }

  async updateCustomer(id: number, payload: UpdateCustomerPayload): Promise<Customer | undefined> {
    const { name, email, phone, address } = payload;
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (name !== undefined) { fields.push(`name = $${paramIndex++}`); values.push(name); }
    if (email !== undefined) { fields.push(`email = $${paramIndex++}`); values.push(email); }
    if (phone !== undefined) { fields.push(`phone = $${paramIndex++}`); values.push(phone); }
    if (address !== undefined) { fields.push(`address = $${paramIndex++}`); values.push(address); }

    if (fields.length === 0) {
      const existingCustomer = await this.getCustomerById(id);
      if (!existingCustomer) {
        return undefined; // No customer found to update
      }
      return existingCustomer; // No fields to update, return existing customer
    }

    values.push(id); // Add id for WHERE clause
    const query = `UPDATE customers SET ${fields.join(', ')}, updated_at = current_timestamp WHERE id = $${paramIndex} RETURNING *`;

    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error: unknown) {
      if (error instanceof AppError) {
        throw error;
      }
      if (error instanceof Error && (error as any).code === '23505') { // Unique violation error code
        throw new AppError('Customer with this email already exists', 409);
      }
      throw error;
    }
  }

  async deleteCustomer(id: number): Promise<boolean> {
    const result = await pool.query('DELETE FROM customers WHERE id = $1 RETURNING id', [id]);
    return (result?.rowCount ?? 0) > 0;
  }
}

export const customerService = new CustomerService();