const pg = require('pg');
require('dotenv').config();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:aj13ime1@localhost:5432/pdv_web'
});

async function run() {
  try {
    console.log('Ajustando tabelas para Fluxo de Caixa...');
    
    // 1. Criar purchase_orders se não existir
    await pool.query(`
      CREATE TABLE IF NOT EXISTS purchase_orders (
        id SERIAL PRIMARY KEY,
        supplier_id INTEGER REFERENCES suppliers(id) ON DELETE SET NULL,
        branch_id INTEGER REFERENCES branches(id) ON DELETE SET NULL,
        status VARCHAR(50) DEFAULT 'pending',
        total_amount DECIMAL(10, 2) DEFAULT 0,
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Criar purchase_order_items se não existir
    await pool.query(`
      CREATE TABLE IF NOT EXISTS purchase_order_items (
        id SERIAL PRIMARY KEY,
        purchase_order_id INTEGER REFERENCES purchase_orders(id) ON DELETE CASCADE,
        product_variation_id INTEGER REFERENCES product_variations(id) ON DELETE SET NULL,
        quantity INTEGER NOT NULL,
        unit_price DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 3. Adicionar branch_id em expense_reimbursements
    await pool.query(`
      ALTER TABLE expense_reimbursements ADD COLUMN IF NOT EXISTS branch_id INTEGER REFERENCES branches(id) ON DELETE SET NULL;
    `);

    console.log('✅ Banco de dados ajustado com sucesso!');
  } catch (err) {
    console.error('❌ Erro:', err.message);
  } finally {
    await pool.end();
  }
}

run();
