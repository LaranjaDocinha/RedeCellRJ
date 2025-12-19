const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

async function run() {
  try {
    await client.connect();
    console.log("Creating ip_whitelist table...");
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS ip_whitelist (
        id SERIAL PRIMARY KEY,
        ip_address VARCHAR(45) NOT NULL UNIQUE, -- IPv4 or IPv6
        description VARCHAR(255),
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Table ip_whitelist created!");
  } catch (e) {
    console.error("Error creating table:", e);
  } finally {
    await client.end();
  }
}

run();
