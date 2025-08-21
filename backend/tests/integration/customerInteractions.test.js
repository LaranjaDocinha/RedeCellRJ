const request = require('supertest');
const app = require('../../index'); // Assuming your Express app is exported from index.js
const db = require('../../db'); // Assuming your database connection is exported from db.js

describe('Customer Interactions API', () => {
    let customerId;
    let userId;

    beforeAll(async () => {
        // Create a dummy customer and user for testing
        const customerRes = await db.query('INSERT INTO customers (name, email, branch_id) VALUES ($1, $2, $3) RETURNING id', ['Test Customer', 'customer@example.com', 1]);
        customerId = customerRes.rows[0].id;

        const adminRoleRes = await db.query('INSERT INTO roles (name, description) VALUES ($1, $2) ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description RETURNING id', ['admin', 'Administrator role']);
        const adminRoleId = adminRoleRes.rows[0].id;

        const userRes = await db.query('INSERT INTO users (name, email, password, role_id) VALUES ($1, $2, $3, $4) RETURNING id', ['Test User', 'user@example.com', 'hashed_password', adminRoleId]);
        userId = userRes.rows[0].id;

        // Clear the customer_interactions table before running tests
        await db.query('DELETE FROM customer_interactions');
    });

    afterAll(async () => {
        // Clean up after all tests are done
        await db.query('DELETE FROM customer_interactions');
        await db.query('DELETE FROM customers WHERE id = $1', [customerId]);
        await db.query('DELETE FROM users WHERE id = $1', [userId]);
    });

    it('should create a new customer interaction', async () => {
        const newInteraction = {
            customer_id: customerId,
            user_id: userId,
            interaction_type: 'Chamada',
            notes: 'Called customer to follow up on a quotation.'
        };

        const res = await request(app)
            .post('/api/customer-interactions')
            .send(newInteraction);

        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('id');
        expect(res.body.customer_id).toEqual(newInteraction.customer_id);
        expect(res.body.interaction_type).toEqual(newInteraction.interaction_type);
    });

    // Add more tests for GET, PUT, DELETE, and other scenarios later
});
