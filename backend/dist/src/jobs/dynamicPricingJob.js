import cron from 'node-cron';
import pool from '../db/index.js';
const applyDynamicPricing = async () => {
    console.log('Running dynamic pricing job for used phones...');
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        // Find used products in stock for more than 30 days
        const productsToUpdate = await client.query(`
      SELECT pv.id, pv.price, p.name
      FROM product_variations pv
      JOIN products p ON pv.product_id = p.id
      WHERE pv.condition = 'Seminovo' AND pv.created_at < NOW() - INTERVAL '30 days'
    `);
        for (const product of productsToUpdate.rows) {
            const oldPrice = product.price;
            // Apply a 5% discount
            const newPrice = oldPrice * 0.95;
            // Update product variation price
            await client.query('UPDATE product_variations SET price = $1 WHERE id = $2', [
                newPrice,
                product.id,
            ]);
            // Log the price change
            await client.query('INSERT INTO product_price_history (product_variation_id, old_price, new_price, change_reason) VALUES ($1, $2, $3, $4)', [product.id, oldPrice, newPrice, 'Precificação Dinâmica (30+ dias)']);
            console.log(`Updated price for ${product.name} (ID: ${product.id}) from ${oldPrice} to ${newPrice}`);
        }
        await client.query('COMMIT');
    }
    catch (error) {
        await client.query('ROLLBACK');
        console.error('Error during dynamic pricing job:', error);
    }
    finally {
        client.release();
    }
};
// Schedule the job to run once a day at 2 AM
export const scheduleDynamicPricingJob = () => {
    cron.schedule('0 2 * * *', applyDynamicPricing, {
        timezone: 'America/Sao_Paulo',
    });
};
