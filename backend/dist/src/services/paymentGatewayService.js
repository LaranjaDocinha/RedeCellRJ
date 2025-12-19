import pool from '../db/index.js';
import { AppError, NotFoundError } from '../utils/errors.js';
export const paymentGatewayService = {
    async getAllGateways() {
        const result = await pool.query('SELECT * FROM payment_gateways ORDER BY name ASC');
        return result.rows;
    },
    async getActiveGatewaysByType(type) {
        const result = await pool.query('SELECT * FROM payment_gateways WHERE type = $1 AND is_active = TRUE', [type]);
        return result.rows;
    },
    async createGateway(payload) {
        const { name, type, config, is_active = true } = payload;
        try {
            const result = await pool.query('INSERT INTO payment_gateways (name, type, config, is_active) VALUES ($1, $2, $3, $4) RETURNING *', [name, type, config, is_active]);
            return result.rows[0];
        }
        catch (error) {
            if (error.code === '23505') { // Unique violation
                throw new AppError(`Payment gateway with name ${name} already exists.`, 409);
            }
            throw new AppError('Failed to create payment gateway.', 500);
        }
    },
    async updateGateway(id, payload) {
        const { name, type, config, is_active } = payload;
        const fields = [];
        const values = [];
        let paramIndex = 1;
        if (name !== undefined) {
            fields.push(`name = $${paramIndex++}`);
            values.push(name);
        }
        if (type !== undefined) {
            fields.push(`type = $${paramIndex++}`);
            values.push(type);
        }
        if (config !== undefined) {
            fields.push(`config = $${paramIndex++}`);
            values.push(config);
        }
        if (is_active !== undefined) {
            fields.push(`is_active = $${paramIndex++}`);
            values.push(is_active);
        }
        if (fields.length === 0) {
            const existing = await this.getGatewayById(id);
            if (!existing)
                throw new NotFoundError('Payment gateway not found.');
            return existing; // No fields to update
        }
        values.push(id);
        const query = `UPDATE payment_gateways SET ${fields.join(', ')}, updated_at = current_timestamp WHERE id = $${paramIndex} RETURNING *`;
        const result = await pool.query(query, values);
        if (result.rows.length === 0) {
            throw new NotFoundError('Payment gateway not found.');
        }
        return result.rows[0];
    },
    async deleteGateway(id) {
        const result = await pool.query('DELETE FROM payment_gateways WHERE id = $1', [id]);
        return result.rowCount > 0;
    },
    async getGatewayById(id) {
        const result = await pool.query('SELECT * FROM payment_gateways WHERE id = $1', [id]);
        return result.rows[0];
    },
    async processPayment(gatewayId, amount, paymentData) {
        const gateway = await this.getGatewayById(gatewayId);
        if (!gateway || !gateway.is_active) {
            throw new AppError('Payment gateway not found or inactive.', 404);
        }
        // This is where real integration logic would go (e.g., calling Stripe, Cielo, PagSeguro APIs)
        logger.info(`Processing ${gateway.type} payment via ${gateway.name} for ${amount} (mocked)`);
        // Mock response based on gateway type
        if (gateway.type === 'credit_card') {
            // Simulate API call to a credit card processor
            const mockTransactionId = `CC-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
            // Simulate success/failure based on card number or other data
            if (paymentData.cardNumber && paymentData.cardNumber.startsWith('4')) { // Visa success mock
                return { success: true, transactionId: mockTransactionId, status: 'approved', gatewayResponse: { /* ... */} };
            }
            else {
                return { success: false, transactionId: mockTransactionId, status: 'denied', gatewayResponse: { /* ... */} };
            }
        }
        else if (gateway.type === 'pix') {
            // Simulate PIX API
            const mockPixId = `PIX-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
            return { success: true, transactionId: mockPixId, status: 'pending', qrCode: 'mock_qr_code_base64', copyPaste: 'mock_pix_copy_paste' };
        }
        else {
            return { success: false, message: `Unsupported payment gateway type: ${gateway.type}` };
        }
    },
};
