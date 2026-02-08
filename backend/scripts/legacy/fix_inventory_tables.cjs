const pg = require('pg');
require('dotenv').config();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:aj13ime1@localhost:5432/pdv_web'
});

async function run() {
  try {
    console.log('Iniciando reparo profundo da estrutura de inventário...');
    
    // 1. Tabela de Produtos (Base)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        category_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Variações de Produto (Cores, Limites, etc)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS product_variations (
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

    // 3. Estoque por Filial
    await pool.query(`
      CREATE TABLE IF NOT EXISTS product_stock (
        product_variant_id INT REFERENCES product_variations(id) ON DELETE CASCADE,
        branch_id INT DEFAULT 1,
        quantity INT DEFAULT 0,
        PRIMARY KEY (product_variant_id, branch_id)
      );
    `);

    // 4. Movimentações de Inventário
    await pool.query(`
      CREATE TABLE IF NOT EXISTS inventory_movements (
        id SERIAL PRIMARY KEY,
        product_variation_id INT REFERENCES product_variations(id),
        branch_id INT DEFAULT 1,
        quantity_change INT NOT NULL,
        reason VARCHAR(255),
        user_id UUID,
        unit_cost DECIMAL(10,2),
        quantity_remaining INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Adicionar colunas faltantes se as tabelas já existiam
    await pool.query("ALTER TABLE product_variations ADD COLUMN IF NOT EXISTS reorder_point INT DEFAULT 5;");
    await pool.query("ALTER TABLE product_variations ADD COLUMN IF NOT EXISTS lead_time_days INT DEFAULT 7;");

    console.log('✅ Estrutura de inventário pronta!');
  } catch (err) {
    console.error('❌ Erro no reparo de inventário:', err);
  } finally {
    await pool.end();
  }
}

run();
