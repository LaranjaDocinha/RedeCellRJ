const pg = require('pg');
require('dotenv').config();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:aj13ime1@localhost:5432/pdv_web'
});

async function testQuery() {
  try {
    console.log('Testando query exata do inventoryService...');
    const threshold = 10;
    const { rows } = await pool.query(
      `SELECT
        p.id AS product_id,
        p.name,
        ps.quantity AS stock_quantity,
        pv.low_stock_threshold
       FROM product_stock ps
       JOIN product_variations pv ON ps.product_variant_id = pv.id
       JOIN products p ON pv.product_id = p.id
       WHERE ps.quantity <= $1 OR ps.quantity <= pv.low_stock_threshold
       ORDER BY ps.quantity ASC`,
      [threshold],
    );
    console.log('✅ Query executada com sucesso! Linhas retornadas:', rows.length);
  } catch (err) {
    console.error('❌ ERRO NA QUERY:', err.message);
    console.error('Stack:', err.stack);
  } finally {
    await pool.end();
  }
}

testQuery();
