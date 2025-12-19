const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

async function run() {
  try {
    await client.connect();
    console.log("Creating api_keys table...");
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS api_keys (
        id SERIAL PRIMARY KEY,
        key VARCHAR(64) NOT NULL UNIQUE, -- Hashed API key
        user_id UUID REFERENCES users(id), -- Owner of the API key
        name VARCHAR(100) NOT NULL, -- Human-readable name for the key
        permissions JSONB, -- { "products": ["read", "write"], "customers": ["read"] }
        expires_at TIMESTAMP WITH TIME ZONE,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Table api_keys created!");
  } catch (e) {
    console.error("Error creating table:", e);
  } finally {
    await client.end();
  }
}

run();
