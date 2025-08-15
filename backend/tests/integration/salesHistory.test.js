const request = require('supertest');
const app = require('../../index'); // Assuming your Express app is exported from index.js
const db = require('../../db'); // Assuming your database connection is exported from db.js

describe('Sales History API', () => {
    let customerId;
    let saleId1, saleId2;

    beforeAll(async () => {
        // Create a dummy customer for testing
        const customerRes = await db.query('INSERT INTO customers (name, email) VALUES ($1, $2) RETURNING id', ['History Customer', 'history@example.com']);
        customerId = customerRes.rows[0].id;

        // Create dummy sales for the customer
        const sale1Res = await db.query(
            'INSERT INTO sales (customer_id, total_amount, sale_date) VALUES ($1, $2, $3) RETURNING id'
            ,
            [customerId, 100.00, '2024-01-15']
        );
        saleId1 = sale1Res.rows[0].id;

        const sale2Res = await db.query(
            'INSERT INTO sales (customer_id, total_amount, sale_date) VALUES ($1, $2, $3) RETURNING id'
            ,
            [customerId, 250.50, '2024-02-20']
        );
        saleId2 = sale2Res.rows[0].id;
    });

    afterAll(async () => {
        // Clean up after all tests are done
        await db.query('DELETE FROM sales WHERE id = $1 OR id = $2', [saleId1, saleId2]);
        await db.query('DELETE FROM customers WHERE id = $1', [customerId]);
        await db.end();
    });

    it('should fetch sales history for a specific customer', async () => {
        const res = await request(app)
            .get(`/api/customers/${customerId}/sales-history`);

        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThanOrEqual(2); // Should contain at least the two sales we added
        expect(res.body.some(sale => sale.id === sale1)).toBe(true);
        expect(res.body.some(sale => sale.id === sale2)).toBe(true);
    });

    it('should return empty array if customer has no sales history', async () => {
        // Create a customer with no sales
        const noSalesCustomerRes = await db.query('INSERT INTO customers (name, email) VALUES ($1, $2) RETURNING id', ['No Sales Customer', 'nosales@example.com']);
        const noSalesCustomerId = noSalesCustomerRes.rows[0].id;

        const res = await request(app)
            .get(`/api/customers/${noSalesCustomerId}/sales-history`);

        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toEqual(0);

        // Clean up
        await db.query('DELETE FROM customers WHERE id = $1', [noSalesCustomerId]);
    });

    // Add more tests for pagination, filtering, etc., later
});
