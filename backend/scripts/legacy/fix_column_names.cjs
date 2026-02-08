const pg = require('pg');
require('dotenv').config();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:aj13ime1@localhost:5432/pdv_web'
});

async function renameColumn() {
  try {
    console.log('Sincronizando nomes de colunas no banco de dados...');
    
    // Renomear na product_stock se existir como variant
    await pool.query("ALTER TABLE product_stock RENAME COLUMN product_variant_id TO product_variation_id;").catch(e => console.log('Nota: Coluna já pode estar com o nome correto ou tabela não existe.'));
    
    console.log('✅ Banco de dados sincronizado!');
  } catch (err) {
    console.error('❌ Erro na sincronização:', err.message);
  } finally {
    await pool.end();
  }
}

renameColumn();
