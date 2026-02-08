const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

async function run() {
  try {
    await client.connect();
    console.log("Adding marketplace columns to sales table...");
    
    await client.query("ALTER TABLE sales ADD COLUMN IF NOT EXISTS external_order_id VARCHAR(255) UNIQUE;");
    await client.query("ALTER TABLE sales ADD COLUMN IF NOT EXISTS marketplace_integration_id INTEGER REFERENCES marketplace_integrations(id);");
    
    console.log("Marketplace columns added to sales table!");
  } catch (e) {
    console.error("Error adding columns:", e);
  } finally {
    await client.end();
  }
}

run();
