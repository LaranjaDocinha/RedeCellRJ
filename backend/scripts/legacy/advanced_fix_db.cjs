const pg = require('pg');
require('dotenv').config();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:aj13ime1@localhost:5432/pdv_web'
});

async function advancedFix() {
  try {
    console.log('🚀 Sincronização Final...');

    // 1. Garantir colunas na tabela Users
    await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;");
    
    // 2. Garantir colunas na tabela Customers
    await pool.query("ALTER TABLE customers ADD COLUMN IF NOT EXISTS city VARCHAR(100);");
    await pool.query("ALTER TABLE customers ADD COLUMN IF NOT EXISTS state VARCHAR(50);");
    await pool.query("ALTER TABLE customers ADD COLUMN IF NOT EXISTS region VARCHAR(100);");

    // 3. Criar/Atualizar Admin
    const { rows: u } = await pool.query(`
      INSERT INTO users (name, email, password_hash, role) 
      VALUES ('Admin', 'admin@pdv.com', 'admin123', 'admin') 
      ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash 
      RETURNING id;
    `);

    // 4. Criar Cliente Padrão
    const { rows: c } = await pool.query(`
      INSERT INTO customers (name, email, city, state) 
      VALUES ('Consumidor Final', 'consumidor@teste.com', 'Rio de Janeiro', 'RJ') 
      ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name 
      RETURNING id;
    `);

    // 5. Vincular Vendas
    await pool.query("UPDATE sales SET user_id = $1, customer_id = $2 WHERE user_id IS NULL OR customer_id IS NULL;", [u[0].id, c[0].id]);

    console.log('✅ Banco de dados pronto para o Dashboard!');
  } catch (err) {
    console.error('❌ Erro:', err.message);
  } finally {
    await pool.end();
  }
}

advancedFix();
