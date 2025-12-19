const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

async function run() {
  try {
    await client.connect();
    console.log("Creating payment_gateways table...");
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS payment_gateways (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        type VARCHAR(50) NOT NULL, -- e.g., 'credit_card', 'pix', 'boleto'
        config JSONB, -- API keys, endpoints, etc.
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Table payment_gateways created!");
  } catch (e) {
    console.error("Error creating table:", e);
  } finally {
    await client.end();
  }
}

run();
