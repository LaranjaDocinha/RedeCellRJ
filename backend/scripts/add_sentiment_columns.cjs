const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

async function run() {
  try {
    await client.connect();
    console.log("Adding sentiment columns to satisfaction_surveys table...");
    
    await client.query("ALTER TABLE satisfaction_surveys ADD COLUMN IF NOT EXISTS sentiment_score DECIMAL(5, 2);");
    await client.query("ALTER TABLE satisfaction_surveys ADD COLUMN IF NOT EXISTS sentiment_label VARCHAR(50);"); // e.g., 'Positive', 'Negative', 'Neutral'
    
    console.log("Sentiment columns added to satisfaction_surveys table!");
  } catch (e) {
    console.error("Error adding columns:", e);
  } finally {
    await client.end();
  }
}

run();
