import pool from '../db/index.js';
class LoyaltyTierService {
    async createTier(name, min_points, description, benefits) {
        const result = await pool.query('INSERT INTO loyalty_tiers (name, min_points, description, benefits) VALUES ($1, $2, $3, $4) RETURNING *', [name, min_points, description, benefits]);
        return result.rows[0];
    }
    async getTier(id) {
        const result = await pool.query('SELECT * FROM loyalty_tiers WHERE id = $1', [id]);
        return result.rows[0];
    }
    async getAllTiers() {
        const result = await pool.query('SELECT * FROM loyalty_tiers ORDER BY min_points ASC');
        return result.rows;
    }
    async updateTier(id, name, min_points, description, benefits) {
        const result = await pool.query('UPDATE loyalty_tiers SET name = $1, min_points = $2, description = $3, benefits = $4, updated_at = current_timestamp WHERE id = $5 RETURNING *', [name, min_points, description, benefits, id]);
        return result.rows[0];
    }
    async deleteTier(id) {
        const result = await pool.query('DELETE FROM loyalty_tiers WHERE id = $1', [id]);
        return (result.rowCount ?? 0) > 0;
    }
    async updateCustomerTier(customerId) {
        const customerRes = await pool.query('SELECT u.loyalty_points FROM users u JOIN customers c ON u.id = c.user_id WHERE c.id = $1', [customerId]);
        if (customerRes.rows.length === 0)
            return;
        const currentPoints = customerRes.rows[0].loyalty_points;
        const tiersRes = await pool.query('SELECT id, min_points FROM loyalty_tiers ORDER BY min_points DESC');
        let newTierId = null;
        for (const tier of tiersRes.rows) {
            if (currentPoints >= tier.min_points) {
                newTierId = tier.id;
                break;
            }
        }
        await pool.query('UPDATE customers SET loyalty_tier_id = $1 WHERE id = $2', [
            newTierId,
            customerId,
        ]);
    }
    async updateAllCustomerTiers() {
        const customers = await pool.query('SELECT id FROM customers');
        for (const customer of customers.rows) {
            await this.updateCustomerTier(customer.id);
        }
    }
}
export const loyaltyTierService = new LoyaltyTierService();
