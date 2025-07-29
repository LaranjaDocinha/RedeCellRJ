const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });

// Configuração do banco de dados
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

console.log('DB Connection (migrate.js): ', {
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

const consolidatedSchemaPath = path.join(__dirname, 'database', 'schema_consolidated.sql');

async function resetDatabase() {
  const client = await pool.connect();
  try {
    console.log('Starting database reset...');
    
    // Lê o schema consolidado
    const sql = fs.readFileSync(consolidatedSchemaPath, 'utf8');
    
    // Executa o script SQL. O script já contém os comandos DROP TABLE.
    await client.query(sql);
    
    console.log('Database has been successfully reset with the consolidated schema.');
    console.log("A user 'admin@pdv.com' with password 'admin123' has been created.");

  } catch (error) {
    console.error('Failed to reset database:', error);
    process.exit(1); // Encerra com erro se a recriação falhar
  } finally {
    client.release();
  }
}

async function main() {
  await resetDatabase();
  await pool.end();
}

main().catch(err => {
  console.error("An unexpected error occurred during the process:", err);
  process.exit(1);
});
