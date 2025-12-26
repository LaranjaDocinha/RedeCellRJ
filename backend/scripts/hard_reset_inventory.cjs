const pg = require('pg');
require('dotenv').config();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:aj13ime1@localhost:5432/pdv_web'
});

async function hardReset() {
  try {
    console.log('🔥 Iniciando Hard Reset das tabelas de produtos para sincronização...');
    
    // Deletar tabelas dependentes primeiro
    await pool.query("DROP TABLE IF EXISTS sale_items CASCADE;");
    await pool.query("DROP TABLE IF EXISTS product_stock CASCADE;");
    await pool.query("DROP TABLE IF EXISTS inventory_movements CASCADE;");
    await pool.query("DROP TABLE IF EXISTS product_variations CASCADE;");
    await pool.query("DROP TABLE IF EXISTS products CASCADE;");

    console.log('🧹 Tabelas removidas. Recriando estrutura correta...');

    // 1. Products
    await pool.query(`
      CREATE TABLE products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        category_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Product Variations (Garantindo color, low_stock_threshold, etc)
    await pool.query(`
      CREATE TABLE product_variations (
        id SERIAL PRIMARY KEY,
        product_id INT REFERENCES products(id) ON DELETE CASCADE,
        color VARCHAR(50),
        storage_capacity VARCHAR(50),
        sku VARCHAR(100) UNIQUE,
        price DECIMAL(10,2) DEFAULT 0,
        low_stock_threshold INT DEFAULT 10,
        reorder_point INT DEFAULT 5,
        lead_time_days INT DEFAULT 7,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 3. Product Stock
    await pool.query(`
      CREATE TABLE product_stock (
        product_variant_id INT REFERENCES product_variations(id) ON DELETE CASCADE,
        branch_id INT DEFAULT 1,
        quantity INT DEFAULT 0,
        PRIMARY KEY (product_variant_id, branch_id)
      );
    `);

    // 4. Sale Items (Necessário para o Dashboard)
    await pool.query(`
      CREATE TABLE sale_items (
        id SERIAL PRIMARY KEY,
        sale_id INT REFERENCES sales(id) ON DELETE CASCADE,
        variation_id INT REFERENCES product_variations(id),
        quantity INT NOT NULL,
        unit_price DECIMAL(10,2) NOT NULL,
        cost_price DECIMAL(10,2) DEFAULT 0
      );
    `);

    console.log('✅ Estrutura recriada com perfeição!');
  } catch (err) {
    console.error('❌ Erro no Hard Reset:', err);
  } finally {
    await pool.end();
  }
}

hardReset();
