const pg = require('pg');
require('dotenv').config();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:aj13ime1@localhost:5432/pdv_web'
});

async function run() {
  try {
    console.log('Ajustando tabelas para Kanban...');
    
    // 1. Garantir colunas em kanban_columns
    await pool.query(`
      ALTER TABLE kanban_columns ADD COLUMN IF NOT EXISTS wip_limit INTEGER DEFAULT -1;
    `);

    // 2. Garantir colunas em kanban_cards
    await pool.query(`
      ALTER TABLE kanban_cards ADD COLUMN IF NOT EXISTS priority VARCHAR(20) DEFAULT 'normal';
      ALTER TABLE kanban_cards ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]'::jsonb;
      ALTER TABLE kanban_cards ADD COLUMN IF NOT EXISTS assignee_id UUID REFERENCES users(id) ON DELETE SET NULL;
    `);

    // 3. Popular colunas iniciais se estiver vazio
    const colCount = await pool.query('SELECT COUNT(*) FROM kanban_columns');
    if (parseInt(colCount.rows[0].count) === 0) {
        console.log('Populando colunas iniciais do Kanban...');
        await pool.query(`
            INSERT INTO kanban_columns (title, position, is_system) VALUES
            ('Triagem', 0, true),
            ('Em Reparo', 1, true),
            ('Testes / QA', 2, true),
            ('Finalizado', 3, true);
        `);
    }

    console.log('✅ Kanban ajustado com sucesso!');
  } catch (err) {
    console.error('❌ Erro:', err.message);
  } finally {
    await pool.end();
  }
}

run();
