const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

async function run() {
  try {
    await client.connect();
    console.log("Adding visual_condition to service_orders...");
    await client.query("ALTER TABLE service_orders ADD COLUMN IF NOT EXISTS visual_condition JSONB;");
    console.log("Column added!");
  } catch (e) {
    console.error("Error:", e);
  } finally {
    await client.end();
  }
}

run();
