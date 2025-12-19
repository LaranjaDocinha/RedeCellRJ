const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

async function run() {
  try {
    await client.connect();
    console.log("Adding metadata to sale_items...");
    await client.query("ALTER TABLE sale_items ADD COLUMN IF NOT EXISTS metadata JSONB;");
    console.log("Column added!");
  } catch (e) {
    console.error("Error:", e);
  } finally {
    await client.end();
  }
}

run();
