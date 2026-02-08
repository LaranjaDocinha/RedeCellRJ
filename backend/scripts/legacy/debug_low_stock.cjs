const pg = require('pg');
require('dotenv').config();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:aj13ime1@localhost:5432/pdv_web'
});

async function debug() {
  try {
    console.log('Testando query de low-stock...');
    const { rows } = await pool.query(`
      SELECT
        p.id AS product_id,
        p.name,
        ps.quantity AS stock_quantity,
        pv.low_stock_threshold
       FROM product_stock ps
       JOIN product_variations pv ON ps.product_variant_id = pv.id
       JOIN products p ON pv.product_id = p.id
       LIMIT 1
    `);
    console.log('Resultado:', rows);
  } catch (err) {
    console.error('❌ ERRO NA QUERY:', err.message);
    
    // Listar colunas da tabela product_stock
    const cols = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'product_stock'");
    console.log('Colunas de product_stock:', cols.rows.map(r => r.column_name));
  } finally {
    await pool.end();
  }
}

debug();
