const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

async function run() {
  try {
    await client.connect();
    console.log("Creating satisfaction_surveys table...");
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS satisfaction_surveys (
        id SERIAL PRIMARY KEY,
        sale_id UUID NOT NULL REFERENCES sales(id), -- Changed to UUID
        customer_id UUID REFERENCES customers(id), -- Changed to UUID
        score INTEGER, -- e.g., 1 to 5
        comments TEXT,
        sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP WITH TIME ZONE,
        UNIQUE(sale_id) -- One survey per sale
      );
    `);
    console.log("Table satisfaction_surveys created!");
  } catch (e) {
    console.error("Error creating table:", e);
  } finally {
    await client.end();
  }
}

run();
