import pool from '../db/index.js';
import { authService } from './authService.js'; // Import authService for password hashing
import * as bcrypt from 'bcrypt';

interface UserCreateInput {
  name: string;
  email: string;
  password?: string; // Optional for update, required for create
  role?: string;
}

interface UserUpdateInput {
  name?: string;
  email?: string;
  password?: string;
  role?: string;
}

export const userService = {
  async getAllUsers() {
    const { rows } = await pool.query('SELECT id, name, email, role FROM users ORDER BY name ASC');
    return rows;
  },

  async getUserById(id: number) {
    const { rows } = await pool.query('SELECT id, name, email, role FROM users WHERE id = $1;', [id]);
    return rows[0];
  },

  async createUser(userData: UserCreateInput) {
    const { name, email, password, role = 'user' } = userData;
    if (!password) {
      throw new Error('Password is required for user creation.');
    }
    const { user } = await authService.register(name, email, password, role);
    return user;
  },

  async updateUser(id: number, userData: UserUpdateInput) {
    const { name, email, password, role } = userData;
    const fields = [];
    const values = [];
    let paramIndex = 1;

    if (name !== undefined) { fields.push(`name = ${paramIndex++}`); values.push(name); }
    if (email !== undefined) { fields.push(`email = ${paramIndex++}`); values.push(email); }
    if (role !== undefined) { fields.push(`role = ${paramIndex++}`); values.push(role); }
    if (password !== undefined) {
      const password_hash = await bcrypt.hash(password, 10);
      fields.push(`password_hash = ${paramIndex++}`); values.push(password_hash);
    }

    if (fields.length === 0) return this.getUserById(id); // Nothing to update

    values.push(id); // Add ID for WHERE clause
    const queryText = `UPDATE users SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ${paramIndex} RETURNING id, name, email, role;`;
    const { rows } = await pool.query(queryText, values);
    return rows[0];
  },

  async deleteUser(id: number) {
    const result = await pool.query('DELETE FROM users WHERE id = $1;', [id]);
    return (result.rowCount ?? 0) > 0;
  },
};