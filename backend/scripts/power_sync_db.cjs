const pg = require('pg');
require('dotenv').config();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:aj13ime1@localhost:5432/pdv_web'
});

async function powerSync() {
  try {
    console.log('Iniciando sincronização de colunas...');
    
    const alterQueries = [
      // Colunas para a tabela product_variations
      "ALTER TABLE product_variations ADD COLUMN IF NOT EXISTS color VARCHAR(50);",
      "ALTER TABLE product_variations ADD COLUMN IF NOT EXISTS price DECIMAL(10,2) DEFAULT 0;",
      "ALTER TABLE product_variations ADD COLUMN IF NOT EXISTS low_stock_threshold INT DEFAULT 10;",
      "ALTER TABLE product_variations ADD COLUMN IF NOT EXISTS reorder_point INT DEFAULT 5;",
      "ALTER TABLE product_variations ADD COLUMN IF NOT EXISTS lead_time_days INT DEFAULT 7;",
      "ALTER TABLE product_variations ADD COLUMN IF NOT EXISTS storage_capacity VARCHAR(50);",
      
      // Garantir que a tabela sales tenha as colunas corretas
      "ALTER TABLE sales ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id);",
      "ALTER TABLE sales ADD COLUMN IF NOT EXISTS customer_id INT REFERENCES customers(id);",
      "ALTER TABLE sales ADD COLUMN IF NOT EXISTS branch_id INT REFERENCES branches(id);"
    ];

    for (const q of alterQueries) {
      try {
        await pool.query(q);
      } catch (e) {
        console.log(`Nota: Erro ignorado ou coluna já existe: ${e.message}`);
      }
    }

    console.log('✅ Banco de dados sincronizado!');
  } catch (err) {
    console.error('❌ Erro fatal:', err);
  } finally {
    await pool.end();
  }
}

powerSync();
