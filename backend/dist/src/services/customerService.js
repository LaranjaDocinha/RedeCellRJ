import pool from '../db/index.js';
import { AppError } from '../utils/errors.js';
import { referralService } from './referralService.js';
class CustomerService {
    async getAllCustomers() {
        const result = await pool.query('SELECT * FROM customers');
        return result.rows;
    }
    async getCustomerById(id) {
        const result = await pool.query('SELECT * FROM customers WHERE id = $1', [id]);
        return result.rows[0];
    }
    async getCustomerByEmail(email) {
        const result = await pool.query('SELECT * FROM customers WHERE email = $1', [email]);
        return result.rows[0];
    }
    async getCustomersWithBirthdayToday() {
        const result = await pool.query('SELECT * FROM customers WHERE EXTRACT(MONTH FROM birth_date) = EXTRACT(MONTH FROM NOW()) AND EXTRACT(DAY FROM birth_date) = EXTRACT(DAY FROM NOW())');
        return result.rows;
    }
    // ... (CustomerService class)
    async createCustomer(payload) {
        const { name, email, phone, address, cpf, birth_date, referral_code } = payload;
        try {
            const result = await pool.query('INSERT INTO customers (name, email, phone, address, cpf, birth_date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', [name, email, phone, address, cpf, birth_date]);
            const newCustomer = result.rows[0];
            if (referral_code) {
                await referralService.applyReferralCode(referral_code, newCustomer.id);
            }
            return newCustomer;
        }
        catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            if (error instanceof Error && error.code === '23505') {
                // Unique violation error code
                throw new AppError('Customer with this email or CPF already exists', 409);
            }
            throw error;
        }
    }
    async updateCustomer(id, payload) {
        const { name, email, phone, address, cpf, birth_date } = payload;
        const fields = [];
        const values = [];
        let paramIndex = 1;
        if (name !== undefined) {
            fields.push(`name = $${paramIndex++}`);
            values.push(name);
        }
        if (email !== undefined) {
            fields.push(`email = $${paramIndex++}`);
            values.push(email);
        }
        if (phone !== undefined) {
            fields.push(`phone = $${paramIndex++}`);
            values.push(phone);
        }
        if (address !== undefined) {
            fields.push(`address = $${paramIndex++}`);
            values.push(address);
        }
        if (cpf !== undefined) {
            fields.push(`cpf = $${paramIndex++}`);
            values.push(cpf);
        }
        if (birth_date !== undefined) {
            fields.push(`birth_date = $${paramIndex++}`);
            values.push(birth_date);
        }
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
        }
        catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            if (error instanceof Error && error.code === '23505') {
                // Unique violation error code
                throw new AppError('Customer with this email or CPF already exists', 409);
            }
            throw error;
        }
    }
    async deleteCustomer(id) {
        const result = await pool.query('DELETE FROM customers WHERE id = $1 RETURNING id', [id]);
        return (result?.rowCount ?? 0) > 0;
    }
    async createOrUpdateCustomerFromOCR(data) {
        const { name, email, phone, address, cpf } = data;
        // Tentar encontrar um cliente existente por CPF ou e-mail
        let existingCustomer;
        if (cpf) {
            const res = await pool.query('SELECT * FROM customers WHERE cpf = $1', [cpf]);
            existingCustomer = res.rows[0];
        }
        if (!existingCustomer && email) {
            const res = await pool.query('SELECT * FROM customers WHERE email = $1', [email]);
            existingCustomer = res.rows[0];
        }
        if (existingCustomer) {
            // Atualizar cliente existente
            const updatePayload = { name, email, phone, address, cpf };
            // Remover campos undefined para não sobrescrever com nulo
            Object.keys(updatePayload).forEach((key) => updatePayload[key] === undefined &&
                delete updatePayload[key]);
            return this.updateCustomer(existingCustomer.id.toString(), updatePayload);
        }
        else {
            // Criar novo cliente
            if (!name || !email) {
                throw new AppError('Name and email are required to create a new customer from OCR data.', 400);
            }
            const createPayload = { name, email, phone, address, cpf };
            return this.createCustomer(createPayload);
        }
    }
    async getCustomerSegments() {
        const query = `
      SELECT
        rfm_segment,
        COUNT(id) AS customer_count
      FROM customers
      WHERE rfm_segment IS NOT NULL
      GROUP BY rfm_segment
      ORDER BY customer_count DESC;
    `;
        const result = await pool.query(query);
        return result.rows.map((row) => ({ ...row, customer_count: parseInt(row.customer_count, 10) }));
    }
    async searchCustomers(query) {
        const { searchTerm, limit = 10, offset = 0 } = query;
        const queryParams = [];
        let paramIndex = 1;
        let whereClause = 'WHERE 1=1';
        if (searchTerm) {
            whereClause += ` AND (name ILIKE $${paramIndex} OR email ILIKE $${paramIndex} OR phone ILIKE $${paramIndex})`;
            queryParams.push(`%${searchTerm}%`);
            paramIndex++;
        }
        const countQuery = `SELECT COUNT(*) FROM customers ${whereClause}`;
        const countResult = await pool.query(countQuery, queryParams);
        const totalCustomers = parseInt(countResult.rows[0].count, 10);
        const customersQuery = `
      SELECT *
      FROM customers
      ${whereClause}
      ORDER BY name ASC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;
        queryParams.push(limit, offset);
        const customerResult = await pool.query(customersQuery, queryParams);
        return {
            customers: customerResult.rows,
            totalCustomers,
        };
    }
    async getCustomer360View(customerId) {
        const customerResult = await pool.query('SELECT * FROM customers WHERE id = $1', [customerId]);
        const customer = customerResult.rows[0];
        if (!customer) {
            return undefined;
        }
        // Fetch recent sales
        const recentSalesResult = await pool.query(`SELECT id, total_amount, sale_date FROM sales WHERE customer_id = $1 ORDER BY sale_date DESC LIMIT 5`, [customerId]);
        return {
            ...customer,
            store_credit_balance: parseFloat(customer.store_credit_balance),
            recent_sales: recentSalesResult.rows,
        };
    }
    async addLoyaltyPoints(customerId, points) {
        const result = await pool.query('UPDATE customers SET loyalty_points = loyalty_points + $1 WHERE id = $2 RETURNING *', [points, customerId]);
        return result.rows[0];
    }
    async subtractLoyaltyPoints(customerId, points) {
        const result = await pool.query('UPDATE customers SET loyalty_points = GREATEST(0, loyalty_points - $1) WHERE id = $2 RETURNING *', [points, customerId]);
        return result.rows[0];
    }
    async deductStoreCredit(customerId, amount, relatedId, client) {
        const result = await client.query('UPDATE customers SET store_credit_balance = store_credit_balance - $1 WHERE id = $2 RETURNING *', [amount, customerId]);
        if (result.rows.length > 0) {
            await client.query('INSERT INTO store_credit_transactions (customer_id, amount, type, reason, related_id) VALUES ($1, $2, $3, $4, $5)', [customerId, amount, 'debit', 'Sale payment', relatedId]);
        }
        return result.rows[0];
    }
    async addStoreCredit(customerId, amount, relatedId, client, reason = 'Manual adjustment') {
        const result = await client.query('UPDATE customers SET store_credit_balance = store_credit_balance + $1 WHERE id = $2 RETURNING *', [amount, customerId]);
        if (result.rows.length > 0) {
            await client.query('INSERT INTO store_credit_transactions (customer_id, amount, type, reason, related_id) VALUES ($1, $2, $3, $4, $5)', [customerId, amount, 'credit', reason, relatedId]);
        }
        return result.rows[0];
    }
    async addCashback(customerId, amount, orderId) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            await this.addStoreCredit(customerId, amount, orderId, client, 'Cashback Reward');
            await client.query('COMMIT');
        }
        catch (e) {
            await client.query('ROLLBACK');
            throw e;
        }
        finally {
            client.release();
        }
    }
    async getStoreCreditTransactions(customerId) {
        const result = await pool.query('SELECT * FROM store_credit_transactions WHERE customer_id = $1 ORDER BY created_at DESC', [customerId]);
        return result.rows;
    }
}
export const customerService = new CustomerService();
