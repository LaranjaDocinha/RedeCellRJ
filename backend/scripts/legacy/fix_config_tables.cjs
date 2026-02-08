const pg = require('pg');
require('dotenv').config();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:aj13ime1@localhost:5432/pdv_web'
});

async function fix() {
  try {
    console.log('🚀 Criando tabelas de configuração e branding...');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS settings (
        id SERIAL PRIMARY KEY,
        key VARCHAR(255) UNIQUE NOT NULL,
        value TEXT NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS branding_settings (
        id SERIAL PRIMARY KEY,
        franchise_id INT,
        logo_url TEXT,
        primary_color VARCHAR(20) DEFAULT '#1976d2',
        secondary_color VARCHAR(20) DEFAULT '#9c27b0',
        company_name VARCHAR(255) DEFAULT 'RedeCellRJ',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Inserir configuração padrão para o inventário não falhar no SettingsService
    await pool.query(`
      INSERT INTO settings (key, value, description) 
      VALUES ('inventory_valuation_method', 'average_cost', 'Método de valorização de estoque padrão')
      ON CONFLICT (key) DO NOTHING;
    `);

    console.log('✅ Tabelas criadas e configuradas!');
  } catch (err) {
    console.error('❌ Erro no reparo:', err.message);
  } finally {
    await pool.end();
  }
}

fix();
