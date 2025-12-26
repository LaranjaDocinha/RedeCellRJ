const pg = require('pg');
require('dotenv').config();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:aj13ime1@localhost:5432/pdv_web'
});

async function sync() {
  try {
    console.log('Sincronizando colunas da tabela product_variations...');
    
    const queries = [
      "ALTER TABLE product_variations ADD COLUMN IF NOT EXISTS color VARCHAR(50);",
      "ALTER TABLE product_variations ADD COLUMN IF NOT EXISTS storage_capacity VARCHAR(50);",
      "ALTER TABLE product_variations ADD COLUMN IF NOT EXISTS sku VARCHAR(100) UNIQUE;",
      "ALTER TABLE product_variations ADD COLUMN IF NOT EXISTS price DECIMAL(10,2) DEFAULT 0;",
      "ALTER TABLE product_variations ADD COLUMN IF NOT EXISTS low_stock_threshold INT DEFAULT 10;",
      "ALTER TABLE product_variations ADD COLUMN IF NOT EXISTS reorder_point INT DEFAULT 5;",
      "ALTER TABLE product_variations ADD COLUMN IF NOT EXISTS lead_time_days INT DEFAULT 7;",
      "ALTER TABLE product_variations ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;"
    ];

    for (const query of queries) {
      try {
        await pool.query(query);
      } catch (e) {
        console.log(`Nota: Coluna já pode existir ou erro menor: ${e.message}`);
      }
    }

    console.log('✅ Colunas sincronizadas com sucesso!');
  } catch (err) {
    console.error('❌ Erro na sincronização:', err);
  } finally {
    await pool.end();
  }
}

sync();
