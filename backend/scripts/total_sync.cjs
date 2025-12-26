const pg = require('pg');
require('dotenv').config();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:aj13ime1@localhost:5432/pdv_web'
});

async function sync() {
  try {
    console.log('🚀 Iniciando Sincronização Total do Banco de Dados...');

    const queries = [
      // 1. Branding
      `CREATE TABLE IF NOT EXISTS branding_settings (
        id SERIAL PRIMARY KEY,
        franchise_id INT,
        logo_url TEXT,
        primary_color VARCHAR(20) DEFAULT '#1976d2',
        secondary_color VARCHAR(20) DEFAULT '#9c27b0',
        company_name VARCHAR(255) DEFAULT 'RedeCellRJ',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );`,

      // 2. Products & Variations (Onde estava dando erro)
      `CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        category_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );`,
      
      `CREATE TABLE IF NOT EXISTS product_variations (
        id SERIAL PRIMARY KEY,
        product_id INT REFERENCES products(id) ON DELETE CASCADE,
        sku VARCHAR(100) UNIQUE
      );`,

      // Adicionar colunas uma a uma para garantir
      "ALTER TABLE product_variations ADD COLUMN IF NOT EXISTS color VARCHAR(50);",
      "ALTER TABLE product_variations ADD COLUMN IF NOT EXISTS storage_capacity VARCHAR(50);",
      "ALTER TABLE product_variations ADD COLUMN IF NOT EXISTS price DECIMAL(10,2) DEFAULT 0;",
      "ALTER TABLE product_variations ADD COLUMN IF NOT EXISTS low_stock_threshold INT DEFAULT 10;",
      "ALTER TABLE product_variations ADD COLUMN IF NOT EXISTS reorder_point INT DEFAULT 5;",
      "ALTER TABLE product_variations ADD COLUMN IF NOT EXISTS lead_time_days INT DEFAULT 7;",

      // 3. Stock
      `CREATE TABLE IF NOT EXISTS product_stock (
        product_variant_id INT REFERENCES product_variations(id) ON DELETE CASCADE,
        branch_id INT DEFAULT 1,
        quantity INT DEFAULT 0,
        PRIMARY KEY (product_variant_id, branch_id)
      );`,

      // 4. Sales & Items
      `CREATE TABLE IF NOT EXISTS sales (
        id SERIAL PRIMARY KEY,
        total_amount DECIMAL(10,2) NOT NULL,
        sale_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        user_id UUID,
        customer_id INT,
        branch_id INT DEFAULT 1
      );`,

      `CREATE TABLE IF NOT EXISTS sale_items (
        id SERIAL PRIMARY KEY,
        sale_id INT REFERENCES sales(id) ON DELETE CASCADE,
        variation_id INT,
        quantity INT NOT NULL,
        unit_price DECIMAL(10,2) NOT NULL,
        cost_price DECIMAL(10,2) DEFAULT 0
      );`,

      // 5. Dashboard Settings
      `CREATE TABLE IF NOT EXISTS user_dashboard_settings (
        user_id UUID PRIMARY KEY,
        settings JSONB NOT NULL DEFAULT '{}'::jsonb,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );`
    ];

    for (const q of queries) {
      try {
        await pool.query(q);
      } catch (e) {
        console.warn(`⚠️  Aviso na query [\${q.substring(0, 30)}...]: \${e.message}`);
      }
    }

    // Inserir um registro de branding se não houver nenhum
    await pool.query("INSERT INTO branding_settings (company_name) SELECT 'RedeCellRJ' WHERE NOT EXISTS (SELECT 1 FROM branding_settings);");

    console.log('✅ Banco de dados sincronizado com sucesso!');
  } catch (err) {
    console.error('❌ Erro crítico na sincronização:', err);
  } finally {
    await pool.end();
  }
}

sync();
