const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

async function run() {
  try {
    await client.connect();
    console.log("Adding is_serialized to products...");
    await client.query("ALTER TABLE products ADD COLUMN IF NOT EXISTS is_serialized BOOLEAN DEFAULT FALSE;");
    console.log("Column added!");
  } catch (e) {
    console.error("Error:", e);
  } finally {
    await client.end();
  }
}

run();
