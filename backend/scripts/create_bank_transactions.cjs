const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

async function run() {
  try {
    await client.connect();
    console.log("Creating bank_transactions table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS bank_transactions (
        id SERIAL PRIMARY KEY,
        fitid VARCHAR(255) UNIQUE NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        description TEXT,
        transaction_date DATE NOT NULL,
        status VARCHAR(50) DEFAULT 'pending', -- pending, reconciled, ignored
        related_entity_type VARCHAR(50), -- sale, expense
        related_entity_id INTEGER,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Table bank_transactions created!");
  } catch (e) {
    console.error("Error creating table:", e);
  } finally {
    await client.end();
  }
}

run();
