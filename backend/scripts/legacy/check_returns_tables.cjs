const pg = require('pg');
require('dotenv').config();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:aj13ime1@localhost:5432/pdv_web'
});

async function checkReturnsTables() {
  try {
    console.log('--- Verificando Tabelas de Devolução ---');
    const tables = ['returns', 'return_items'];
    
    for (const table of tables) {
      const res = await pool.query("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = $1);", [table]);
      console.log('Tabela ' + table + ' existe? ' + res.rows[0].exists);
      
      if (res.rows[0].exists) {
          const cols = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = $1", [table]);
          console.log('Colunas de ' + table + ':', cols.rows.map(r => r.column_name));
      }
    }
    
  } catch (err) {
    console.error('Erro no diagnóstico:', err.message);
  } finally {
    await pool.end();
  }
}

checkReturnsTables();
