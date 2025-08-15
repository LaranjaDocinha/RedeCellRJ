const request = require('supertest');
const app = require('../../index'); // Assuming your Express app is exported from index.js
const db = require('../../db'); // Assuming your database connection is exported from db.js

describe('Reports API', () => {
    let productId;
    let customerId;
    let saleId;

    beforeAll(async () => {
        // Create dummy data for testing reports
        const productRes = await db.query('INSERT INTO products (name, description, price) VALUES ($1, $2, $3) RETURNING id', ['Report Product', 'Description', 50.00]);
        productId = productRes.rows[0].id;

        const customerRes = await db.query('INSERT INTO customers (name, email) VALUES ($1, $2) RETURNING id', ['Report Customer', 'report@example.com']);
        customerId = customerRes.rows[0].id;

        const saleRes = await db.query(
            'INSERT INTO sales (customer_id, total_amount, sale_date) VALUES ($1, $2, $3) RETURNING id'
            ,
            [customerId, 50.00, '2024-01-01']
        );
        saleId = saleRes.rows[0].id;

        await db.query(
            'INSERT INTO sale_items (sale_id, product_id, product_name, quantity, price_at_sale, cost_at_sale) VALUES ($1, $2, $3, $4, $5, $6)',
            [saleId, productId, 'Report Product', 1, 50.00, 25.00]
        );
    });

    afterAll(async () => {
        // Clean up after all tests are done
        await db.query('DELETE FROM sale_items WHERE sale_id = $1', [saleId]);
        await db.query('DELETE FROM sales WHERE id = $1', [saleId]);
        await db.query('DELETE FROM products WHERE id = $1', [productId]);
        await db.query('DELETE FROM customers WHERE id = $1', [customerId]);
        await db.end();
    });

    it('should fetch profitability report successfully', async () => {
        const res = await request(app)
            .get('/api/reports/profitability')
            .query({ startDate: '2024-01-01', endDate: '2024-01-31' });

        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThanOrEqual(1);
        expect(res.body[0]).toHaveProperty('gross_profit');
    });

    // Add more tests for other reports later
});
