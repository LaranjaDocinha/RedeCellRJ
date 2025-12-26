const pg = require('pg');
require('dotenv').config();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:aj13ime1@localhost:5432/pdv_web'
});

async function run() {
  try {
    console.log('Criando tabelas de contas a pagar e receber...');
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS accounts_payable (
        id SERIAL PRIMARY KEY,
        supplier_id INTEGER REFERENCES suppliers(id) ON DELETE SET NULL,
        branch_id INTEGER REFERENCES branches(id) ON DELETE SET NULL,
        description TEXT NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        due_date TIMESTAMP WITH TIME ZONE NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        paid_date TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS accounts_receivable (
        id SERIAL PRIMARY KEY,
        customer_id INTEGER REFERENCES customers(id) ON DELETE SET NULL,
        branch_id INTEGER REFERENCES branches(id) ON DELETE SET NULL,
        description TEXT NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        due_date TIMESTAMP WITH TIME ZONE NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        received_date TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('✅ Banco de dados ajustado com sucesso!');
  } catch (err) {
    console.error('❌ Erro:', err.message);
  } finally {
    await pool.end();
  }
}

run();
