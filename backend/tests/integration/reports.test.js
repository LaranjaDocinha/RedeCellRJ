const request = require('supertest');
const app = require('../../index'); // Assuming your Express app is exported from index.js
const db = require('../../db'); // Assuming your database connection is exported from db.js

describe('Reports API', () => {
    let productId;
    let customerId;
    let saleId;

    beforeAll(async () => {
        // Create dummy data for testing reports
        const productRes = await db.query('INSERT INTO products (name, description, branch_id) VALUES ($1, $2, $3) RETURNING id', ['Report Product', 'Description', 1]);
        productId = productRes.rows[0].id;

        const customerRes = await db.query('INSERT INTO customers (name, email, branch_id) VALUES ($1, $2, $3) RETURNING id', ['Report Customer', 'report@example.com', 1]);
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

    describe('Technician Performance Report', () => {
        let technicianId;
        let repairId1;
        let repairId2;

        beforeAll(async () => {
            // Create a test technician
            const techRes = await db.query("INSERT INTO technicians (name, branch_id) VALUES ($1, $2) RETURNING id", ['Test Tech', 1]);
            technicianId = techRes.rows[0].id;

            // Create test repairs assigned to the technician
            const repair1Res = await db.query(
                "INSERT INTO repairs (customer_id, description, status, created_at, updated_at, technician_id, final_cost) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id",
                [customerId, 'Screen repair', 'Completed', '2024-01-10T10:00:00Z', '2024-01-10T12:30:00Z', technicianId, 150.00]
            );
            repairId1 = repair1Res.rows[0].id;

            const repair2Res = await db.query(
                "INSERT INTO repairs (customer_id, description, status, created_at, updated_at, technician_id, final_cost) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id",
                [customerId, 'Battery replacement', 'Completed', '2024-01-12T14:00:00Z', '2024-01-12T15:00:00Z', technicianId, 80.00]
            );
            repairId2 = repair2Res.rows[0].id;
        });

        afterAll(async () => {
            // Clean up test data
            await db.query("DELETE FROM repairs WHERE id = ANY($1::int[])", [[repairId1, repairId2]]);
            await db.query("DELETE FROM technicians WHERE id = $1", [technicianId]);
        });

        it('should fetch technician performance report successfully', async () => {
            const res = await request(app)
                .get('/api/reports/technician-performance')
                .query({ startDate: '2024-01-01', endDate: '2024-01-31' });

            expect(res.statusCode).toEqual(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBeGreaterThanOrEqual(1);

            const techData = res.body.find(t => t.technician_id === technicianId);
            expect(techData).toBeDefined();
            expect(techData).toHaveProperty('technician_name', 'Test Tech');
            expect(techData).toHaveProperty('total_repairs', '2');
            expect(techData).toHaveProperty('total_revenue', '230.00'); // 150 + 80
            expect(techData).toHaveProperty('average_repair_time_minutes');
            expect(parseFloat(techData.average_repair_time_minutes)).toBe(105); // (2.5 * 60 + 1 * 60) / 2 = (150 + 60) / 2 = 105
        });
    });
});
