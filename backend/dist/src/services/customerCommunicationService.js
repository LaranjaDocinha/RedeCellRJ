import pool from '../db/index.js';
class CustomerCommunicationService {
    async recordCommunication(payload) {
        const { customer_id, user_id, channel, direction, summary, related_to_type, related_to_id } = payload;
        const query = `
      INSERT INTO customer_communications
        (customer_id, user_id, channel, direction, summary, related_to_type, related_to_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;
        const result = await pool.query(query, [
            customer_id,
            user_id,
            channel,
            direction,
            summary,
            related_to_type,
            related_to_id,
        ]);
        return result.rows[0];
    }
    async getCommunicationsForCustomer(customerId) {
        const query = `
      SELECT * FROM customer_communications
      WHERE customer_id = $1
      ORDER BY communication_timestamp DESC;
    `;
        const result = await pool.query(query, [customerId]);
        return result.rows;
    }
}
export const customerCommunicationService = new CustomerCommunicationService();
