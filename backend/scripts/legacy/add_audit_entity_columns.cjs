const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

async function run() {
  try {
    await client.connect();
    console.log("Adding entity_type and entity_id to audit_logs table...");
    
    await client.query("ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS entity_type VARCHAR(100);");
    await client.query("ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS entity_id VARCHAR(255);"); // entity_id can be UUID or INTEGER
    
    console.log("Columns entity_type and entity_id added to audit_logs table!");
  } catch (e) {
    console.error("Error adding columns:", e);
  } finally {
    await client.end();
  }
}

run();
