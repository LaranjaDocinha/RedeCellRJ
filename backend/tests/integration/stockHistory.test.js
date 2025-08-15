const request = require('supertest');
const app = require('../../index'); // Assuming your Express app is exported from index.js
const db = require('../../db'); // Assuming your database connection is exported from db.js

describe('Stock History API', () => {
    let productId;
    let productVariationId;

    beforeAll(async () => {
        // Create a dummy product and variation for testing
        const productRes = await db.query('INSERT INTO products (name, description, price) VALUES ($1, $2, $3) RETURNING id', ['Test Product', 'Description', 10.00]);
        productId = productRes.rows[0].id;

        const variationRes = await db.query('INSERT INTO product_variations (product_id, barcode, stock_quantity, min_stock_level) VALUES ($1, $2, $3, $4) RETURNING id', [productId, '123456789', 100, 10]);
        productVariationId = variationRes.rows[0].id;

        // Clear the stock_history table before running tests
        await db.query('DELETE FROM stock_history');

        // Add some dummy stock movements
        await db.query(
            'INSERT INTO stock_history (product_id, product_variation_id, quantity_change, new_stock_quantity, movement_type, notes) VALUES ($1, $2, $3, $4, $5, $6)',
            [productId, productVariationId, 50, 150, 'Entrada', 'Initial stock']
        );
        await db.query(
            'INSERT INTO stock_history (product_id, product_variation_id, quantity_change, new_stock_quantity, movement_type, notes) VALUES ($1, $2, $3, $4, $5, $6)',
            [productId, productVariationId, -10, 140, 'Venda', 'Sale order #123']
        );
    });

    afterAll(async () => {
        // Clean up after all tests are done
        await db.query('DELETE FROM stock_history');
        await db.query('DELETE FROM product_variations WHERE id = $1', [productVariationId]);
        await db.query('DELETE FROM products WHERE id = $1', [productId]);
        await db.end();
    });

    it('should fetch stock history for a specific product variation', async () => {
        const res = await request(app)
            .get(`/api/stock/history/${productVariationId}`);

        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThanOrEqual(2);
        expect(res.body[0]).toHaveProperty('movement_type');
        expect(res.body[0].product_variation_id).toEqual(productVariationId);
    });

    it('should return empty array if no stock history found for variation', async () => {
        const nonExistentVariationId = 99999; // Assuming this ID does not exist

        const res = await request(app)
            .get(`/api/stock/history/${nonExistentVariationId}`);

        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toEqual(0);
    });

    // Add more tests for filtering, pagination, etc., later
});
