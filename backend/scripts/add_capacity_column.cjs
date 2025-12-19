const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

async function run() {
  try {
    await client.connect();
    console.log("Adding storage_capacity column...");
    await client.query("ALTER TABLE product_variations ADD COLUMN IF NOT EXISTS storage_capacity VARCHAR(50);");
    console.log("Column added successfully!");
  } catch (e) {
    console.error("Error adding column:", e);
  } finally {
    await client.end();
  }
}

run();
