const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

async function run() {
  try {
    await client.connect();
    console.log("Creating serialized_items_history table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS serialized_items_history (
        id SERIAL PRIMARY KEY,
        serialized_item_id INTEGER REFERENCES serialized_items(id),
        action VARCHAR(50) NOT NULL, -- 'entry', 'sale', 'return', 'rma'
        old_status VARCHAR(50),
        new_status VARCHAR(50),
        user_id INTEGER, -- REFERENCES users(id) but keeping it loose for now
        details JSONB, -- Store related IDs (sale_id, rma_id)
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Table serialized_items_history created!");
  } catch (e) {
    console.error("Error creating table:", e);
  } finally {
    await client.end();
  }
}

run();
