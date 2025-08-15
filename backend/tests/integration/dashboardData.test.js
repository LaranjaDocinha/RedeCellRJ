const request = require('supertest');
const app = require('../../index'); // Assuming your Express app is exported from index.js
const db = require('../../db'); // Assuming your database connection is exported from db.js

describe('BI Dashboard Data API', () => {
    let productId1, productId2;
    let customerId;
    let saleId1, saleId2;
    let categoryId1, categoryId2;

    beforeAll(async () => {
        // Create dummy data for testing dashboard reports
        const productRes1 = await db.query('INSERT INTO products (name, description, price) VALUES ($1, $2, $3) RETURNING id', ['Product A', 'Desc A', 10.00]);
        productId1 = productRes1.rows[0].id;
        const productRes2 = await db.query('INSERT INTO products (name, description, price) VALUES ($1, $2, $3) RETURNING id', ['Product B', 'Desc B', 20.00]);
        productId2 = productRes2.rows[0].id;

        const customerRes = await db.query('INSERT INTO customers (name, email) VALUES ($1, $2) RETURNING id', ['Dashboard Customer', 'dashboard@example.com']);
        customerId = customerRes.rows[0].id;

        const categoryRes1 = await db.query('INSERT INTO categories (name) VALUES ($1) RETURNING id', ['Category X']);
        categoryId1 = categoryRes1.rows[0].id;
        const categoryRes2 = await db.query('INSERT INTO categories (name) VALUES ($1) RETURNING id', ['Category Y']);
        categoryId2 = categoryRes2.rows[0].id;

        // Update products with categories
        await db.query('UPDATE products SET category_id = $1 WHERE id = $2', [categoryId1, productId1]);
        await db.query('UPDATE products SET category_id = $1 WHERE id = $2', [categoryId2, productId2]);

        const saleRes1 = await db.query(
            'INSERT INTO sales (customer_id, total_amount, sale_date) VALUES ($1, $2, $3) RETURNING id'
            ,
            [customerId, 30.00, '2024-01-10']
        );
        saleId1 = saleRes1.rows[0].id;

        await db.query(
            'INSERT INTO sale_items (sale_id, product_id, product_name, quantity, price_at_sale, cost_at_sale) VALUES ($1, $2, $3, $4, $5, $6)',
            [saleId1, productId1, 'Product A', 1, 10.00, 5.00]
        );
        await db.query(
            'INSERT INTO sale_items (sale_id, product_id, product_name, quantity, price_at_sale, cost_at_sale) VALUES ($1, $2, $3, $4, $5, $6)',
            [saleId1, productId2, 'Product B', 1, 20.00, 10.00]
        );

        const saleRes2 = await db.query(
            'INSERT INTO sales (customer_id, total_amount, sale_date) VALUES ($1, $2, $3) RETURNING id'
            ,
            [customerId, 10.00, '2024-01-15']
        );
        saleId2 = saleRes2.rows[0].id;

        await db.query(
            'INSERT INTO sale_items (sale_id, product_id, product_name, quantity, price_at_sale, cost_at_sale) VALUES ($1, $2, $3, $4, $5, $6)',
            [saleId2, productId1, 'Product A', 1, 10.00, 5.00]
        );
    });

    afterAll(async () => {
        // Clean up after all tests are done
        await db.query('DELETE FROM sale_items WHERE sale_id IN ($1, $2)', [saleId1, saleId2]);
        await db.query('DELETE FROM sales WHERE id IN ($1, $2)', [saleId1, saleId2]);
        await db.query('DELETE FROM products WHERE id IN ($1, $2)', [productId1, productId2]);
        await db.query('DELETE FROM customers WHERE id = $1', [customerId]);
        await db.query('DELETE FROM categories WHERE id IN ($1, $2)', [categoryId1, categoryId2]);
        await db.end();
    });

    it('should fetch top products by quantity', async () => {
        const res = await request(app)
            .get('/api/dashboard/top-products')
            .query({ startDate: '2024-01-01', endDate: '2024-01-31', orderBy: 'quantity', limit: 1 });

        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toEqual(1);
        expect(res.body[0].product_name).toEqual('Product A');
        expect(res.body[0].total_quantity_sold).toEqual(2);
    });

    it('should fetch sales by category', async () => {
        const res = await request(app)
            .get('/api/dashboard/sales-by-category')
            .query({ startDate: '2024-01-01', endDate: '2024-01-31', });

        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThanOrEqual(2);
        expect(res.body.some(cat => cat.category_name === 'Category X' && cat.total_sales_amount === 20)).toBe(true);
        expect(res.body.some(cat => cat.category_name === 'Category Y' && cat.total_sales_amount === 20)).toBe(true);
    });

    it('should fetch sales trends by day', async () => {
        const res = await request(app)
            .get('/api/dashboard/sales-trends')
            .query({ startDate: '2024-01-01', endDate: '2024-01-31', interval: 'day' });

        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThanOrEqual(2);
        expect(res.body.some(trend => trend.period.startsWith('2024-01-10') && trend.total_sales === 30)).toBe(true);
        expect(res.body.some(trend => trend.period.startsWith('2024-01-15') && trend.total_sales === 10)).toBe(true);
    });
});
