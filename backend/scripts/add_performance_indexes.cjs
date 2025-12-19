const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

async function run() {
  try {
    await client.connect();
    console.log("Adding performance indexes...");

    // sales table
    await client.query(`CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sales_customer_id ON sales (customer_id);`);
    await client.query(`CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sales_sale_date ON sales (sale_date);`);
    await client.query(`CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sales_user_id ON sales (user_id);`);
    
    // sale_items table
    await client.query(`CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sale_items_variation_id ON sale_items (variation_id);`);
    
    // product_variations table
    await client.query(`CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_product_variations_product_id ON product_variations (product_id);`);
    await client.query(`CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_product_variations_id ON product_variations (id);`); // Used in joins

    // products table
    await client.query(`CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_id ON products (id);`); // Used in joins

    // product_stock table
    await client.query(`CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_product_stock_product_variant_id ON product_stock (product_variant_id);`);
    await client.query(`CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_product_stock_branch_id ON product_stock (branch_id);`);

    // customers table
    await client.query(`CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_customers_id ON customers (id);`);
    
    // users table
    await client.query(`CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_id ON users (id);`);

    console.log("Performance indexes added successfully!");
  } catch (e) {
    console.error("Error adding indexes:", e);
  } finally {
    await client.end();
  }
}

run();
