const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

async function run() {
  try {
    await client.connect();
    console.log("Creating loyalty_tiers table and adding loyalty_tier_id to customers...");
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS loyalty_tiers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        min_points INTEGER NOT NULL DEFAULT 0,
        benefits JSONB, -- e.g., { "discount": 0.05, "free_shipping": true }
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      ALTER TABLE customers ADD COLUMN IF NOT EXISTS loyalty_tier_id INTEGER REFERENCES loyalty_tiers(id);
      ALTER TABLE customers ADD COLUMN IF NOT EXISTS loyalty_tier_updated_at TIMESTAMP WITH TIME ZONE;
    `);
    console.log("Tables loyalty_tiers created and customers updated!");
  } catch (e) {
    console.error("Error creating tables:", e);
  } finally {
    await client.end();
  }
}

run();
