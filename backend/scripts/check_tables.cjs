const pg = require('pg');
require('dotenv').config();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:aj13ime1@localhost:5432/pdv_web'
});

async function checkTables() {
  try {
    console.log('--- Verificando Tabelas ---');
    const tables = ['settings', 'product_stock', 'products', 'product_variations', 'sales', 'branding_settings'];
    
    for (const table of tables) {
      const res = await pool.query("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = $1);", [table]);
      console.log('Tabela ' + table + ' existe? ' + res.rows[0].exists);
    }
    
  } catch (err) {
    console.error('Erro no diagnóstico:', err.message);
  } finally {
    await pool.end();
  }
}

checkTables();