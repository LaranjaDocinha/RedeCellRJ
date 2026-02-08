const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

async function run() {
  try {
    await client.connect();
    console.log("Creating user_keybinds table...");
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_keybinds (
        id SERIAL PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES users(id),
        action_name VARCHAR(100) NOT NULL,
        key_combination VARCHAR(50) NOT NULL,
        context VARCHAR(50) DEFAULT 'global', -- 'pos', 'dashboard', 'global'
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, action_name, context)
      );
    `);
    console.log("Table user_keybinds created!");
  } catch (e) {
    console.error("Error:", e);
  } finally {
    await client.end();
  }
}

run();
