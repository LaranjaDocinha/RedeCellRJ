const pg = require('pg');
require('dotenv').config();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:aj13ime1@localhost:5432/pdv_web'
});

async function megaFix() {
  try {
    console.log('🚀 Iniciando Mega Fix (v2)...');

    const dropQueries = [
      "DROP TABLE IF EXISTS sale_items CASCADE;",
      "DROP TABLE IF EXISTS sales CASCADE;",
      "DROP TABLE IF EXISTS product_stock CASCADE;",
      "DROP TABLE IF EXISTS product_variations CASCADE;",
      "DROP TABLE IF EXISTS products CASCADE;",
      "DROP TABLE IF EXISTS inventory_movements CASCADE;"
    ];

    for (const q of dropQueries) await pool.query(q);
    console.log('🧹 Banco limpo.');

    await pool.query(`
      CREATE TABLE products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE product_variations (
        id SERIAL PRIMARY KEY,
        product_id INT REFERENCES products(id) ON DELETE CASCADE,
        color VARCHAR(50),
        price DECIMAL(10,2) DEFAULT 0,
        low_stock_threshold INT DEFAULT 10,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE product_stock (
        product_variant_id INT PRIMARY KEY REFERENCES product_variations(id) ON DELETE CASCADE,
        branch_id INT DEFAULT 1,
        quantity INT DEFAULT 0
      );

      CREATE TABLE sales (
        id SERIAL PRIMARY KEY,
        total_amount DECIMAL(10,2) NOT NULL,
        sale_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        branch_id INT DEFAULT 1
      );

      CREATE TABLE sale_items (
        id SERIAL PRIMARY KEY,
        sale_id INT REFERENCES sales(id) ON DELETE CASCADE,
        variation_id INT REFERENCES product_variations(id),
        quantity INT NOT NULL,
        unit_price DECIMAL(10,2) NOT NULL,
        cost_price DECIMAL(10,2) DEFAULT 0
      );
    `);

    console.log('🏗️ Estrutura recriada.');

    const p1 = await pool.query("INSERT INTO products (name) VALUES ('iPhone 15 Pro') RETURNING id");
    const v1 = await pool.query("INSERT INTO product_variations (product_id, color, price, low_stock_threshold) VALUES ($1, 'Natural Titanium', 7500, 5) RETURNING id", [p1.rows[0].id]);
    await pool.query("INSERT INTO product_stock (product_variant_id, quantity) VALUES ($1, 3)", [v1.rows[0].id]);

    console.log('✅ Tudo pronto!');
  } catch (err) {
    console.error('❌ Erro:', err);
  } finally {
    await pool.end();
  }
}

megaFix();
