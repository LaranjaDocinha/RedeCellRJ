const request = require('supertest');
const app = require('../../index'); // Assuming your Express app is exported from index.js
const db = require('../../db'); // Assuming your database connection is exported from db.js

describe('Audit Logs API', () => {
    beforeAll(async () => {
        // Clear the activity_log table before running tests
        await db.query('DELETE FROM activity_log');

        // Insert some dummy audit logs
        await db.query(
            'INSERT INTO activity_log (user_name, description, timestamp, branch_id) VALUES ($1, $2, $3, $4)',
            ['TestUser1', 'User logged in', '2024-01-01T10:00:00Z', 1]
        );
        await db.query(
            'INSERT INTO activity_log (user_name, description, timestamp, branch_id) VALUES ($1, $2, $3, $4)',
            ['TestUser2', 'Product created', '2024-01-02T11:00:00Z', 1]
        );
        await db.query(
            'INSERT INTO activity_log (user_name, description, timestamp, branch_id) VALUES ($1, $2, $3, $4)',
            ['TestUser1', 'Product updated', '2024-01-03T12:00:00Z', 1]
        );
    });

    afterAll(async () => {
        // Clean up after all tests are done
        await db.query('DELETE FROM activity_log');
    });

    it('should fetch all audit logs', async () => {
        const res = await request(app)
            .get('/api/audit-logs');

        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThanOrEqual(3);
        expect(res.body[0]).toHaveProperty('user_name');
        expect(res.body[0]).toHaveProperty('description');
    });

    it('should fetch audit logs filtered by user_name', async () => {
        const res = await request(app)
            .get('/api/audit-logs')
            .query({ user_name: 'TestUser1' });

        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toEqual(2);
        res.body.forEach(log => {
            expect(log.user_name).toEqual('TestUser1');
        });
    });

    it('should fetch audit logs filtered by date range', async () => {
        const res = await request(app)
            .get('/api/audit-logs')
            .query({ startDate: '2024-01-01', endDate: '2024-01-02' });

        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toEqual(2);
        res.body.forEach(log => {
            const logDate = new Date(log.timestamp);
            expect(logDate.toISOString().slice(0, 10)).toBeGreaterThanOrEqual('2024-01-01');
            expect(logDate.toISOString().slice(0, 10)).toBeLessThanOrEqual('2024-01-02');
        });
    });

    // Add more tests for pagination, sorting, etc., later
});
