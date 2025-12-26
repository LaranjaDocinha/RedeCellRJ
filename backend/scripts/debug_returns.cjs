const pg = require('pg');
require('dotenv').config();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:aj13ime1@localhost:5432/pdv_web'
});

async function debug() {
  try {
    console.log('Testando query de devoluções...');
    const { rows } = await pool.query('SELECT * FROM returns ORDER BY created_at DESC');
    console.log('✅ Sucesso! Total de devoluções:', rows.length);
  } catch (err) {
    console.error('❌ ERRO NO BANCO:', err.message);
    
    // Verificar se a tabela existe
    const tableCheck = await pool.query("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'returns')");
    console.log('Tabela returns existe?', tableCheck.rows[0].exists);
    
    if (tableCheck.rows[0].exists) {
        const cols = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'returns'");
        console.log('Colunas reais no banco:', cols.rows.map(r => r.column_name));
    }
  } finally {
    await pool.end();
  }
}

debug();
