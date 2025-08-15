const request = require('supertest');
const app = require('../../index'); // Assuming your Express app is exported from index.js
const db = require('../../db'); // Assuming your database connection is exported from db.js

describe('Leads API', () => {
    beforeAll(async () => {
        // Clear the leads table before running tests
        await db.query('DELETE FROM leads');
    });

    afterAll(async () => {
        // Clean up after all tests are done
        await db.end();
    });

    it('should create a new lead', async () => {
        const newLead = {
            name: 'Test Lead',
            email: 'test@example.com',
            phone: '1234567890',
            source: 'Website',
            status: 'Novo'
        };

        const res = await request(app)
            .post('/api/leads')
            .send(newLead);

        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('id');
        expect(res.body.name).toEqual(newLead.name);
        expect(res.body.email).toEqual(newLead.email);
    });

    // Add more tests for GET, PUT, DELETE, and other scenarios later
});
