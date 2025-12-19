const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

async function run() {
  try {
    await client.connect();
    console.log("Adding 2FA columns to users table...");
    
    await client.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS two_factor_secret VARCHAR(255);");
    await client.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT FALSE;");
    
    console.log("2FA columns added to users table!");
  } catch (e) {
    console.error("Error adding 2FA columns:", e);
  } finally {
    await client.end();
  }
}

run();
