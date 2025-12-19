const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

async function run() {
  try {
    await client.connect();
    console.log("Creating serialized_items table...");
    // Criar a tabela serialized_items primeiro se ela não existir
    await client.query(`
      CREATE TABLE IF NOT EXISTS serialized_items (
        id SERIAL PRIMARY KEY,
        serial_number VARCHAR(255) NOT NULL,
        product_variation_id INTEGER NOT NULL REFERENCES product_variations(id),
        branch_id INTEGER NOT NULL REFERENCES branches(id),
        status VARCHAR(50) NOT NULL DEFAULT 'in_stock',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(serial_number) -- Assume serial number is unique globally for now
      );
    `);
    console.log("Table serialized_items created/verified.");

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
    console.error("Error creating tables:", e);
  } finally {
    await client.end();
  }
}

run();
