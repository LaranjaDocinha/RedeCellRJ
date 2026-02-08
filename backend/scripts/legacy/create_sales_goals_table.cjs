const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

async function run() {
  try {
    await client.connect();
    console.log("Creating sales_goals table...");
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS sales_goals (
        id SERIAL PRIMARY KEY,
        user_id UUID REFERENCES users(id), -- Null for branch-wide goals
        branch_id INTEGER REFERENCES branches(id), -- Null for user-specific goals
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        target_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
        target_quantity INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        CHECK (user_id IS NOT NULL OR branch_id IS NOT NULL) -- Must be tied to user or branch
      );
    `);
    console.log("Table sales_goals created!");
  } catch (e) {
    console.error("Error creating table:", e);
  } finally {
    await client.end();
  }
}

run();
