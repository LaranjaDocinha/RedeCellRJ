const pg = require('pg');
require('dotenv').config();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:aj13ime1@localhost:5432/pdv_web'
});

async function fix() {
  try {
    console.log('Criando tabela user_dashboard_settings...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_dashboard_settings (
        user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        settings JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Tabela criada com sucesso!');
  } catch (err) {
    console.error('Erro ao criar tabela user_dashboard_settings:', err.message);
    console.error('Stack trace:', err.stack);
  } finally {
    try {
      await pool.end();
      console.log('Conexão com o banco de dados encerrada.');
    } catch (closeErr) {
      console.error('Erro ao encerrar conexão com o banco:', closeErr.message);
    }
  }
}

fix();
